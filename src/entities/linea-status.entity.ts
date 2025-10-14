import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('linea_status')
@Index(['idEmpresa', 'idLinea', 'unidad'])
export class LineaStatusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'id_empresa' })
  idEmpresa: number;

  @Column({ type: 'int', name: 'id_linea' })
  idLinea: number;

  @Column({ type: 'varchar', length: 255, name: 'nombre_empresa' })
  nombreEmpresa: string;

  @Column({ type: 'varchar', length: 255, name: 'nombre_linea' })
  nombreLinea: string;

  @Column({ type: 'int' })
  unidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  lat: string;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  lng: string;

  @Column({ type: 'varchar', length: 500 })
  recorrido: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
