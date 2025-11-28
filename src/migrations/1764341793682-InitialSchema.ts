import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1764341793682 implements MigrationInterface {
    name = 'InitialSchema1764341793682'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`route_alerts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`unidad_id\` int NOT NULL, \`linea_id\` int NOT NULL, \`expected_route_id\` int NOT NULL, \`actual_route_id\` int NOT NULL, \`expected_route_name\` varchar(255) NOT NULL, \`actual_route_name\` varchar(255) NOT NULL, \`empresa_nombre\` varchar(255) NULL, \`linea_nombre\` varchar(255) NULL, \`resolved\` tinyint NOT NULL DEFAULT 0, \`resolved_at\` timestamp NULL, \`alert_data\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_cd25a01e606e70cf1d3fe48dd2\` (\`resolved\`), INDEX \`IDX_e228b3519fe6b3097e14ab87f8\` (\`linea_id\`, \`created_at\`), INDEX \`IDX_6b07bc854eb3e7ee4ecb6d8677\` (\`unidad_id\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`set_route_logs\` ADD \`traffic_id\` bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`set_route_logs\` ADD UNIQUE INDEX \`IDX_669db63ae910022583f0b0e6b6\` (\`traffic_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`set_route_logs\` DROP INDEX \`IDX_669db63ae910022583f0b0e6b6\``);
        await queryRunner.query(`ALTER TABLE \`set_route_logs\` DROP COLUMN \`traffic_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_6b07bc854eb3e7ee4ecb6d8677\` ON \`route_alerts\``);
        await queryRunner.query(`DROP INDEX \`IDX_e228b3519fe6b3097e14ab87f8\` ON \`route_alerts\``);
        await queryRunner.query(`DROP INDEX \`IDX_cd25a01e606e70cf1d3fe48dd2\` ON \`route_alerts\``);
        await queryRunner.query(`DROP TABLE \`route_alerts\``);
    }

}
