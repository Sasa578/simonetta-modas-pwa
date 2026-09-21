-- =====================================================================
-- SIMONETTA MODAS - MODELO RELACIONAL UNIFICADO POSTGRESQL (3FN)
-- =====================================================================

-- =====================================================================
-- MÓDULO 1: SEGURIDAD, USUARIOS Y CLIENTES
-- =====================================================================

CREATE TABLE IF NOT EXISTS estados_usuario (
    id_estado_usuario SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS estados_cliente (
    id_estado_cliente SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS descripciones_rol (
    id_descripcion_rol SERIAL PRIMARY KEY,
    id_rol INTEGER UNIQUE NOT NULL REFERENCES roles(id_rol) ON DELETE CASCADE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS tipo_cliente (
    id_tipo_cliente SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS descripciones_tipo_cliente (
    id_descripcion_tipo SERIAL PRIMARY KEY,
    id_tipo_cliente INTEGER UNIQUE NOT NULL REFERENCES tipo_cliente(id_tipo_cliente) ON DELETE CASCADE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol),
    id_estado_usuario INTEGER NOT NULL REFERENCES estados_usuario(id_estado_usuario),
    correo_electronico VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    debe_cambiar_password BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS datos_usuario (
    id_datos_usuario SERIAL PRIMARY KEY,
    id_usuario INTEGER UNIQUE NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    carnet_identidad VARCHAR(30) UNIQUE,
    fecha_nacimiento DATE,
    telefono VARCHAR(30),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
    id_cliente SERIAL PRIMARY KEY,
    id_tipo_cliente INTEGER NOT NULL REFERENCES tipo_cliente(id_tipo_cliente),
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol),
    id_estado_cliente INTEGER NOT NULL REFERENCES estados_cliente(id_estado_cliente),
    correo_electronico VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS datos_cliente_persona (
    id_datos_persona SERIAL PRIMARY KEY,
    id_cliente INTEGER UNIQUE NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    fecha_nacimiento DATE
);

CREATE TABLE IF NOT EXISTS datos_cliente_institucional (
    id_datos_institucional SERIAL PRIMARY KEY,
    id_cliente INTEGER UNIQUE NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    razon_social VARCHAR(200) NOT NULL,
    nit VARCHAR(50) NOT NULL,
    nombre_contacto VARCHAR(150),
    telefono_contacto VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS atributos_cliente (
    id_atributo_cliente SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    nombre_atributo VARCHAR(100) NOT NULL,
    valor_atributo VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS contratos (
    id_contrato SERIAL PRIMARY KEY,
    id_datos_institucional INTEGER NOT NULL REFERENCES datos_cliente_institucional(id_datos_institucional) ON DELETE CASCADE,
    numero_contrato VARCHAR(100) UNIQUE NOT NULL,
    fecha_firma DATE,
    fecha_vencimiento DATE,
    url_clausulas_pdf VARCHAR(500)
);

-- =====================================================================
-- MÓDULO 2: PEDIDOS Y MEDIDAS
-- =====================================================================

CREATE TABLE IF NOT EXISTS estados_pedido (
    id_estado_pedido SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS estados_pago (
    id_estado_pago SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS metodos_pago (
    id_metodo_pago SERIAL PRIMARY KEY,
    nombre_metodo VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS estados_cita (
    id_estado_cita SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    id_costurera INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    id_estado_pedido INTEGER NOT NULL REFERENCES estados_pedido(id_estado_pedido),
    fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_prueba TIMESTAMP,
    fecha_entrega TIMESTAMP,
    costo_total DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS catalogo (
    id_catalogo SERIAL PRIMARY KEY,
    nombre_catalogo VARCHAR(150) NOT NULL,
    url_imagen_catalogo VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS descripciones_catalogo (
    id_descripcion_catalogo SERIAL PRIMARY KEY,
    id_catalogo INTEGER UNIQUE NOT NULL REFERENCES catalogo(id_catalogo) ON DELETE CASCADE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS prendas (
    id_prenda SERIAL PRIMARY KEY,
    id_catalogo INTEGER REFERENCES catalogo(id_catalogo) ON DELETE SET NULL,
    tipo_prenda VARCHAR(100) NOT NULL,
    color VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS descripciones_prenda (
    id_descripcion_prenda SERIAL PRIMARY KEY,
    id_prenda INTEGER UNIQUE NOT NULL REFERENCES prendas(id_prenda) ON DELETE CASCADE,
    descripcion_detallada TEXT
);

CREATE TABLE IF NOT EXISTS detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_prenda INTEGER NOT NULL REFERENCES prendas(id_prenda) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0)
);

CREATE TABLE IF NOT EXISTS notas_diseno_detalle (
    id_nota_diseno SERIAL PRIMARY KEY,
    id_detalle INTEGER UNIQUE NOT NULL REFERENCES detalle_pedido(id_detalle) ON DELETE CASCADE,
    notas_diseno TEXT
);

CREATE TABLE IF NOT EXISTS medidas_anatomicas (
    id_medida_anatomica SERIAL PRIMARY KEY,
    id_detalle INTEGER UNIQUE NOT NULL REFERENCES detalle_pedido(id_detalle) ON DELETE CASCADE,
    cortas DECIMAL(5,2),
    cintura DECIMAL(5,2),
    frente DECIMAL(5,2),
    alto_cadera DECIMAL(5,2),
    cadera DECIMAL(5,2),
    entre_busto DECIMAL(5,2),
    busto DECIMAL(5,2),
    espalda DECIMAL(5,2),
    hombro DECIMAL(5,2)
);

CREATE TABLE IF NOT EXISTS medidas_convencionales (
    id_medida_convencional SERIAL PRIMARY KEY,
    id_detalle INTEGER UNIQUE NOT NULL REFERENCES detalle_pedido(id_detalle) ON DELETE CASCADE,
    talla VARCHAR(20),
    equivalencia_europea VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS pagos (
    id_pago SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_estado_pago INTEGER NOT NULL REFERENCES estados_pago(id_estado_pago),
    id_metodo_pago INTEGER NOT NULL REFERENCES metodos_pago(id_metodo_pago),
    monto_pago DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (monto_pago >= 0),
    fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS citas (
    id_cita SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    id_pedido INTEGER REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_estado_cita INTEGER NOT NULL REFERENCES estados_cita(id_estado_cita),
    fecha_cita TIMESTAMP NOT NULL,
    motivo_cita VARCHAR(255)
);

-- =====================================================================
-- MÓDULO 3: ALMACÉN E INVENTARIO
-- =====================================================================

CREATE TABLE IF NOT EXISTS colores (
    id_color SERIAL PRIMARY KEY,
    nombre_color VARCHAR(50) NOT NULL UNIQUE,
    codigo_hexadecimal VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS materiales_base (
    id_material_base SERIAL PRIMARY KEY,
    nombre_material VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS unidades_medida (
    id_unidad_medida SERIAL PRIMARY KEY,
    abreviatura VARCHAR(20) NOT NULL UNIQUE,
    descripcion VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS categorias_almacen (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tipos_producto (
    id_tipo_producto SERIAL PRIMARY KEY,
    id_categoria INTEGER NOT NULL REFERENCES categorias_almacen(id_categoria) ON DELETE CASCADE,
    nombre_tipo VARCHAR(100) NOT NULL,
    CONSTRAINT uq_categoria_tipo UNIQUE (id_categoria, nombre_tipo)
);

CREATE TABLE IF NOT EXISTS productos_almacen (
    id_producto SERIAL PRIMARY KEY,
    id_tipo_producto INTEGER NOT NULL REFERENCES tipos_producto(id_tipo_producto),
    id_unidad_medida INTEGER NOT NULL REFERENCES unidades_medida(id_unidad_medida),
    id_color INTEGER REFERENCES colores(id_color) ON DELETE SET NULL,
    id_material_base INTEGER REFERENCES materiales_base(id_material_base) ON DELETE SET NULL,
    nombre_articulo VARCHAR(150) NOT NULL,
    cantidad_stock DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (cantidad_stock >= 0),
    stock_minimo DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (stock_minimo >= 0)
);

-- Tablas de especificaciones especializadas (1:1 con productos_almacen)
CREATE TABLE IF NOT EXISTS esp_telas (
    id_producto INTEGER PRIMARY KEY REFERENCES productos_almacen(id_producto) ON DELETE CASCADE,
    grupo VARCHAR(100),
    subgrupo VARCHAR(100),
    textura VARCHAR(100),
    calidad VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS esp_botones (
    id_producto INTEGER PRIMARY KEY REFERENCES productos_almacen(id_producto) ON DELETE CASCADE,
    tipo_boton VARCHAR(100),
    tamano VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS esp_hilos (
    id_producto INTEGER PRIMARY KEY REFERENCES productos_almacen(id_producto) ON DELETE CASCADE,
    tipo_hilo VARCHAR(100),
    grosor VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS esp_cierres (
    id_producto INTEGER PRIMARY KEY REFERENCES productos_almacen(id_producto) ON DELETE CASCADE,
    tipo_cierre VARCHAR(100),
    tamano VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS esp_varillas (
    id_producto INTEGER PRIMARY KEY REFERENCES productos_almacen(id_producto) ON DELETE CASCADE,
    tipo VARCHAR(100),
    grosor VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS esp_broches (
    id_producto INTEGER PRIMARY KEY REFERENCES productos_almacen(id_producto) ON DELETE CASCADE,
    tipo VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS esp_encajes (
    id_producto INTEGER PRIMARY KEY REFERENCES productos_almacen(id_producto) ON DELETE CASCADE,
    grosor VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS esp_cintas (
    id_producto INTEGER PRIMARY KEY REFERENCES productos_almacen(id_producto) ON DELETE CASCADE,
    grosor VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS esp_apliques (
    id_producto INTEGER PRIMARY KEY REFERENCES productos_almacen(id_producto) ON DELETE CASCADE,
    forma VARCHAR(100),
    fijacion VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS esp_ribetes (
    id_producto INTEGER PRIMARY KEY REFERENCES productos_almacen(id_producto) ON DELETE CASCADE,
    ancho VARCHAR(50)
);

-- =====================================================================
-- MÓDULO 4: KARDEX, REPORTES Y NOTAS DE VENTA
-- =====================================================================

CREATE TABLE IF NOT EXISTS descuentos (
    id_descuento SERIAL PRIMARY KEY,
    id_tipo_cliente INTEGER REFERENCES tipo_cliente(id_tipo_cliente) ON DELETE SET NULL,
    nombre_descuento VARCHAR(100) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (porcentaje >= 0 AND porcentaje <= 100)
);

CREATE TABLE IF NOT EXISTS notas_venta (
    id_nota_venta SERIAL PRIMARY KEY,
    id_pedido INTEGER UNIQUE NOT NULL REFERENCES pedidos(id_pedido) ON DELETE RESTRICT,
    id_descuento INTEGER REFERENCES descuentos(id_descuento) ON DELETE SET NULL,
    numero_nota VARCHAR(100) UNIQUE NOT NULL,
    fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    total_final DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (total_final >= 0),
    estado_envio_correo VARCHAR(50) DEFAULT 'Pendiente'
);

CREATE TABLE IF NOT EXISTS proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    nombre_contacto VARCHAR(100),
    telefono_contacto VARCHAR(30),
    direccion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tipos_movimiento (
    id_tipo_movimiento SERIAL PRIMARY KEY,
    nombre_movimiento VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS origenes_material (
    id_origen SERIAL PRIMARY KEY,
    nombre_origen VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS movimientos_almacen (
    id_movimiento SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES productos_almacen(id_producto) ON DELETE RESTRICT,
    id_proveedor INTEGER REFERENCES proveedores(id_proveedor) ON DELETE SET NULL,
    id_detalle_pedido INTEGER REFERENCES detalle_pedido(id_detalle) ON DELETE SET NULL,
    id_tipo_movimiento INTEGER NOT NULL REFERENCES tipos_movimiento(id_tipo_movimiento),
    id_origen INTEGER REFERENCES origenes_material(id_origen),
    cantidad DECIMAL(10,2) NOT NULL CHECK (cantidad > 0),
    fecha_movimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS observaciones_movimiento (
    id_observacion SERIAL PRIMARY KEY,
    id_movimiento INTEGER UNIQUE NOT NULL REFERENCES movimientos_almacen(id_movimiento) ON DELETE CASCADE,
    observacion TEXT
);

-- =====================================================================
-- ÍNDICES PARA RENDIMIENTO EN CONSULTAS FRECUENTES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_clientes_correo ON clientes(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(id_estado_pedido);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_id ON detalle_pedido(id_pedido);
CREATE INDEX IF NOT EXISTS idx_pagos_pedido ON pagos(id_pedido);
CREATE INDEX IF NOT EXISTS idx_citas_cliente ON citas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_citas_pedido ON citas(id_pedido);
CREATE INDEX IF NOT EXISTS idx_productos_tipo ON productos_almacen(id_tipo_producto);
CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos_almacen(id_producto);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_almacen(fecha_movimiento);
