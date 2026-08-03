-- ============================================================
-- SIMONETTA MODAS - Script de inicialización de Base de Datos
-- PostgreSQL - Tercera Forma Normal (3FN)
-- ============================================================

-- Crear la base de datos (ejecutar fuera de transacción si no existe)
-- CREATE DATABASE simonetta_db;

-- ============================================================
-- TABLA: roles
-- Catálogo de roles del sistema
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================================
-- TABLA: usuarios
-- Credenciales de acceso al sistema
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INTEGER NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT
);

-- ============================================================
-- TABLA: clientes
-- Datos personales de los clientes del taller
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente SERIAL PRIMARY KEY,
    id_usuario INTEGER,
    nombre_completo VARCHAR(200) NOT NULL,
    telefono_whatsapp VARCHAR(20) NOT NULL,
    CONSTRAINT fk_cliente_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

-- ============================================================
-- TABLA: medidas
-- Registro de medidas anatómicas por cliente
-- ============================================================
CREATE TABLE IF NOT EXISTS medidas (
    id_medida SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    cortas DECIMAL(5,2),
    cintura DECIMAL(5,2),
    frente DECIMAL(5,2),
    alto_cadera DECIMAL(5,2),
    cadera DECIMAL(5,2),
    entre_busto DECIMAL(5,2),
    busto DECIMAL(5,2),
    espalda DECIMAL(5,2),
    hombro DECIMAL(5,2),
    fecha_toma DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_medida_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
);

-- ============================================================
-- ÍNDICES para optimizar consultas frecuentes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_medidas_id_cliente ON medidas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_medidas_fecha_toma ON medidas(fecha_toma);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre_completo);

-- ============================================================
-- INSERCIÓN de roles iniciales
-- ============================================================
INSERT INTO roles (nombre_rol) VALUES
    ('Admin'),
    ('Secretaria'),
    ('Costurera'),
    ('Cliente')
ON CONFLICT (nombre_rol) DO NOTHING;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
