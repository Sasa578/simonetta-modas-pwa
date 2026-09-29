-- Simonetta Modas - Base de Datos V2
-- Estructura DDL Oficial y Semillas Iniciales

CREATE TABLE "estados_usuario" (
  "id_estado_usuario" serial PRIMARY KEY,
  "nombre_estado" varchar
);

CREATE TABLE "estados_cliente" (
  "id_estado_cliente" serial PRIMARY KEY,
  "nombre_estado" varchar
);

CREATE TABLE "roles" (
  "id_rol" serial PRIMARY KEY,
  "nombre_rol" varchar
);

CREATE TABLE "descripciones_rol" (
  "id_descripcion_rol" serial PRIMARY KEY,
  "id_rol" int UNIQUE,
  "descripcion" text
);

CREATE TABLE "tipo_cliente" (
  "id_tipo_cliente" serial PRIMARY KEY,
  "nombre_tipo" varchar
);

CREATE TABLE "descripciones_tipo_cliente" (
  "id_descripcion_tipo" serial PRIMARY KEY,
  "id_tipo_cliente" int UNIQUE,
  "descripcion" text
);

CREATE TABLE "usuarios" (
  "id_usuario" serial PRIMARY KEY,
  "id_rol" int,
  "id_estado_usuario" int,
  "correo_electronico" varchar UNIQUE,
  "password_hash" varchar
);

CREATE TABLE "datos_usuario" (
  "id_datos_usuario" serial PRIMARY KEY,
  "id_usuario" int UNIQUE,
  "nombre" varchar,
  "apellido" varchar,
  "carnet_identidad" varchar UNIQUE,
  "fecha_nacimiento" date,
  "telefono" varchar,
  "fecha_registro" timestamp
);

CREATE TABLE "clientes" (
  "id_cliente" serial PRIMARY KEY,
  "id_tipo_cliente" int,
  "id_rol" int,
  "id_estado_cliente" int,
  "correo_electronico" varchar UNIQUE,
  "password_hash" varchar,
  "fecha_registro" timestamp
);

CREATE TABLE "datos_cliente_persona" (
  "id_datos_persona" serial PRIMARY KEY,
  "id_cliente" int UNIQUE,
  "nombre" varchar,
  "apellido" varchar,
  "telefono" varchar,
  "fecha_nacimiento" date
);

CREATE TABLE "datos_cliente_institucional" (
  "id_datos_institucional" serial PRIMARY KEY,
  "id_cliente" int UNIQUE,
  "razon_social" varchar,
  "nit" varchar,
  "nombre_contacto" varchar,
  "telefono_contacto" varchar
);

CREATE TABLE "atributos_cliente" (
  "id_atributo_cliente" serial PRIMARY KEY,
  "id_cliente" int,
  "nombre_atributo" varchar,
  "valor_atributo" varchar
);

CREATE TABLE "contratos" (
  "id_contrato" serial PRIMARY KEY,
  "id_datos_institucional" int,
  "numero_contrato" varchar UNIQUE,
  "fecha_firma" date,
  "fecha_vencimiento" date,
  "url_clausulas_pdf" varchar
);

CREATE TABLE "estados_pedido" (
  "id_estado_pedido" serial PRIMARY KEY,
  "nombre_estado" varchar
);

CREATE TABLE "estados_pago" (
  "id_estado_pago" serial PRIMARY KEY,
  "nombre_estado" varchar
);

CREATE TABLE "metodos_pago" (
  "id_metodo_pago" serial PRIMARY KEY,
  "nombre_metodo" varchar
);

CREATE TABLE "estados_cita" (
  "id_estado_cita" serial PRIMARY KEY,
  "nombre_estado" varchar
);

CREATE TABLE "pedidos" (
  "id_pedido" serial PRIMARY KEY,
  "id_cliente" int,
  "id_estado_pedido" int,
  "fecha_inicio" timestamp,
  "fecha_prueba" timestamp,
  "fecha_entrega" timestamp,
  "costo_total" decimal
);

