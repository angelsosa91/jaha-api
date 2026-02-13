import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMonitorDistance1739440800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE monitor_distance (
        id INT NOT NULL AUTO_INCREMENT,
        id_movil INT NOT NULL,
        bus_code VARCHAR(50) NOT NULL,
        patente VARCHAR(50) NULL,
        fecha_desde DATETIME NOT NULL,
        fecha_hasta DATETIME NOT NULL,
        metros_recorridos INT NOT NULL,
        km_recorridos INT NOT NULL,
        created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        INDEX idx_monitor_distance_movil_fecha (id_movil, fecha_desde),
        INDEX idx_monitor_distance_bus (bus_code),
        INDEX idx_monitor_distance_fecha (fecha_desde)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS monitor_distance;`);
  }
}
