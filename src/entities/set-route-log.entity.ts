import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('set_route_logs')
@Index(['unidadId', 'createdAt'])
@Index(['lineaId', 'createdAt'])
@Index(['routeId', 'createdAt'])
@Index(['success'])
@Index(['trafficId'], { unique: true })
export class SetRouteLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Datos del request
  @Column({ type: 'int', name: 'unidad_id' })
  unidadId: number;

  @Column({ type: 'int', name: 'linea_id' })
  lineaId: number;

  @Column({ type: 'int', name: 'route_id' })
  routeId: number;

  @Column({ type: 'bigint', name: 'traffic_id' })
  trafficId: number;

  // Datos de la response
  @Column({ type: 'boolean' })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage: string;

  // Request completo en JSON para auditoría
  @Column({ type: 'json', name: 'request_data' })
  requestData: {
    unidadId: number;
    lineaId: number;
    routeId: number;
    trafficId: number;
  };

  // Response completo en JSON para auditoría
  @Column({ type: 'json', name: 'response_data', nullable: true })
  responseData: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