CREATE TABLE "catalogo" (
  "id_catalogo" serial PRIMARY KEY,
  "nombre_catalogo" varchar,
  "url_imagen_catalogo" varchar
);

CREATE TABLE "descripciones_catalogo" (
  "id_descripcion_catalogo" serial PRIMARY KEY,
  "id_catalogo" int UNIQUE,
  "descripcion" text
);

CREATE TABLE "tipos_prenda" (
  "id_tipo_prenda" serial PRIMARY KEY,
  "nombre_tipo" varchar
);

CREATE TABLE "prendas" (
  "id_prenda" serial PRIMARY KEY,
  "id_catalogo" int,
  "id_tipo_prenda" int,
  "id_color" int
);

CREATE TABLE "descripciones_prenda" (
  "id_descripcion_prenda" serial PRIMARY KEY,
  "id_prenda" int UNIQUE,
  "descripcion_detallada" text
);

CREATE TABLE "detalle_pedido" (
  "id_detalle" serial PRIMARY KEY,
  "id_pedido" int,
  "id_prenda" int,
  "cantidad" integer,
  "subtotal" decimal
);

CREATE TABLE "notas_diseno_detalle" (
  "id_nota_diseno" serial PRIMARY KEY,
  "id_detalle" int UNIQUE,
  "notas_diseno" text
);

CREATE TABLE "medidas_anatomicas" (
  "id_medida_anatomica" serial PRIMARY KEY,
  "id_detalle" int UNIQUE,
  "cortas" decimal,
  "cintura" decimal,
  "frente" decimal,
  "alto_cadera" decimal,
  "cadera" decimal,
  "entre_busto" decimal,
  "busto" decimal,
  "espalda" decimal,
  "hombro" decimal
);

CREATE TABLE "medidas_convencionales" (
  "id_medida_convencional" serial PRIMARY KEY,
  "id_detalle" int UNIQUE,
  "talla" varchar,
  "equivalencia_europea" varchar
);

CREATE TABLE "pagos" (
  "id_pago" serial PRIMARY KEY,
  "id_pedido" int,
  "id_estado_pago" int,
  "id_metodo_pago" int,
  "monto_pago" decimal,
  "fecha_pago" timestamp
);

CREATE TABLE "citas" (
  "id_cita" serial PRIMARY KEY,
  "id_cliente" int,
  "id_pedido" int,
  "id_estado_cita" int,
  "fecha_cita" timestamp,
  "motivo_cita" varchar
);

CREATE TABLE "colores" (
  "id_color" serial PRIMARY KEY,
  "nombre_color" varchar,
  "codigo_hexadecimal" varchar
);

CREATE TABLE "materiales_base" (
  "id_material_base" serial PRIMARY KEY,
  "nombre_material" varchar
);

CREATE TABLE "unidades_medida" (
  "id_unidad_medida" serial PRIMARY KEY,
  "abreviatura" varchar,
  "descripcion" varchar
);

CREATE TABLE "categorias_almacen" (
  "id_categoria" serial PRIMARY KEY,
  "nombre_categoria" varchar
);

CREATE TABLE "tipos_producto" (
  "id_tipo_producto" serial PRIMARY KEY,
  "id_categoria" int,
  "nombre_tipo" varchar
);

CREATE TABLE "productos_almacen" (
  "id_producto" serial PRIMARY KEY,
  "id_tipo_producto" int,
  "id_unidad_medida" int,
  "id_color" int,
  "id_material_base" int,
  "nombre_articulo" varchar,
  "cantidad_stock" decimal,
  "stock_minimo" decimal
);

CREATE TABLE "detalles_tecnicos_producto" (
  "id_producto" int PRIMARY KEY,
  "caracteristica_principal" varchar,
  "caracteristica_secundaria" varchar,
  "observaciones_tecnicas" text
);

