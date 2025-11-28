import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1764342000000 implements MigrationInterface {
  name = 'InitialSchema1764342000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla linea_status
    await queryRunner.query(`
      CREATE TABLE \`linea_status\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`id_empresa\` int NOT NULL,
        \`id_linea\` int NOT NULL,
        \`nombre_empresa\` varchar(255) NOT NULL,
        \`nombre_linea\` varchar(255) NOT NULL,
        \`unidad\` int NOT NULL,
        \`lat\` decimal(10,6) NOT NULL,
        \`lng\` decimal(10,6) NOT NULL,
        \`recorrido\` varchar(500) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_linea_status_empresa_linea_unidad\` (\`id_empresa\`, \`id_linea\`, \`unidad\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Crear tabla routes
    await queryRunner.query(`
      CREATE TABLE \`routes\` (
        \`id\` bigint NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`linea_id\` int NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_routes_linea_id\` (\`linea_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Crear tabla set_route_logs
    await queryRunner.query(`
      CREATE TABLE \`set_route_logs\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`unidad_id\` int NOT NULL,
        \`linea_id\` int NOT NULL,
        \`route_id\` int NOT NULL,
        \`traffic_id\` bigint NOT NULL,
        \`success\` tinyint NOT NULL,
        \`message\` text NULL,
        \`error_message\` text NULL,
        \`request_data\` json NOT NULL,
        \`response_data\` json NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`IDX_set_route_logs_unidad_created\` (\`unidad_id\`, \`created_at\`),
        INDEX \`IDX_set_route_logs_linea_created\` (\`linea_id\`, \`created_at\`),
        INDEX \`IDX_set_route_logs_route_created\` (\`route_id\`, \`created_at\`),
        INDEX \`IDX_set_route_logs_success\` (\`success\`),
        UNIQUE INDEX \`IDX_set_route_logs_traffic_id\` (\`traffic_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Crear tabla route_alerts
    await queryRunner.query(`
      CREATE TABLE \`route_alerts\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`unidad_id\` int NOT NULL,
        \`linea_id\` int NOT NULL,
        \`expected_route_id\` int NOT NULL,
        \`actual_route_id\` int NOT NULL,
        \`expected_route_name\` varchar(255) NOT NULL,
        \`actual_route_name\` varchar(255) NOT NULL,
        \`empresa_nombre\` varchar(255) NULL,
        \`linea_nombre\` varchar(255) NULL,
        \`resolved\` tinyint NOT NULL DEFAULT 0,
        \`resolved_at\` timestamp NULL,
        \`alert_data\` json NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`IDX_route_alerts_unidad_created\` (\`unidad_id\`, \`created_at\`),
        INDEX \`IDX_route_alerts_linea_created\` (\`linea_id\`, \`created_at\`),
        INDEX \`IDX_route_alerts_resolved\` (\`resolved\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tablas en orden inverso
    await queryRunner.query(`DROP INDEX \`IDX_route_alerts_resolved\` ON \`route_alerts\``);
    await queryRunner.query(`DROP INDEX \`IDX_route_alerts_linea_created\` ON \`route_alerts\``);
    await queryRunner.query(`DROP INDEX \`IDX_route_alerts_unidad_created\` ON \`route_alerts\``);
    await queryRunner.query(`DROP TABLE \`route_alerts\``);

    await queryRunner.query(`DROP INDEX \`IDX_set_route_logs_traffic_id\` ON \`set_route_logs\``);
    await queryRunner.query(`DROP INDEX \`IDX_set_route_logs_success\` ON \`set_route_logs\``);
    await queryRunner.query(`DROP INDEX \`IDX_set_route_logs_route_created\` ON \`set_route_logs\``);
    await queryRunner.query(`DROP INDEX \`IDX_set_route_logs_linea_created\` ON \`set_route_logs\``);
    await queryRunner.query(`DROP INDEX \`IDX_set_route_logs_unidad_created\` ON \`set_route_logs\``);
    await queryRunner.query(`DROP TABLE \`set_route_logs\``);

    await queryRunner.query(`DROP INDEX \`IDX_routes_linea_id\` ON \`routes\``);
    await queryRunner.query(`DROP TABLE \`routes\``);

    await queryRunner.query(`DROP INDEX \`IDX_linea_status_empresa_linea_unidad\` ON \`linea_status\``);
    await queryRunner.query(`DROP TABLE \`linea_status\``);
  }
}
