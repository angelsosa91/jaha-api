import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JahaApiService } from './jaha-api.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private readonly jahaApiService: JahaApiService) { }

  /**
   * Tarea programada que se ejecuta cada minuto
   * Obtiene y guarda el estado de todas las líneas
   */
  @Cron(CronExpression.EVERY_5_MINUTES) //EVERY_MINUTE
  async fetchLineaStatusEveryMinute() {
    this.logger.log('Iniciando tarea programada: Obtener estado de líneas');

    try {
      const results = await this.jahaApiService.fetchAndSaveLineaStatus();
      this.logger.log(
        `Tarea completada exitosamente: ${results.length} registros guardados`,
      );
    } catch (error) {
      this.logger.error(
        `Error en tarea programada: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Tarea programada que se ejecuta cada día a medianoche
   * Limpia los registros antiguos de linea_status, manteniendo solo los últimos 7 días
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanOldLineaStatusRecords() {
    this.logger.log(
      'Iniciando tarea programada: Limpiar registros antiguos de linea_status',
    );

    try {
      const deletedCount =
        await this.jahaApiService.cleanOldLineaStatusRecords(7);
      this.logger.log(
        `Tarea de limpieza completada: ${deletedCount} registros eliminados`,
      );
    } catch (error) {
      this.logger.error(
        `Error en tarea de limpieza: ${error.message}`,
        error.stack,
      );
    }
  }

  // Ejemplos de otras tareas programadas comentadas para referencia:
  /*
  // Ejecuta cada 10 segundos
  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron() {
    this.logger.debug('Tarea ejecutada cada 10 segundos');
  }

  // Ejecuta cada día a las 3:00 AM
  @Cron('0 3 * * *')
  handleDailyCron() {
    this.logger.debug('Tarea diaria ejecutada a las 3:00 AM');
  }

  // Ejecuta cada 5000ms (5 segundos) usando intervalo
  @Interval(5000)
  handleInterval() {
    this.logger.debug('Tarea ejecutada cada 5 segundos con Interval');
  }

  // Ejecuta una vez después de 3000ms (3 segundos) del inicio de la aplicación
  @Timeout(3000)
  handleTimeout() {
    this.logger.debug('Tarea ejecutada una vez después de 3 segundos del inicio');
  }
  */
}