CREATE TABLE "descuentos" (
  "id_descuento" serial PRIMARY KEY,
  "id_tipo_cliente" int,
  "nombre_descuento" varchar,
  "porcentaje" decimal
);

CREATE TABLE "notas_venta" (
  "id_nota_venta" serial PRIMARY KEY,
  "id_pedido" int UNIQUE,
  "id_descuento" int,
  "numero_nota" varchar UNIQUE,
  "fecha_emision" timestamp,
  "subtotal" decimal,
  "total_final" decimal,
  "estado_envio_correo" varchar
);

CREATE TABLE "proveedores" (
  "id_proveedor" serial PRIMARY KEY,
  "nombre_empresa" varchar,
  "nombre_contacto" varchar,
  "telefono_contacto" varchar,
  "direccion" varchar
);

CREATE TABLE "tipos_movimiento" (
  "id_tipo_movimiento" serial PRIMARY KEY,
  "nombre_movimiento" varchar
);

CREATE TABLE "origenes_material" (
  "id_origen" serial PRIMARY KEY,
  "nombre_origen" varchar
);

CREATE TABLE "movimientos_almacen" (
  "id_movimiento" serial PRIMARY KEY,
  "id_producto" int,
  "id_proveedor" int,
  "id_detalle_pedido" int,
  "id_tipo_movimiento" int,
  "id_origen" int,
  "cantidad" decimal,
  "fecha_movimiento" timestamp
);

CREATE TABLE "observaciones_movimiento" (
  "id_observacion" serial PRIMARY KEY,
  "id_movimiento" int UNIQUE,
  "observacion" text
);

