-- ============================================================
-- Thermo-IoT — Esquema de base de datos
-- ============================================================
-- Reconstruido directamente de las consultas SQL usadas en el
-- backend (routes/ y services/), columna por columna — no es
-- una aproximación, es exactamente lo que el código espera.
--
-- Uso:
--   mysql -u root -p < schema.sql
-- o dentro de un cliente MySQL:
--   SOURCE schema.sql;
-- ============================================================

CREATE DATABASE IF NOT EXISTS thermo_iot
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE thermo_iot;

-- ============================================================
-- usuarios
-- Cuentas del sitio. correo y usuario son únicos porque el
-- login busca por correo asumiendo un solo resultado.
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- incubadoras
-- Dispositivos (ESP32) registrados por cada usuario.
-- ============================================================

CREATE TABLE IF NOT EXISTS incubadoras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    esp32_id VARCHAR(100) NOT NULL,
    temperatura_objetivo DECIMAL(5,2) NOT NULL,
    usuario_id INT NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,

    INDEX idx_incubadoras_esp32_id (esp32_id)
);

-- ============================================================
-- mediciones
-- Historial de lecturas de temperatura/humedad enviadas por
-- cada ESP32. Es la tabla que más crece — el índice compuesto
-- es clave para que las consultas por dispositivo + fecha
-- (Dashboard, Alarmas, estadísticas del día) sigan siendo
-- rápidas a medida que crece.
-- ============================================================

CREATE TABLE IF NOT EXISTS mediciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    esp32_id VARCHAR(100) NOT NULL,
    temperatura DECIMAL(5,2) NOT NULL,
    humedad DECIMAL(5,2) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_mediciones_esp32_fecha (esp32_id, fecha)
);

-- ============================================================
-- eventos
-- Historial de acciones confirmadas por el ESP32 (encendidos,
-- apagados, cambios de modo).
-- ============================================================

CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    esp32_id VARCHAR(100) NOT NULL,
    evento VARCHAR(255) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_eventos_esp32_fecha (esp32_id, fecha)
);

-- ============================================================
-- comandos
-- Cola de comandos manuales/automáticos pendientes de que el
-- ESP32 los recoja y ejecute.
-- ============================================================

CREATE TABLE IF NOT EXISTS comandos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    esp32_id VARCHAR(100) NOT NULL,
    comando VARCHAR(50) NOT NULL,
    valor VARCHAR(50) NOT NULL,
    ejecutado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_comandos_esp32_ejecutado (esp32_id, ejecutado)
);

-- ============================================================
-- configuracion
-- Umbrales e intervalo de lectura vigentes por dispositivo.
-- esp32_id es único: una sola fila de configuración por ESP32
-- (el backend hace upsert sobre esta unicidad).
-- ============================================================

CREATE TABLE IF NOT EXISTS configuracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    esp32_id VARCHAR(100) NOT NULL UNIQUE,
    temperatura_min DECIMAL(5,2) NOT NULL,
    temperatura_max DECIMAL(5,2) NOT NULL,
    humedad_min DECIMAL(5,2) NOT NULL,
    humedad_max DECIMAL(5,2) NOT NULL,
    tiempo_lectura INT NOT NULL DEFAULT 3000
);
