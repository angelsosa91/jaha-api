-- =============================================================================
-- JAHA API - Migración Inicial de Base de Datos
-- =============================================================================
-- Este script crea todas las tablas necesarias para la aplicación
-- Base de datos: MySQL
-- Fecha: 2024-11-28
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabla: linea_status
-- Descripción: Almacena el estado actual de las líneas de transporte
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `linea_status` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `id_linea` int NOT NULL,
  `nombre_empresa` varchar(255) NOT NULL,
  `nombre_linea` varchar(255) NOT NULL,
  `unidad` int NOT NULL,
  `lat` decimal(10,6) NOT NULL,
  `lng` decimal(10,6) NOT NULL,
  `recorrido` varchar(500) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_linea_status_empresa_linea_unidad` (`id_empresa`, `id_linea`, `unidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Tabla: routes
-- Descripción: Define las rutas disponibles para las líneas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `routes` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `linea_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_routes_linea_id` (`linea_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Tabla: set_route_logs
-- Descripción: Registra todos los intentos de asignación de rutas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `set_route_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `unidad_id` int NOT NULL,
  `linea_id` int NOT NULL,
  `route_id` int NOT NULL,
  `traffic_id` bigint NOT NULL,
  `success` tinyint NOT NULL,
  `message` text NULL,
  `error_message` text NULL,
  `request_data` json NOT NULL,
  `response_data` json NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_set_route_logs_unidad_created` (`unidad_id`, `created_at`),
  INDEX `IDX_set_route_logs_linea_created` (`linea_id`, `created_at`),
  INDEX `IDX_set_route_logs_route_created` (`route_id`, `created_at`),
  INDEX `IDX_set_route_logs_success` (`success`),
  UNIQUE INDEX `IDX_set_route_logs_traffic_id` (`traffic_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Tabla: route_alerts
-- Descripción: Almacena alertas cuando una unidad está en una ruta diferente
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `route_alerts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `unidad_id` int NOT NULL,
  `linea_id` int NOT NULL,
  `expected_route_id` int NOT NULL,
  `actual_route_id` int NOT NULL,
  `expected_route_name` varchar(255) NOT NULL,
  `actual_route_name` varchar(255) NOT NULL,
  `empresa_nombre` varchar(255) NULL,
  `linea_nombre` varchar(255) NULL,
  `resolved` tinyint NOT NULL DEFAULT 0,
  `resolved_at` timestamp NULL,
  `alert_data` json NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_route_alerts_unidad_created` (`unidad_id`, `created_at`),
  INDEX `IDX_route_alerts_linea_created` (`linea_id`, `created_at`),
  INDEX `IDX_route_alerts_resolved` (`resolved`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Tabla: migrations (TypeORM)
-- Descripción: Tabla de control de migraciones de TypeORM
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registrar la migración como ejecutada
INSERT INTO `migrations` (`timestamp`, `name`)
VALUES (1764342000000, 'InitialSchema1764342000000')
ON DUPLICATE KEY UPDATE `timestamp` = `timestamp`;

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================

-- Para ejecutar este script:
-- 1. Desde línea de comandos:
--    mysql -u usuario -p nombre_base_datos < migrations.sql
--
-- 2. Desde MySQL Workbench o phpMyAdmin:
--    Abrir el archivo y ejecutar
--
-- 3. Desde línea de comandos MySQL:
--    mysql> USE nombre_base_datos;
--    mysql> source /ruta/al/archivo/migrations.sql;
-- =============================================================================
