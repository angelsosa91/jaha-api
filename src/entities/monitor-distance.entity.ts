import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('monitor_distance')
@Index(['idMovil', 'fechaDesde'])
@Index(['busCode'])
@Index(['fechaDesde'])
export class MonitorDistanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'id_movil' })
  idMovil: number;

  @Column({ type: 'varchar', length: 50, name: 'bus_code' })
  busCode: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  patente: string;

  @Column({ type: 'datetime', name: 'fecha_desde' })
  fechaDesde: Date;

  @Column({ type: 'datetime', name: 'fecha_hasta' })
  fechaHasta: Date;

  @Column({ type: 'int', name: 'metros_recorridos' })
  metrosRecorridos: number;

  @Column({ type: 'int', name: 'km_recorridos' })
  kmRecorridos: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
