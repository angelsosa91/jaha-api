import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { TaskService } from './services/task.service';
import { JahaApiService } from './services/jaha-api.service';
import { LineaStatusEntity } from './entities/linea-status.entity';
import { RouteEntity } from './entities/route.entity';
import { SetRouteLogEntity } from './entities/set-route-log.entity';
import { RouteAlertEntity } from './entities/route-alert.entity';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'nestjs_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      synchronize: false, // Usar migraciones en lugar de synchronize
      migrationsRun: false, // Las migraciones se ejecutan manualmente
      logging: process.env.DB_LOGGING === 'true',
    }),
    TypeOrmModule.forFeature([
      LineaStatusEntity,
      RouteEntity,
      SetRouteLogEntity,
      RouteAlertEntity,
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TaskService,
    JahaApiService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }
