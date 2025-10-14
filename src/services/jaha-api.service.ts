import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { LineaStatusEntity } from '../entities/linea-status.entity';
import { RouteEntity } from '../entities/route.entity';
import { SetRouteLogEntity } from '../entities/set-route-log.entity';
import { LoginCredentialsDto } from '../dto/login-credentials.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LineaStatusDto } from '../dto/linea-status.dto';
import { LineaStatusResponseDto } from '../dto/linea-status-response.dto';
import { UnidadStatusResponseDto } from '../dto/unidad-status-response.dto';
import { RouteDto } from '../dto/route.dto';
import { RoutesResponseDto } from '../dto/routes-response.dto';
import { SetRouteRequestDto } from '../dto/set-route-request.dto';
import { SetRouteResponseDto } from '../dto/set-route-response.dto';

@Injectable()
export class JahaApiService {
  private readonly logger = new Logger(JahaApiService.name);
  private readonly apiUrl: string;
  private readonly username: string;
  private readonly password: string;
  private authToken: string | null = null;
  private tokenExpirationDate: Date | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(LineaStatusEntity)
    private readonly lineaStatusRepository: Repository<LineaStatusEntity>,
    @InjectRepository(RouteEntity)
    private readonly routeRepository: Repository<RouteEntity>,
    @InjectRepository(SetRouteLogEntity)
    private readonly setRouteLogRepository: Repository<SetRouteLogEntity>,
  ) {
    this.apiUrl = this.configService.get<string>('API_JAHA_URL') ?? '';
    this.username = this.configService.get<string>('API_JAHA_USERNAME') ?? '';
    this.password = this.configService.get<string>('API_JAHA_PASSWORD') ?? '';
  }

  /**
   * Realiza el login en la API de Jaha y guarda el token de autenticación
   * @returns Promise con la respuesta del login
   */
  async login(): Promise<LoginResponseDto> {
    try {
      const credentials: LoginCredentialsDto = {
        userName: this.username,
        password: this.password,
      };

      this.logger.log('Attempting to login to Jaha API');

      const response = await firstValueFrom(
        this.httpService.post<LoginResponseDto>(
          `${this.apiUrl}/api/api/login`,
          credentials,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // Verificar si el login fue exitoso
      if (response.data.success && response.data.data) {
        // Guardar el token y fecha de expiración para futuras peticiones
        this.authToken = response.data.data.token;
        this.tokenExpirationDate = new Date(response.data.data.expirationDate);

        this.logger.log(
          `Login successful, token stored. Expires at: ${this.tokenExpirationDate.toISOString()}`,
        );
      } else {
        this.logger.warn('Login response was not successful');
      }

      return response.data;
    } catch (error) {
      this.logger.error('Login failed', error.message);
      throw new Error(`Failed to login to Jaha API: ${error.message}`);
    }
  }

  /**
   * Obtiene el token de autenticación actual
   * @returns El token de autenticación o null si no está autenticado
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Verifica si hay un token de autenticación válido y no ha expirado
   * @returns true si hay un token válido y no ha expirado, false en caso contrario
   */
  isAuthenticated(): boolean {
    if (!this.authToken || !this.tokenExpirationDate) {
      return false;
    }

    // Verificar si el token ha expirado
    const now = new Date();
    if (now >= this.tokenExpirationDate) {
      this.logger.warn('Token has expired');
      return false;
    }

    return true;
  }

  /**
   * Obtiene la fecha de expiración del token
   * @returns La fecha de expiración o null si no hay token
   */
  getTokenExpirationDate(): Date | null {
    return this.tokenExpirationDate;
  }

  /**
   * Limpia el token de autenticación y su fecha de expiración
   */
  logout(): void {
    this.authToken = null;
    this.tokenExpirationDate = null;
    this.logger.log('Logged out, token cleared');
  }

  /**
   * Método privado para asegurar que el token sea válido antes de hacer peticiones
   * Si no hay token o ha expirado, intenta hacer login automáticamente
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated()) {
      this.logger.log('Token not valid, attempting automatic login');
      await this.login();
    }
  }

  /**
   * Obtiene el estado actual de todas las líneas de buses
   * @returns Promise con el array de estados de líneas
   */
  async getLineaStatus(): Promise<LineaStatusDto[]> {
    try {
      // Asegurar que tenemos un token válido
      await this.ensureAuthenticated();

      this.logger.log('Fetching linea status from Jaha API');

      const response = await firstValueFrom(
        this.httpService.get<LineaStatusResponseDto>(
          `${this.apiUrl}/api/linea/status`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.authToken}`,
            },
          },
        ),
      );

      if (response.data.success) {
        this.logger.log(
          `Successfully fetched ${response.data.data.length} linea statuses`,
        );
        return response.data.data;
      } else {
        this.logger.warn('Linea status response was not successful');
        return [];
      }
    } catch (error) {
      this.logger.error('Failed to fetch linea status', error.message);
      throw new Error(`Failed to fetch linea status: ${error.message}`);
    }
  }

  /**
   * Obtiene el estado de las líneas y los almacena en la base de datos
   * @returns Promise con el array de entidades guardadas
   */
  async fetchAndSaveLineaStatus(): Promise<LineaStatusEntity[]> {
    try {
      // Obtener datos de la API
      const lineasData = await this.getLineaStatus();

      if (lineasData.length === 0) {
        this.logger.warn('No linea status data to save');
        return [];
      }

      // Convertir los datos a entidades
      const entities = lineasData.map((linea) => {
        const entity = new LineaStatusEntity();
        entity.idEmpresa = linea.idEmpresa;
        entity.idLinea = linea.idLinea;
        entity.nombreEmpresa = linea.nombreEmpresa;
        entity.nombreLinea = linea.nombreLinea;
        entity.unidad = linea.unidad;
        entity.lat = linea.lat;
        entity.lng = linea.lng;
        entity.recorrido = linea.recorrido;
        return entity;
      });

      // Guardar en la base de datos
      const savedEntities = await this.lineaStatusRepository.save(entities);

      this.logger.log(
        `Successfully saved ${savedEntities.length} linea status records to database`,
      );

      return savedEntities;
    } catch (error) {
      this.logger.error(
        'Failed to fetch and save linea status',
        error.message,
      );
      throw new Error(
        `Failed to fetch and save linea status: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene todos los registros de línea status desde la base de datos
   * @returns Promise con el array de entidades
   */
  async getAllLineaStatusFromDB(): Promise<LineaStatusEntity[]> {
    try {
      return await this.lineaStatusRepository.find({
        order: {
          updatedAt: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(
        'Failed to fetch linea status from database',
        error.message,
      );
      throw new Error(
        `Failed to fetch linea status from database: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene el último estado de una unidad específica desde la base de datos
   * @param unidad Número de unidad
   * @returns Promise con la entidad o null si no existe
   */
  async getLineaStatusByUnidad(unidad: number): Promise<LineaStatusEntity | null> {
    try {
      return await this.lineaStatusRepository.findOne({
        where: { unidad },
        order: {
          updatedAt: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch linea status for unidad ${unidad}`,
        error.message,
      );
      throw new Error(
        `Failed to fetch linea status for unidad ${unidad}: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene el estado de una unidad específica desde la API de Jaha
   * @param unidadId ID de la unidad
   * @param lineaId ID de la línea
   * @param empresaId ID de la empresa
   * @returns Promise con el estado de la unidad
   */
  async getUnidadStatus(
    unidadId: number,
    lineaId: number,
    empresaId: number,
  ): Promise<LineaStatusDto> {
    try {
      // Asegurar que tenemos un token válido
      await this.ensureAuthenticated();

      this.logger.log(
        `Fetching status for unidad ${unidadId}, linea ${lineaId}, empresa ${empresaId}`,
      );

      const response = await firstValueFrom(
        this.httpService.get<UnidadStatusResponseDto>(
          `${this.apiUrl}/api/unidad/status/${unidadId}/${lineaId}/${empresaId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.authToken}`,
            },
          },
        ),
      );

      if (response.data.success && response.data.data) {
        this.logger.log(
          `Successfully fetched status for unidad ${unidadId}`,
        );
        return response.data.data;
      } else {
        this.logger.warn('Unidad status response was not successful');
        throw new Error('Unidad status response was not successful');
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch unidad status for ${unidadId}`,
        error.message,
      );
      throw new Error(
        `Failed to fetch unidad status for ${unidadId}: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene el estado de una unidad específica y lo guarda en la base de datos
   * @param unidadId ID de la unidad
   * @param lineaId ID de la línea
   * @param empresaId ID de la empresa
   * @returns Promise con la entidad guardada
   */
  async fetchAndSaveUnidadStatus(
    unidadId: number,
    lineaId: number,
    empresaId: number,
  ): Promise<LineaStatusEntity | null> {
    try {
      // Obtener datos de la API
      const unidadData = await this.getUnidadStatus(
        unidadId,
        lineaId,
        empresaId,
      );

      if (!unidadData) {
        this.logger.warn(`No data found for unidad ${unidadId}`);
        return null;
      }

      // Convertir los datos a entidad
      const entity = new LineaStatusEntity();
      entity.idEmpresa = unidadData.idEmpresa;
      entity.idLinea = unidadData.idLinea;
      entity.nombreEmpresa = unidadData.nombreEmpresa;
      entity.nombreLinea = unidadData.nombreLinea;
      entity.unidad = unidadData.unidad;
      entity.lat = unidadData.lat;
      entity.lng = unidadData.lng;
      entity.recorrido = unidadData.recorrido;

      // Guardar en la base de datos
      const savedEntity = await this.lineaStatusRepository.save(entity);

      this.logger.log(
        `Successfully saved unidad ${unidadId} status to database`,
      );

      return savedEntity;
    } catch (error) {
      this.logger.error(
        `Failed to fetch and save unidad ${unidadId} status`,
        error.message,
      );
      throw new Error(
        `Failed to fetch and save unidad ${unidadId} status: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene las rutas disponibles para una línea específica
   * @param lineaId ID de la línea
   * @returns Promise con el array de rutas
   */
  async getRoutesByLinea(lineaId: number): Promise<RouteDto[]> {
    try {
      // Asegurar que tenemos un token válido
      await this.ensureAuthenticated();

      this.logger.log(`Fetching routes for linea ${lineaId}`);

      const response = await firstValueFrom(
        this.httpService.get<RoutesResponseDto>(
          `${this.apiUrl}/api/route/${lineaId}/routes`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.authToken}`,
            },
          },
        ),
      );

      if (response.data.success && response.data.data) {
        this.logger.log(
          `Successfully fetched ${response.data.data.length} routes for linea ${lineaId}`,
        );
        return response.data.data;
      } else {
        this.logger.warn('Routes response was not successful');
        return [];
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch routes for linea ${lineaId}`,
        error.message,
      );
      throw new Error(
        `Failed to fetch routes for linea ${lineaId}: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene las rutas de una línea y las guarda o actualiza en la base de datos
   * Si la ruta ya existe (por ID), se actualiza. Si no existe, se inserta.
   * @param lineaId ID de la línea
   * @returns Promise con el array de entidades guardadas/actualizadas
   */
  async fetchAndSaveRoutes(lineaId: number): Promise<RouteEntity[]> {
    try {
      // Obtener datos de la API
      const routesData = await this.getRoutesByLinea(lineaId);

      if (routesData.length === 0) {
        this.logger.warn(`No routes data to save for linea ${lineaId}`);
        return [];
      }

      // Convertir los datos a entidades
      const entities = routesData.map((route) => {
        const entity = new RouteEntity();
        entity.id = route.id;
        entity.name = route.name;
        entity.lineaId = lineaId;
        return entity;
      });

      // Guardar o actualizar en la base de datos
      // save() insertará si no existe o actualizará si existe (basado en la PK)
      const savedEntities = await this.routeRepository.save(entities);

      this.logger.log(
        `Successfully saved/updated ${savedEntities.length} routes for linea ${lineaId}`,
      );

      return savedEntities;
    } catch (error) {
      this.logger.error(
        `Failed to fetch and save routes for linea ${lineaId}`,
        error.message,
      );
      throw new Error(
        `Failed to fetch and save routes for linea ${lineaId}: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene todas las rutas desde la base de datos
   * @returns Promise con el array de entidades
   */
  async getAllRoutesFromDB(): Promise<RouteEntity[]> {
    try {
      return await this.routeRepository.find({
        order: {
          lineaId: 'ASC',
          id: 'ASC',
        },
      });
    } catch (error) {
      this.logger.error('Failed to fetch routes from database', error.message);
      throw new Error(
        `Failed to fetch routes from database: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene las rutas de una línea específica desde la base de datos
   * @param lineaId ID de la línea
   * @returns Promise con el array de entidades
   */
  async getRoutesByLineaFromDB(lineaId: number): Promise<RouteEntity[]> {
    try {
      return await this.routeRepository.find({
        where: { lineaId },
        order: {
          id: 'ASC',
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch routes for linea ${lineaId} from database`,
        error.message,
      );
      throw new Error(
        `Failed to fetch routes for linea ${lineaId} from database: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene una ruta específica por su ID desde la base de datos
   * @param routeId ID de la ruta
   * @returns Promise con la entidad o null si no existe
   */
  async getRouteByIdFromDB(routeId: number): Promise<RouteEntity | null> {
    try {
      return await this.routeRepository.findOne({
        where: { id: routeId },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch route ${routeId} from database`,
        error.message,
      );
      throw new Error(
        `Failed to fetch route ${routeId} from database: ${error.message}`,
      );
    }
  }

  /**
   * Establece una ruta para una unidad específica
   * @param unidadId ID de la unidad
   * @param lineaId ID de la línea
   * @param routeId ID de la ruta a establecer
   * @returns Promise con la respuesta del servidor
   */
  async setRoute(payload: SetRouteRequestDto): Promise<SetRouteResponseDto> {
    const { unidadId, lineaId, routeId } = payload;
    let responseData: SetRouteResponseDto | null = null;

    try {
      // Asegurar que tenemos un token válido
      await this.ensureAuthenticated();

      this.logger.log(
        `Setting route ${routeId} for unidad ${unidadId}, linea ${lineaId}`,
      );

      const response = await firstValueFrom(
        this.httpService.post<SetRouteResponseDto>(
          `${this.apiUrl}/api/route/setRoute`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.authToken}`,
            },
          },
        ),
      );

      responseData = response.data;

      if (response.data.success) {
        this.logger.log(
          `Successfully set route ${routeId} for unidad ${unidadId}: ${response.data.data.message}`,
        );
      } else {
        this.logger.warn('Set route response was not successful');
      }

      // Guardar log en la base de datos
      await this.saveSetRouteLog({
        unidadId,
        lineaId,
        routeId,
        success: response.data.success,
        message: response.data.data?.message || null,
        errorMessage: null,
        requestData: payload,
        responseData: response.data,
      });

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to set route ${routeId} for unidad ${unidadId}`,
        error.message,
      );

      // Guardar log del error en la base de datos
      await this.saveSetRouteLog({
        unidadId,
        lineaId,
        routeId,
        success: false,
        message: null,
        errorMessage: responseData?.message ?? null,
        requestData: payload,
        responseData: responseData,
      });

      throw new Error(
        `Failed to set route ${routeId} for unidad ${unidadId}: ${error.message}`,
      );
    }
  }

  /**
   * Guarda un log de setRoute en la base de datos
   * @param logData Datos del log a guardar
   * @returns Promise con la entidad guardada o null si falla
   */
  private async saveSetRouteLog(logData: {
    unidadId: number;
    lineaId: number;
    routeId: number;
    success: boolean;
    message: string | null;
    errorMessage: string | null;
    requestData: SetRouteRequestDto;
    responseData: any;
  }): Promise<SetRouteLogEntity | null> {
    try {
      const logEntity = new SetRouteLogEntity();
      logEntity.unidadId = logData.unidadId;
      logEntity.lineaId = logData.lineaId;
      logEntity.routeId = logData.routeId;
      logEntity.success = logData.success;
      logEntity.message = logData.message || '';
      logEntity.errorMessage = logData.errorMessage || '';
      logEntity.requestData = logData.requestData;
      logEntity.responseData = logData.responseData;

      const savedLog = await this.setRouteLogRepository.save(logEntity);

      this.logger.debug(`Saved setRoute log with id ${savedLog.id}`);

      return savedLog;
    } catch (error) {
      // No lanzar error aquí para no interrumpir el flujo principal
      this.logger.error(
        `Failed to save setRoute log: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Obtiene todos los logs de setRoute desde la base de datos
   * @param limit Número máximo de registros a retornar
   * @returns Promise con el array de entidades
   */
  async getSetRouteLogs(limit: number = 100): Promise<SetRouteLogEntity[]> {
    try {
      return await this.setRouteLogRepository.find({
        order: {
          createdAt: 'DESC',
        },
        take: limit,
      });
    } catch (error) {
      this.logger.error(
        'Failed to fetch setRoute logs from database',
        error.message,
      );
      throw new Error(
        `Failed to fetch setRoute logs from database: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene los logs de setRoute para una unidad específica
   * @param unidadId ID de la unidad
   * @param limit Número máximo de registros a retornar
   * @returns Promise con el array de entidades
   */
  async getSetRouteLogsByUnidad(
    unidadId: number,
    limit: number = 50,
  ): Promise<SetRouteLogEntity[]> {
    try {
      return await this.setRouteLogRepository.find({
        where: { unidadId },
        order: {
          createdAt: 'DESC',
        },
        take: limit,
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch setRoute logs for unidad ${unidadId}`,
        error.message,
      );
      throw new Error(
        `Failed to fetch setRoute logs for unidad ${unidadId}: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene los logs de setRoute filtrados por éxito/fallo
   * @param success true para obtener solo los exitosos, false para los fallidos
   * @param limit Número máximo de registros a retornar
   * @returns Promise con el array de entidades
   */
  async getSetRouteLogsBySuccess(
    success: boolean,
    limit: number = 100,
  ): Promise<SetRouteLogEntity[]> {
    try {
      return await this.setRouteLogRepository.find({
        where: { success },
        order: {
          createdAt: 'DESC',
        },
        take: limit,
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch setRoute logs by success=${success}`,
        error.message,
      );
      throw new Error(
        `Failed to fetch setRoute logs by success=${success}: ${error.message}`,
      );
    }
  }
}
