import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('route_alerts')
@Index(['unidadId', 'createdAt'])
@Index(['lineaId', 'createdAt'])
@Index(['resolved'])
export class RouteAlertEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Identificación de la unidad y línea
  @Column({ type: 'int', name: 'unidad_id' })
  unidadId: number;

  @Column({ type: 'int', name: 'linea_id' })
  lineaId: number;

  // Ruta esperada vs ruta actual
  @Column({ type: 'int', name: 'expected_route_id' })
  expectedRouteId: number;

  @Column({ type: 'int', name: 'actual_route_id' })
  actualRouteId: number;

  @Column({ type: 'varchar', length: 255, name: 'expected_route_name' })
  expectedRouteName: string;

  @Column({ type: 'varchar', length: 255, name: 'actual_route_name' })
  actualRouteName: string;

  // Datos adicionales del contexto
  @Column({ type: 'varchar', length: 255, name: 'empresa_nombre', nullable: true })
  empresaNombre: string;

  @Column({ type: 'varchar', length: 255, name: 'linea_nombre', nullable: true })
  lineaNombre: string;

  // Estado de la alerta
  @Column({ type: 'boolean', default: false })
  resolved: boolean;

  @Column({ type: 'timestamp', name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  // Información adicional en JSON
  @Column({ type: 'json', name: 'alert_data', nullable: true })
  alertData: {
    lineaStatusId?: number;
    setRouteLogId?: number;
    lat?: number;
    lng?: number;
    recorridoOriginal?: string;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
