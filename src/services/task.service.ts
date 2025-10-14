import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  // Ejecuta cada 10 segundos
  /*@Cron(CronExpression.EVERY_10_SECONDS)
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
  }*/
}
