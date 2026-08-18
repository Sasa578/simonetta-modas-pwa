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
    fcm_token VARCHAR(500),
    nombre_completo VARCHAR(200),
    carnet_identidad VARCHAR(50),
    telefono VARCHAR(50),
    debe_cambiar_password BOOLEAN DEFAULT false,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    carnet_identidad VARCHAR(50),
    correo VARCHAR(150),
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

-- ============================================================
-- ITERACIÓN 3 — Módulo de Producción y Control de Almacén
-- ============================================================

-- TABLA: almacen (HU-07)
CREATE TABLE IF NOT EXISTS almacen (
    id_material SERIAL PRIMARY KEY,
    nombre_material VARCHAR(150) NOT NULL,
    cantidad_actual DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
    unidad_medida VARCHAR(20) NOT NULL DEFAULT 'metros'
);

-- TABLA: pedidos (HU-04)
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    fecha_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_entrega DATE NOT NULL,
    costo_total DECIMAL(10,2) NOT NULL CHECK (costo_total >= 0),
    adelanto DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (adelanto >= 0),
    saldo DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    id_costurera INTEGER,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    CONSTRAINT fk_pedido_costurera FOREIGN KEY (id_costurera) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

-- TABLA: detalle_pedido_material (HU-05)
CREATE TABLE IF NOT EXISTS detalle_pedido_material (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    id_material INTEGER, -- FK al almacen, nulo si es material del cliente
    descripcion_tela VARCHAR(255) NOT NULL,
    origen_material VARCHAR(50) NOT NULL,
    cantidad_metros DECIMAL(5,2),
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_material FOREIGN KEY (id_material) REFERENCES almacen(id_material) ON DELETE SET NULL,
    CONSTRAINT chk_origen CHECK (origen_material IN ('Taller', 'Cliente'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pedidos_id_cliente ON pedidos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_detalle_id_pedido ON detalle_pedido_material(id_pedido);
CREATE INDEX IF NOT EXISTS idx_detalle_id_material ON detalle_pedido_material(id_material);
