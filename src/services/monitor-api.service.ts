import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { MonitorDistanceEntity } from '../entities/monitor-distance.entity';

interface MonitorDistanceResponse {
  fecha_desde: string;
  fecha_hasta: string;
  id_movil: number;
  patente: string;
  metros_recorridos: number;
  km_recorridos: number;
}

interface ActiveBus {
  bus: string;
  gps_id: number;
}

@Injectable()
export class MonitorApiService {
  private readonly logger = new Logger(MonitorApiService.name);
  private readonly apiUrl: string;
  private readonly usuario: string;
  private readonly contrasena: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(MonitorDistanceEntity)
    private readonly monitorDistanceRepository: Repository<MonitorDistanceEntity>,
  ) {
    this.apiUrl = this.configService.get<string>('MONITOR_API_URL') ?? '';
    this.usuario = this.configService.get<string>('MONITOR_API_USERNAME') ?? '';
    this.contrasena = this.configService.get<string>('MONITOR_API_PASSWORD') ?? '';
  }

  /**
   * Obtiene la lista de buses activos desde tms.trucks
   */
  async getActiveBuses(): Promise<ActiveBus[]> {
    try {
      const buses = await this.dataSource.query(
        `SELECT code as bus, gps_id FROM tms.trucks WHERE status = 'SI' and gps_id > 0`,
      );
      this.logger.log(`Buses activos encontrados: ${buses.length}`);
      return buses;
    } catch (error) {
      this.logger.error(`Error al obtener buses activos: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Consulta la distancia recorrida de un móvil en un rango de fechas
   */
  async fetchDistance(
    idMovil: number,
    fdesde: string,
    fhasta: string,
  ): Promise<MonitorDistanceResponse[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<MonitorDistanceResponse[]>(this.apiUrl, {
          params: {
            accion: 'TRAER_DISTANCIA',
            usuario: this.usuario,
            contrasena: this.contrasena,
            fdesde,
            fhasta,
            idmovil: idMovil,
          },
        }),
      );
      return response.data ?? [];
    } catch (error) {
      this.logger.error(
        `Error al consultar distancia para móvil ${idMovil}: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Obtiene y guarda las distancias del día anterior para todos los buses activos
   */
  async fetchAndSaveYesterdayDistances(): Promise<{
    total: number;
    saved: number;
    errors: number;
  }> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');

    const fdesde = `${year}-${month}-${day}T00:00:00`;
    const fhasta = `${year}-${month}-${day}T23:59:59`;

    this.logger.log(`Consultando distancias del ${fdesde} al ${fhasta}`);

    const buses = await this.getActiveBuses();
    let saved = 0;
    let errors = 0;

    for (const bus of buses) {
      try {
        const data = await this.fetchDistance(bus.gps_id, fdesde, fhasta);

        for (const item of data) {
          const entity = new MonitorDistanceEntity();
          entity.idMovil = item.id_movil;
          entity.busCode = bus.bus;
          entity.patente = item.patente;
          entity.fechaDesde = new Date(item.fecha_desde);
          entity.fechaHasta = new Date(item.fecha_hasta);
          entity.metrosRecorridos = item.metros_recorridos;
          entity.kmRecorridos = item.km_recorridos;

          await this.monitorDistanceRepository.save(entity);
          saved++;
        }
      } catch (error) {
        this.logger.error(
          `Error procesando bus ${bus.bus} (gps_id: ${bus.gps_id}): ${error.message}`,
        );
        errors++;
      }
    }

    this.logger.log(
      `Proceso completado — Buses: ${buses.length}, Guardados: ${saved}, Errores: ${errors}`,
    );

    return { total: buses.length, saved, errors };
  }

  /**
   * Obtiene todos los registros de distancia
   */
  async getAllDistances(): Promise<MonitorDistanceEntity[]> {
    return this.monitorDistanceRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene registros de distancia por código de bus
   */
  async getDistancesByBus(busCode: string): Promise<MonitorDistanceEntity[]> {
    return this.monitorDistanceRepository.find({
      where: { busCode },
      order: { fechaDesde: 'DESC' },
    });
  }

  /**
   * Obtiene registros de distancia por rango de fechas
   */
  async getDistancesByDateRange(
    from: string,
    to: string,
  ): Promise<MonitorDistanceEntity[]> {
    return this.monitorDistanceRepository.find({
      where: {
        fechaDesde: Between(new Date(from), new Date(to)),
      },
      order: { fechaDesde: 'DESC' },
    });
  }
}