ALTER TABLE "descripciones_rol" ADD FOREIGN KEY ("id_rol") REFERENCES "roles" ("id_rol") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "descripciones_tipo_cliente" ADD FOREIGN KEY ("id_tipo_cliente") REFERENCES "tipo_cliente" ("id_tipo_cliente") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "usuarios" ADD FOREIGN KEY ("id_rol") REFERENCES "roles" ("id_rol") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "usuarios" ADD FOREIGN KEY ("id_estado_usuario") REFERENCES "estados_usuario" ("id_estado_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "datos_usuario" ADD FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "clientes" ADD FOREIGN KEY ("id_tipo_cliente") REFERENCES "tipo_cliente" ("id_tipo_cliente") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "clientes" ADD FOREIGN KEY ("id_rol") REFERENCES "roles" ("id_rol") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "clientes" ADD FOREIGN KEY ("id_estado_cliente") REFERENCES "estados_cliente" ("id_estado_cliente") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "datos_cliente_persona" ADD FOREIGN KEY ("id_cliente") REFERENCES "clientes" ("id_cliente") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "datos_cliente_institucional" ADD FOREIGN KEY ("id_cliente") REFERENCES "clientes" ("id_cliente") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "atributos_cliente" ADD FOREIGN KEY ("id_cliente") REFERENCES "clientes" ("id_cliente") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "contratos" ADD FOREIGN KEY ("id_datos_institucional") REFERENCES "datos_cliente_institucional" ("id_datos_institucional") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pedidos" ADD FOREIGN KEY ("id_cliente") REFERENCES "clientes" ("id_cliente") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pedidos" ADD FOREIGN KEY ("id_estado_pedido") REFERENCES "estados_pedido" ("id_estado_pedido") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "descripciones_catalogo" ADD FOREIGN KEY ("id_catalogo") REFERENCES "catalogo" ("id_catalogo") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "prendas" ADD FOREIGN KEY ("id_catalogo") REFERENCES "catalogo" ("id_catalogo") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "prendas" ADD FOREIGN KEY ("id_tipo_prenda") REFERENCES "tipos_prenda" ("id_tipo_prenda") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "prendas" ADD FOREIGN KEY ("id_color") REFERENCES "colores" ("id_color") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "descripciones_prenda" ADD FOREIGN KEY ("id_prenda") REFERENCES "prendas" ("id_prenda") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "detalle_pedido" ADD FOREIGN KEY ("id_pedido") REFERENCES "pedidos" ("id_pedido") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "detalle_pedido" ADD FOREIGN KEY ("id_prenda") REFERENCES "prendas" ("id_prenda") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notas_diseno_detalle" ADD FOREIGN KEY ("id_detalle") REFERENCES "detalle_pedido" ("id_detalle") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "medidas_anatomicas" ADD FOREIGN KEY ("id_detalle") REFERENCES "detalle_pedido" ("id_detalle") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "medidas_convencionales" ADD FOREIGN KEY ("id_detalle") REFERENCES "detalle_pedido" ("id_detalle") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pagos" ADD FOREIGN KEY ("id_pedido") REFERENCES "pedidos" ("id_pedido") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pagos" ADD FOREIGN KEY ("id_estado_pago") REFERENCES "estados_pago" ("id_estado_pago") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pagos" ADD FOREIGN KEY ("id_metodo_pago") REFERENCES "metodos_pago" ("id_metodo_pago") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "citas" ADD FOREIGN KEY ("id_cliente") REFERENCES "clientes" ("id_cliente") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "citas" ADD FOREIGN KEY ("id_pedido") REFERENCES "pedidos" ("id_pedido") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "citas" ADD FOREIGN KEY ("id_estado_cita") REFERENCES "estados_cita" ("id_estado_cita") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tipos_producto" ADD FOREIGN KEY ("id_categoria") REFERENCES "categorias_almacen" ("id_categoria") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "productos_almacen" ADD FOREIGN KEY ("id_tipo_producto") REFERENCES "tipos_producto" ("id_tipo_producto") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "productos_almacen" ADD FOREIGN KEY ("id_unidad_medida") REFERENCES "unidades_medida" ("id_unidad_medida") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "productos_almacen" ADD FOREIGN KEY ("id_color") REFERENCES "colores" ("id_color") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "productos_almacen" ADD FOREIGN KEY ("id_material_base") REFERENCES "materiales_base" ("id_material_base") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "detalles_tecnicos_producto" ADD FOREIGN KEY ("id_producto") REFERENCES "productos_almacen" ("id_producto") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "descuentos" ADD FOREIGN KEY ("id_tipo_cliente") REFERENCES "tipo_cliente" ("id_tipo_cliente") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notas_venta" ADD FOREIGN KEY ("id_pedido") REFERENCES "pedidos" ("id_pedido") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notas_venta" ADD FOREIGN KEY ("id_descuento") REFERENCES "descuentos" ("id_descuento") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "movimientos_almacen" ADD FOREIGN KEY ("id_producto") REFERENCES "productos_almacen" ("id_producto") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "movimientos_almacen" ADD FOREIGN KEY ("id_proveedor") REFERENCES "proveedores" ("id_proveedor") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "movimientos_almacen" ADD FOREIGN KEY ("id_detalle_pedido") REFERENCES "detalle_pedido" ("id_detalle") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "movimientos_almacen" ADD FOREIGN KEY ("id_tipo_movimiento") REFERENCES "tipos_movimiento" ("id_tipo_movimiento") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "movimientos_almacen" ADD FOREIGN KEY ("id_origen") REFERENCES "origenes_material" ("id_origen") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "observaciones_movimiento" ADD FOREIGN KEY ("id_movimiento") REFERENCES "movimientos_almacen" ("id_movimiento") DEFERRABLE INITIALLY IMMEDIATE;


-- Extensiones y columnas de compatibilidad operativas
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "debe_cambiar_password" boolean DEFAULT false;
ALTER TABLE "pedidos" ADD COLUMN IF NOT EXISTS "id_costurera" int REFERENCES "usuarios"("id_usuario");
