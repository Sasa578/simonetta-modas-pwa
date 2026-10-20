# DICCIONARIO DE DATOS DE LA BASE DE DATOS
## SISTEMA DE GESTIÓN INTEGRAL Y CONFECCIÓN DE ALTA COSTURA "SIMONETTA MODAS PWA"

- **Motor de Base de Datos:** PostgreSQL (v14+)
- **Base de Datos:** `simonetta_modas_db`
- **Esquema:** `public`
- **Nivel de Normalización:** 3ra Forma Normal (3FN) y Forma Normal de Boyce-Codd (BCNF)
- **Total de Tablas:** 49 tablas

---

### ESTRUCTURA DE LAS TABLAS DEL DICCIONARIO
De acuerdo con las directrices académicas, cada tabla del sistema presenta el siguiente formato estándar:

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |

---

## 1. Subsistema de Seguridad, Usuarios y Control de Acceso (RBAC)

### 1. Tabla: `roles`
**Descripción / Propósito:** Catálogo de perfiles o roles operativos asignables al personal y usuarios del sistema.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_rol` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del rol. (Requerido (NOT NULL)). |
| 2 | `nombre_rol` | VARCHAR | Nombre formal del rol (Admin, Secretaria, Costurera, Cliente). (Opcional (NULL)). |

### 2. Tabla: `descripciones_rol`
**Descripción / Propósito:** Documentación funcional de alcances, permisos y responsabilidades de cada rol.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_descripcion_rol` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del registro descriptivo. (Requerido (NOT NULL)). |
| 2 | `id_rol` | INTEGER | [FK -> roles.id_rol] Clave foránea que referencia al rol correspondiente (roles.id_rol). (Opcional (NULL)). |
| 3 | `descripcion` | TEXT | Texto descriptivo con las funciones y alcances operativos del perfil. (Opcional (NULL)). |

### 3. Tabla: `estados_usuario`
**Descripción / Propósito:** Catálogo de estados de habilitación y vigencia de las cuentas de usuario.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_estado_usuario` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del estado. (Requerido (NOT NULL)). |
| 2 | `nombre_estado` | VARCHAR | Denominación del estado (Activo, Inactivo, Bloqueado, Suspendido). (Opcional (NULL)). |

### 4. Tabla: `usuarios`
**Descripción / Propósito:** Credenciales de acceso, autenticación y seguridad para el personal del taller y administradores.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_usuario` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del usuario. (Requerido (NOT NULL)). |
| 2 | `id_rol` | INTEGER | [FK -> roles.id_rol] Clave foránea que define el rol y permisos operativos (roles.id_rol). (Opcional (NULL)). |
| 3 | `id_estado_usuario` | INTEGER | [FK -> estados_usuario.id_estado_usuario] Clave foránea del estado de la cuenta (estados_usuario.id_estado_usuario). (Opcional (NULL)). |
| 4 | `correo_electronico` | VARCHAR | Correo electrónico único de inicio de sesión. (Opcional (NULL)). |
| 5 | `password_hash` | VARCHAR | Campo password_hash de la entidad usuarios. (Opcional (NULL)). |
| 6 | `debe_cambiar_password` | BOOLEAN | Campo debe_cambiar_password de la entidad usuarios. (Opcional (NULL)). |

### 5. Tabla: `datos_usuario`
**Descripción / Propósito:** Información civil, personal y de contacto directo de los trabajadores del taller.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_datos_usuario` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de datos personales. (Requerido (NOT NULL)). |
| 2 | `id_usuario` | INTEGER | [FK -> usuarios.id_usuario] Clave foránea 1-a-1 hacia la cuenta del usuario (usuarios.id_usuario). (Opcional (NULL)). |
| 3 | `nombre` | VARCHAR | Nombre de pila del trabajador. (Opcional (NULL)). |
| 4 | `apellido` | VARCHAR | Apellidos completos del trabajador. (Opcional (NULL)). |
| 5 | `carnet_identidad` | VARCHAR | Cédula de identidad civil (CI). (Opcional (NULL)). |
| 6 | `fecha_nacimiento` | DATE | Fecha de nacimiento del trabajador. (Opcional (NULL)). |
| 7 | `telefono` | VARCHAR | Número de teléfono o celular de contacto directo. (Opcional (NULL)). |
| 8 | `fecha_registro` | TIMESTAMP | Campo fecha_registro de la entidad datos_usuario. (Opcional (NULL)). |


## 2. Subsistema de Clientes y Segmentación Comercial

### 6. Tabla: `tipo_cliente`
**Descripción / Propósito:** Clasificación de personería jurídica y comercial de los clientes del taller.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_tipo_cliente` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del tipo de cliente. (Requerido (NOT NULL)). |
| 2 | `nombre_tipo` | VARCHAR | Nombre del tipo (Persona Natural, Institucional / Empresa). (Opcional (NULL)). |

### 7. Tabla: `descripciones_tipo_cliente`
**Descripción / Propósito:** Especificación de tratamientos comerciales y requisitos fiscales por tipo de cliente.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_descripcion_tipo` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la descripción. (Requerido (NOT NULL)). |
| 2 | `id_tipo_cliente` | INTEGER | [FK -> tipo_cliente.id_tipo_cliente] Clave foránea hacia el tipo de cliente (tipo_cliente.id_tipo_cliente). (Opcional (NULL)). |
| 3 | `descripcion` | TEXT | Detalle de condiciones comerciales y tributarias. (Opcional (NULL)). |

### 8. Tabla: `estados_cliente`
**Descripción / Propósito:** Catálogo de estados de la relación comercial con los clientes.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_estado_cliente` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del estado de cliente. (Requerido (NOT NULL)). |
| 2 | `nombre_estado` | VARCHAR | Nombre del estado (Activo, Inactivo, Frecuente, Moroso). (Opcional (NULL)). |

### 9. Tabla: `clientes`
**Descripción / Propósito:** Entidad central que registra a los clientes para órdenes de confección, citas y pedidos.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_cliente` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del cliente. (Requerido (NOT NULL)). |
| 2 | `id_tipo_cliente` | INTEGER | [FK -> tipo_cliente.id_tipo_cliente] Clave foránea que categoriza al cliente (tipo_cliente.id_tipo_cliente). (Opcional (NULL)). |
| 3 | `id_rol` | INTEGER | [FK -> roles.id_rol] Clave foránea que asigna el perfil de acceso (roles.id_rol). (Opcional (NULL)). |
| 4 | `id_estado_cliente` | INTEGER | [FK -> estados_cliente.id_estado_cliente] Clave foránea del estado comercial (estados_cliente.id_estado_cliente). (Opcional (NULL)). |
| 5 | `correo_electronico` | VARCHAR | Correo electrónico de contacto y notificación del cliente. (Opcional (NULL)). |
| 6 | `password_hash` | VARCHAR | Hash criptográfico Bcrypt para inicio de sesión en el portal PWA. (Opcional (NULL)). |
| 7 | `fecha_registro` | TIMESTAMP | Fecha de registro del cliente en el taller. (Opcional (NULL)). |

### 10. Tabla: `datos_cliente_persona`
**Descripción / Propósito:** Datos personales y de contacto para clientes registrados como personas naturales.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_datos_persona` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de datos de persona natural. (Requerido (NOT NULL)). |
| 2 | `id_cliente` | INTEGER | [FK -> clientes.id_cliente] Clave foránea hacia el cliente registrado (clientes.id_cliente). (Opcional (NULL)). |
| 3 | `nombre` | VARCHAR | Nombre de pila del cliente. (Opcional (NULL)). |
| 4 | `apellido` | VARCHAR | Apellidos completos del cliente. (Opcional (NULL)). |
| 5 | `telefono` | VARCHAR | Número de WhatsApp o teléfono principal de contacto. (Opcional (NULL)). |
| 6 | `fecha_nacimiento` | DATE | Fecha de nacimiento del cliente (para promociones y perfil). (Opcional (NULL)). |

### 11. Tabla: `datos_cliente_institucional`
**Descripción / Propósito:** Datos corporativos, fiscales y de contacto para empresas, comparsas o instituciones.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_datos_institucional` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de datos corporativos. (Requerido (NOT NULL)). |
| 2 | `id_cliente` | INTEGER | [FK -> clientes.id_cliente] Clave foránea hacia el cliente registrado (clientes.id_cliente). (Opcional (NULL)). |
| 3 | `razon_social` | VARCHAR | Razón social o denominación legal de la entidad. (Opcional (NULL)). |
| 4 | `nit` | VARCHAR | Número de Identificación Tributaria (NIT) o código fiscal. (Opcional (NULL)). |
| 5 | `nombre_contacto` | VARCHAR | Nombre completo del representante o encargado de compras. (Opcional (NULL)). |
| 6 | `telefono_contacto` | VARCHAR | Teléfono corporativo de coordinación. (Opcional (NULL)). |

### 12. Tabla: `atributos_cliente`
**Descripción / Propósito:** Tabla de atributos clave-valor para personalización y preferencias especiales del cliente.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_atributo_cliente` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del atributo. (Requerido (NOT NULL)). |
| 2 | `id_cliente` | INTEGER | [FK -> clientes.id_cliente] Clave foránea hacia el cliente (clientes.id_cliente). (Opcional (NULL)). |
| 3 | `nombre_atributo` | VARCHAR | Denominación del atributo (ej. Preferencia de tela, Estilo de corte). (Opcional (NULL)). |
| 4 | `valor_atributo` | VARCHAR | Valor asignado a la preferencia del cliente. (Opcional (NULL)). |


## 3. Subsistema de Inventario, Insumos Textiles y Almacén (Kardex)

### 13. Tabla: `categorias_almacen`
**Descripción / Propósito:** Grupos generales para clasificar y organizar insumos y mercaderías de almacén.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_categoria` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la categoría de almacén. (Requerido (NOT NULL)). |
| 2 | `nombre_categoria` | VARCHAR | Nombre de la categoría (Telas, Botones, Hilos, Cierres, Adornos). (Opcional (NULL)). |

### 14. Tabla: `materiales_base`
**Descripción / Propósito:** Catálogo de materias primas y composiciones básicas de insumos textiles.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_material_base` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del material base. (Requerido (NOT NULL)). |
| 2 | `nombre_material` | VARCHAR | Denominación de la fibra o material (Algodón, Seda, Lino, Poliéster, Lana, Metal, Plástico). (Opcional (NULL)). |

### 15. Tabla: `tipos_producto`
**Descripción / Propósito:** Variedades y tipos específicos de artículos e insumos vinculados a una categoría.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_tipo_producto` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del tipo de producto. (Requerido (NOT NULL)). |
| 2 | `id_categoria` | INTEGER | [FK -> categorias_almacen.id_categoria] Clave foránea de la categoría a la que pertenece (categorias_almacen.id_categoria). (Opcional (NULL)). |
| 3 | `nombre_tipo` | VARCHAR | Nombre comercial del tipo (Seda Francesa, Lino Italiano, Raso Nupcial, Cierre Invisible, etc.). (Opcional (NULL)). |

### 16. Tabla: `unidades_medida`
**Descripción / Propósito:** Unidades estándar de cuantificación física para inventario y patronaje.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_unidad_medida` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la unidad de medida. (Requerido (NOT NULL)). |
| 2 | `abreviatura` | VARCHAR | Símbolo formal de la unidad (m, cm, uds, yd, paq, car). (Opcional (NULL)). |
| 3 | `descripcion` | VARCHAR | Nombre completo de la unidad (Metros, Centímetros, Unidades, Yardas, Paquetes, Carretes). (Opcional (NULL)). |

### 17. Tabla: `colores`
**Descripción / Propósito:** Catálogo cromático para telas, forros, avíos e hilos de alta costura.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_color` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del color. (Requerido (NOT NULL)). |
| 2 | `nombre_color` | VARCHAR | Nombre descriptivo del matiz (Rojo Borgoña, Azul Marino, Blanco Nupcial, etc.). (Opcional (NULL)). |
| 3 | `codigo_hexadecimal` | VARCHAR | Código hexadecimal web (#RRGGBB) para renderizado en la interfaz. (Opcional (NULL)). |

### 18. Tabla: `origenes_material`
**Descripción / Propósito:** Define si el insumo procede del inventario del taller o fue provisto directamente por el cliente.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_origen` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del origen de material. (Requerido (NOT NULL)). |
| 2 | `nombre_origen` | VARCHAR | Denominación del origen (Taller: stock propio con costo, Cliente: provisto sin costo de almacén). (Opcional (NULL)). |

### 19. Tabla: `proveedores`
**Descripción / Propósito:** Empresas y comerciantes distribuidores mayoristas de telas e insumos textiles.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_proveedor` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del proveedor. (Requerido (NOT NULL)). |
| 2 | `nombre_empresa` | VARCHAR | Campo nombre_empresa de la entidad proveedores. (Opcional (NULL)). |
| 3 | `nombre_contacto` | VARCHAR | Campo nombre_contacto de la entidad proveedores. (Opcional (NULL)). |
| 4 | `telefono_contacto` | VARCHAR | Campo telefono_contacto de la entidad proveedores. (Opcional (NULL)). |
| 5 | `direccion` | VARCHAR | Ubicación física de la distribuidora textil. (Opcional (NULL)). |

### 20. Tabla: `productos_almacen`
**Descripción / Propósito:** Artículos e insumos inventariados en el almacén del taller con existencias y costos.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del producto en almacén. (Requerido (NOT NULL)). |
| 2 | `id_tipo_producto` | INTEGER | [FK -> tipos_producto.id_tipo_producto] Clave foránea del tipo de producto (tipos_producto.id_tipo_producto). (Opcional (NULL)). |
| 3 | `id_unidad_medida` | INTEGER | [FK -> unidades_medida.id_unidad_medida] Clave foránea de la unidad de medida física (unidades_medida.id_unidad_medida). (Opcional (NULL)). |
| 4 | `id_color` | INTEGER | [FK -> colores.id_color] Clave foránea del color asignado (colores.id_color). (Opcional (NULL)). |
| 5 | `id_material_base` | INTEGER | [FK -> materiales_base.id_material_base] Campo id_material_base de la entidad productos_almacen. (Opcional (NULL)). |
| 6 | `nombre_articulo` | VARCHAR | Campo nombre_articulo de la entidad productos_almacen. (Opcional (NULL)). |
| 7 | `cantidad_stock` | NUMERIC | Campo cantidad_stock de la entidad productos_almacen. (Opcional (NULL)). |
| 8 | `stock_minimo` | NUMERIC | Umbral mínimo de inventario para disparar alertas de reabastecimiento. (Opcional (NULL)). |

### 21. Tabla: `detalles_tecnicos_producto`
**Descripción / Propósito:** Especificaciones técnicas profundas de composición textil, ancho utilizable y gramaje.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | INTEGER | [PK] Clave foránea 1-a-1 hacia el producto en almacén (productos_almacen.id_producto). (Requerido (NOT NULL)). |
| 2 | `caracteristica_principal` | VARCHAR | Campo caracteristica_principal de la entidad detalles_tecnicos_producto. (Opcional (NULL)). |
| 3 | `caracteristica_secundaria` | VARCHAR | Campo caracteristica_secundaria de la entidad detalles_tecnicos_producto. (Opcional (NULL)). |
| 4 | `observaciones_tecnicas` | TEXT | Campo observaciones_tecnicas de la entidad detalles_tecnicos_producto. (Opcional (NULL)). |

### 22. Tabla: `tipos_movimiento`
**Descripción / Propósito:** Tipología formal de operaciones registrables en la bitácora Kardex de almacén.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_tipo_movimiento` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del tipo de movimiento. (Requerido (NOT NULL)). |
| 2 | `nombre_movimiento` | VARCHAR | Campo nombre_movimiento de la entidad tipos_movimiento. (Opcional (NULL)). |

### 23. Tabla: `observaciones_movimiento`
**Descripción / Propósito:** Registro de justificaciones técnicas o notas auditables asociadas a movimientos de inventario.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_observacion` | SERIAL (INTEGER) | [PK] Campo id_observacion de la entidad observaciones_movimiento. (Requerido (NOT NULL)). |
| 2 | `id_movimiento` | INTEGER | [FK -> movimientos_almacen.id_movimiento] Clave foránea hacia el movimiento Kardex (movimientos_almacen.id_movimiento). (Opcional (NULL)). |
| 3 | `observacion` | TEXT | Texto descriptivo con la justificación del movimiento, merma o ajuste. (Opcional (NULL)). |

### 24. Tabla: `movimientos_almacen`
**Descripción / Propósito:** Bitácora transaccional inmutable (Kardex) de entradas, salidas y saldos físicos de insumos.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_movimiento` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del movimiento de inventario. (Requerido (NOT NULL)). |
| 2 | `id_producto` | INTEGER | [FK -> productos_almacen.id_producto] Clave foránea del producto afectado (productos_almacen.id_producto). (Opcional (NULL)). |
| 3 | `id_proveedor` | INTEGER | [FK -> proveedores.id_proveedor] Campo id_proveedor de la entidad movimientos_almacen. (Opcional (NULL)). |
| 4 | `id_detalle_pedido` | INTEGER | [FK -> detalle_pedido.id_detalle] Campo id_detalle_pedido de la entidad movimientos_almacen. (Opcional (NULL)). |
| 5 | `id_tipo_movimiento` | INTEGER | [FK -> tipos_movimiento.id_tipo_movimiento] Clave foránea del tipo de operación (tipos_movimiento.id_tipo_movimiento). (Opcional (NULL)). |
| 6 | `id_origen` | INTEGER | [FK -> origenes_material.id_origen] Clave foránea que define procedencia de material (origenes_material.id_origen). (Opcional (NULL)). |
| 7 | `cantidad` | NUMERIC | Cantidad de insumos movidos (positivo para entradas, negativo para salidas). (Opcional (NULL)). |
| 8 | `fecha_movimiento` | TIMESTAMP | Fecha y hora exacta del registro inmutable en el Kardex. (Opcional (NULL)). |


## 4. Subsistema de Pedidos, Prendas y Confección

### 25. Tabla: `estados_pedido`
**Descripción / Propósito:** Catálogo de estados de ciclo de vida del pedido a través de las fases de producción.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_estado_pedido` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del estado del pedido. (Requerido (NOT NULL)). |
| 2 | `nombre_estado` | VARCHAR | Nombre formal del estado (Pendiente, En Confección, En Prueba, Listo, Entregado, Cancelado). (Opcional (NULL)). |

### 26. Tabla: `tipos_prenda`
**Descripción / Propósito:** Clasificación de modelos y tipologías de prendas confeccionables en el taller.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_tipo_prenda` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del tipo de prenda. (Requerido (NOT NULL)). |
| 2 | `nombre_tipo` | VARCHAR | Nombre del modelo (Vestido de Gala, Traje Formal, Falda, Pantalón, Blusa, Corset). (Opcional (NULL)). |

### 27. Tabla: `descripciones_prenda`
**Descripción / Propósito:** Descripción general y conceptual del diseño de la prenda solicitada.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_descripcion_prenda` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la descripción general. (Requerido (NOT NULL)). |
| 2 | `id_prenda` | INTEGER | [FK -> prendas.id_prenda] Campo id_prenda de la entidad descripciones_prenda. (Opcional (NULL)). |
| 3 | `descripcion_detallada` | TEXT | Campo descripcion_detallada de la entidad descripciones_prenda. (Opcional (NULL)). |
| 4 | `descripcion_general` | VARCHAR(255) | Texto descriptivo del concepto estético de la prenda. (Opcional (NULL)). |

### 28. Tabla: `descripciones_detalladas_prenda`
**Descripción / Propósito:** Normalización de especificaciones técnicas profundas de patronaje, armado, corte y cuidados.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_descripcion_detallada` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la especificación técnica. (Requerido (NOT NULL)). |
| 2 | `id_descripcion_prenda` | INTEGER | [FK -> descripciones_prenda.id_descripcion_prenda] Clave foránea 1-a-1 hacia la descripción general (descripciones_prenda.id_descripcion_prenda). (Opcional (NULL)). |
| 3 | `descripcion_detallada` | TEXT | Detalles específicos de ensamblado, forrería, costuras y entretelas. (Opcional (NULL)). |
| 4 | `especificaciones_patronaje` | TEXT | Instrucciones para mesa de corte, holguras, pinzas y patronistas. (Opcional (NULL)). |
| 5 | `cuidados_recomendados` | TEXT | Normas recomendadas de lavado, planchado y conservación de la prenda. (Opcional (NULL)). |

### 29. Tabla: `prendas`
**Descripción / Propósito:** Entidad que representa una prenda específica a ser confeccionada en una orden de trabajo.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_prenda` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la prenda. (Requerido (NOT NULL)). |
| 2 | `id_catalogo` | INTEGER | [FK -> catalogo.id_catalogo] Campo id_catalogo de la entidad prendas. (Opcional (NULL)). |
| 3 | `id_tipo_prenda` | INTEGER | [FK -> tipos_prenda.id_tipo_prenda] Clave foránea del tipo de prenda (tipos_prenda.id_tipo_prenda). (Opcional (NULL)). |
| 4 | `id_color` | INTEGER | [FK -> colores.id_color] Clave foránea del color principal seleccionado (colores.id_color). (Opcional (NULL)). |

### 30. Tabla: `pedidos`
**Descripción / Propósito:** Orden de trabajo principal que articula al cliente, la costurera asignada, fechas límite y costos.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_pedido` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del pedido de confección. (Requerido (NOT NULL)). |
| 2 | `id_cliente` | INTEGER | [FK -> clientes.id_cliente] Clave foránea del cliente contratante (clientes.id_cliente). (Opcional (NULL)). |
| 3 | `id_estado_pedido` | INTEGER | [FK -> estados_pedido.id_estado_pedido] Clave foránea del estado de avance en producción (estados_pedido.id_estado_pedido). (Opcional (NULL)). |
| 4 | `fecha_inicio` | TIMESTAMP | Fecha y hora de registro y apertura de la orden de confección. (Opcional (NULL)). |
| 5 | `fecha_prueba` | TIMESTAMP | Fecha programada para la primera prueba de calce y ajuste. (Opcional (NULL)). |
| 6 | `fecha_entrega` | TIMESTAMP | Fecha comprometida de finalización y entrega al cliente. (Opcional (NULL)). |
| 7 | `costo_total` | NUMERIC | Monto total pactado para el trabajo de confección en moneda local (Bs). (Opcional (NULL)). |
| 8 | `id_costurera` | INTEGER | [FK -> usuarios.id_usuario] Clave foránea del usuario costurera responsable (usuarios.id_usuario). (Opcional (NULL)). |

### 31. Tabla: `detalle_pedido`
**Descripción / Propósito:** Desglose de prendas individuales, cantidades y subtotales monetarios que componen el pedido.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_detalle` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la línea de detalle del pedido. (Requerido (NOT NULL)). |
| 2 | `id_pedido` | INTEGER | [FK -> pedidos.id_pedido] Clave foránea del pedido principal contenedor (pedidos.id_pedido). (Opcional (NULL)). |
| 3 | `id_prenda` | INTEGER | [FK -> prendas.id_prenda] Clave foránea de la prenda a confeccionar (prendas.id_prenda). (Opcional (NULL)). |
| 4 | `cantidad` | INTEGER | Número de unidades idénticas a confeccionar. (Opcional (NULL)). |
| 5 | `subtotal` | NUMERIC | Importe subtotal calculado de la línea (cantidad * precio_unitario). (Opcional (NULL)). |

### 32. Tabla: `notas_diseno_detalle`
**Descripción / Propósito:** Anotaciones particulares y acuerdos estéticos entre el cliente y el taller para cada prenda.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_nota_diseno` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la nota de diseño. (Requerido (NOT NULL)). |
| 2 | `id_detalle` | INTEGER | [FK -> detalle_pedido.id_detalle] Clave foránea hacia el detalle del pedido (detalle_pedido.id_detalle). (Opcional (NULL)). |
| 3 | `notas_diseno` | TEXT | Texto con especificaciones de escote, largo de falda, caídas o aplicaciones especiales. (Opcional (NULL)). |


## 5. Subsistema de Medidas Corporales y Patronaje Industrial

### 33. Tabla: `rangos_edad`
**Descripción / Propósito:** Catálogo normalizado de segmentos etarios para escalado anatómico y patronaje industrial.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_rango_edad` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del rango etario. (Requerido (NOT NULL)). |
| 2 | `nombre_rango` | VARCHAR(50) | Nombre formal del rango (Adulto, Adolescente, Niño). (Requerido (NOT NULL)). |
| 3 | `descripcion` | VARCHAR(150) | Definición de límites de edad y proporciones corporales aplicadas. (Opcional (NULL)). |

### 34. Tabla: `generos`
**Descripción / Propósito:** Catálogo de género morfológico aplicado al trazo de patrones y siluetas.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_genero` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del género morfológico. (Requerido (NOT NULL)). |
| 2 | `nombre_genero` | VARCHAR(50) | Denominación del género (Mujer, Varón, Unisex). (Requerido (NOT NULL)). |

### 35. Tabla: `tallas_estandar`
**Descripción / Propósito:** Catálogo normalizado de tallas comerciales con equivalencias numéricas europeas.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_talla_estandar` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la talla estándar. (Requerido (NOT NULL)). |
| 2 | `nombre_talla` | VARCHAR(10) | Código comercial de la talla (XS, S, M, L, XL, XXL). (Requerido (NOT NULL)). |
| 3 | `equivalencia_europea` | VARCHAR(20) | Equivalencia en tallaje numérico europeo (ej. 34-36, 38-40, 42-44). (Opcional (NULL)). |
| 4 | `orden` | INTEGER | Número ordinal para ordenamiento visual en pantallas y reportes. (Opcional (NULL)). |

### 36. Tabla: `tabla_medidas_convencionales`
**Descripción / Propósito:** Matriz maestra normalizada de patronaje industrial con los 9 puntos anatómicos por rango, género y talla.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_tabla_medida` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la fila en la matriz maestra. (Requerido (NOT NULL)). |
| 2 | `id_rango_edad` | INTEGER | [FK -> rangos_edad.id_rango_edad] Clave foránea hacia el rango etario (rangos_edad.id_rango_edad). (Opcional (NULL)). |
| 3 | `id_genero` | INTEGER | [FK -> generos.id_genero] Clave foránea hacia el género morfológico (generos.id_genero). (Opcional (NULL)). |
| 4 | `id_talla_estandar` | INTEGER | [FK -> tallas_estandar.id_talla_estandar] Clave foránea hacia la talla comercial estándar (tallas_estandar.id_talla_estandar). (Opcional (NULL)). |
| 5 | `busto` | NUMERIC(6,2) | Contorno de busto o pecho estándar en centímetros (cm). (Opcional (NULL)). |
| 6 | `cintura` | NUMERIC(6,2) | Contorno de cintura estándar en centímetros (cm). (Opcional (NULL)). |
| 7 | `cadera` | NUMERIC(6,2) | Contorno de cadera estándar en centímetros (cm). (Opcional (NULL)). |
| 8 | `espalda` | NUMERIC(6,2) | Ancho de espalda estándar en centímetros (cm). (Opcional (NULL)). |
| 9 | `hombro` | NUMERIC(6,2) | Largo de hombro estándar en centímetros (cm). (Opcional (NULL)). |
| 10 | `cortas` | NUMERIC(6,2) | Talle de espalda / talle corto en centímetros (cm). (Opcional (NULL)). |
| 11 | `frente` | NUMERIC(6,2) | Talle delantero / talle frente en centímetros (cm). (Opcional (NULL)). |
| 12 | `alto_cadera` | NUMERIC(6,2) | Distancia de cintura a cadera en centímetros (cm). (Opcional (NULL)). |
| 13 | `entre_busto` | NUMERIC(6,2) | Separación anatómica entre centros de busto en centímetros (cm). (Opcional (NULL)). |

### 37. Tabla: `medidas_convencionales`
**Descripción / Propósito:** Vincula una prenda de pedido con la talla estándar y los catálogos normalizados seleccionados.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_medida_convencional` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la medida convencional asignada. (Requerido (NOT NULL)). |
| 2 | `id_detalle` | INTEGER | [FK -> detalle_pedido.id_detalle] Clave foránea del detalle de pedido confeccionado (detalle_pedido.id_detalle). (Opcional (NULL)). |
| 3 | `talla` | VARCHAR | Denominación textual descriptiva de la talla registrada para el pedido. (Opcional (NULL)). |
| 4 | `equivalencia_europea` | VARCHAR | Equivalencia europea registrada al momento de confirmar el pedido. (Opcional (NULL)). |
| 5 | `id_rango_edad` | INTEGER | [FK -> rangos_edad.id_rango_edad] Clave foránea del rango de edad aplicado (rangos_edad.id_rango_edad). (Opcional (NULL)). |
| 6 | `id_genero` | INTEGER | [FK -> generos.id_genero] Clave foránea del género morfológico aplicado (generos.id_genero). (Opcional (NULL)). |
| 7 | `id_talla_estandar` | INTEGER | [FK -> tallas_estandar.id_talla_estandar] Clave foránea de la talla comercial estándar (tallas_estandar.id_talla_estandar). (Opcional (NULL)). |

### 38. Tabla: `medidas_anatomicas`
**Descripción / Propósito:** Registro de los 9 puntos anatómicos individuales tomados a medida directamente del cliente.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_medida_anatomica` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de las medidas personalizadas. (Requerido (NOT NULL)). |
| 2 | `id_detalle` | INTEGER | [FK -> detalle_pedido.id_detalle] Clave foránea del detalle de pedido asociado (detalle_pedido.id_detalle). (Opcional (NULL)). |
| 3 | `cortas` | NUMERIC | Medida real de talle espalda / talle corto en centímetros (cm). (Opcional (NULL)). |
| 4 | `cintura` | NUMERIC | Medida real de contorno de cintura en centímetros (cm). (Opcional (NULL)). |
| 5 | `frente` | NUMERIC | Medida real de talle delantero / frente en centímetros (cm). (Opcional (NULL)). |
| 6 | `alto_cadera` | NUMERIC | Medida real de altura de cadera en centímetros (cm). (Opcional (NULL)). |
| 7 | `cadera` | NUMERIC | Medida real de contorno de cadera en centímetros (cm). (Opcional (NULL)). |
| 8 | `entre_busto` | NUMERIC | Medida real de separación de busto en centímetros (cm). (Opcional (NULL)). |
| 9 | `busto` | NUMERIC | Medida real de contorno de busto / tórax en centímetros (cm). (Opcional (NULL)). |
| 10 | `espalda` | NUMERIC | Medida real de ancho de espalda en centímetros (cm). (Opcional (NULL)). |
| 11 | `hombro` | NUMERIC | Medida real de largo de hombro en centímetros (cm). (Opcional (NULL)). |


## 6. Subsistema de Agenda, Citas y Pruebas de Vestuario

### 39. Tabla: `estados_cita`
**Descripción / Propósito:** Catálogo de estados de programación y atención de citas en el taller.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_estado_cita` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del estado de la cita. (Requerido (NOT NULL)). |
| 2 | `nombre_estado` | VARCHAR | Nombre del estado (Programada, Reprogramada, Realizada, Cancelada). (Opcional (NULL)). |

### 40. Tabla: `motivos_cita`
**Descripción / Propósito:** Catálogo normalizado de motivos formales de visita y atención presencial en el taller.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_motivo_cita` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del motivo de cita. (Requerido (NOT NULL)). |
| 2 | `nombre_motivo` | VARCHAR(100) | Nombre del motivo (Cotización y Diseño, Toma de Medidas, Primera Prueba, Ajuste de Prenda, Entrega, Consulta General). (Requerido (NOT NULL)). |
| 3 | `descripcion` | TEXT | Definición del procedimiento y protocolo de atención para el motivo seleccionado. (Opcional (NULL)). |

### 41. Tabla: `citas`
**Descripción / Propósito:** Agenda de visitas presenciales de clientes para pruebas, medidas o asesoría técnica.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_cita` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la cita agendada. (Requerido (NOT NULL)). |
| 2 | `id_cliente` | INTEGER | [FK -> clientes.id_cliente] Clave foránea del cliente solicitante (clientes.id_cliente). (Opcional (NULL)). |
| 3 | `id_pedido` | INTEGER | [FK -> pedidos.id_pedido] Clave foránea del pedido relacionado (opcional, en citas vinculadas a confección). (Opcional (NULL)). |
| 4 | `id_estado_cita` | INTEGER | [FK -> estados_cita.id_estado_cita] Clave foránea del estado actual de la cita (estados_cita.id_estado_cita). (Opcional (NULL)). |
| 5 | `fecha_cita` | TIMESTAMP | Fecha y hora exacta programada para la reunión presencial. (Opcional (NULL)). |
| 6 | `motivo_cita` | VARCHAR | Texto descriptivo o motivo registrado para compatibilidad histórica. (Opcional (NULL)). |
| 7 | `id_motivo_cita` | INTEGER | [FK -> motivos_cita.id_motivo_cita] Clave foránea del motivo formal de la visita (motivos_cita.id_motivo_cita). (Opcional (NULL)). |
| 8 | `observaciones` | TEXT | Anotaciones particulares sobre requerimientos del cliente para la cita. (Opcional (NULL)). |


## 7. Subsistema Financiero, Pagos y Facturación

### 42. Tabla: `metodos_pago`
**Descripción / Propósito:** Formas e instrumentos de cobro y liquidación aceptados por el taller.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_metodo_pago` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del método de pago. (Requerido (NOT NULL)). |
| 2 | `nombre_metodo` | VARCHAR | Denominación del medio de pago (Efectivo, Transferencia QR, Tarjeta de Débito/Crédito). (Opcional (NULL)). |

### 43. Tabla: `estados_pago`
**Descripción / Propósito:** Estados financieros del cumplimiento del abono o saldo del pedido.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_estado_pago` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del estado del pago. (Requerido (NOT NULL)). |
| 2 | `nombre_estado` | VARCHAR | Denominación del estado (Pendiente, Adelanto Parcial, Completado, Anulado). (Opcional (NULL)). |

### 44. Tabla: `pagos`
**Descripción / Propósito:** Registro de anticipos y liquidaciones de saldo realizadas por el cliente para sus pedidos.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_pago` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la transacción de pago. (Requerido (NOT NULL)). |
| 2 | `id_pedido` | INTEGER | [FK -> pedidos.id_pedido] Clave foránea del pedido correspondiente (pedidos.id_pedido). (Opcional (NULL)). |
| 3 | `id_estado_pago` | INTEGER | [FK -> estados_pago.id_estado_pago] Clave foránea del estado del abono (estados_pago.id_estado_pago). (Opcional (NULL)). |
| 4 | `id_metodo_pago` | INTEGER | [FK -> metodos_pago.id_metodo_pago] Clave foránea del medio de pago utilizado (metodos_pago.id_metodo_pago). (Opcional (NULL)). |
| 5 | `monto_pago` | NUMERIC | Importe económico abonado en moneda nacional (Bs). (Opcional (NULL)). |
| 6 | `fecha_pago` | TIMESTAMP | Fecha y hora exacta en la que se efectuó el pago. (Opcional (NULL)). |

### 45. Tabla: `descuentos`
**Descripción / Propósito:** Catálogo de descuentos comerciales o promocionales aplicables a órdenes de confección.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_descuento` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del descuento. (Requerido (NOT NULL)). |
| 2 | `id_tipo_cliente` | INTEGER | [FK -> tipo_cliente.id_tipo_cliente] Campo id_tipo_cliente de la entidad descuentos. (Opcional (NULL)). |
| 3 | `nombre_descuento` | VARCHAR | Campo nombre_descuento de la entidad descuentos. (Opcional (NULL)). |
| 4 | `porcentaje` | NUMERIC | Porcentaje de rebaja sobre el costo total (%). (Opcional (NULL)). |

### 46. Tabla: `contratos`
**Descripción / Propósito:** Instrumentos contractuales y cláusulas legales que respaldan la orden de confección.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_contrato` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del contrato legal. (Requerido (NOT NULL)). |
| 2 | `id_datos_institucional` | INTEGER | [FK -> datos_cliente_institucional.id_datos_institucional] Campo id_datos_institucional de la entidad contratos. (Opcional (NULL)). |
| 3 | `numero_contrato` | VARCHAR | Código alfanumérico único del contrato de confección. (Opcional (NULL)). |
| 4 | `fecha_firma` | DATE | Campo fecha_firma de la entidad contratos. (Opcional (NULL)). |
| 5 | `fecha_vencimiento` | DATE | Campo fecha_vencimiento de la entidad contratos. (Opcional (NULL)). |
| 6 | `url_clausulas_pdf` | VARCHAR | Campo url_clausulas_pdf de la entidad contratos. (Opcional (NULL)). |

### 47. Tabla: `notas_venta`
**Descripción / Propósito:** Comprobante formal emitido al cliente al liquidar la confección o venta.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_nota_venta` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la nota de venta. (Requerido (NOT NULL)). |
| 2 | `id_pedido` | INTEGER | [FK -> pedidos.id_pedido] Clave foránea del pedido respaldado (pedidos.id_pedido). (Opcional (NULL)). |
| 3 | `id_descuento` | INTEGER | [FK -> descuentos.id_descuento] Clave foránea del descuento aplicado (opcional). (Opcional (NULL)). |
| 4 | `numero_nota` | VARCHAR | Número correlativo único de la nota de entrega. (Opcional (NULL)). |
| 5 | `fecha_emision` | TIMESTAMP | Fecha y hora formal de liquidación y emisión del comprobante. (Opcional (NULL)). |
| 6 | `subtotal` | NUMERIC | Importe bruto acumulado antes de descuentos. (Opcional (NULL)). |
| 7 | `total_final` | NUMERIC | Monto neto final cancelado por el cliente. (Opcional (NULL)). |
| 8 | `estado_envio_correo` | VARCHAR | Campo estado_envio_correo de la entidad notas_venta. (Opcional (NULL)). |


## 8. Subsistema de Catálogo Público y Muestrario de Alta Costura

### 48. Tabla: `catalogo`
**Descripción / Propósito:** Prendas y modelos de muestra exhibidos al público en la vitrina digital de la PWA.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_catalogo` | SERIAL (INTEGER) | [PK] Clave primaria secuencial del artículo en catálogo. (Requerido (NOT NULL)). |
| 2 | `nombre_catalogo` | VARCHAR | Campo nombre_catalogo de la entidad catalogo. (Opcional (NULL)). |
| 3 | `url_imagen_catalogo` | VARCHAR | Campo url_imagen_catalogo de la entidad catalogo. (Opcional (NULL)). |

### 49. Tabla: `descripciones_catalogo`
**Descripción / Propósito:** Narrativa de diseño, detalles estéticos y recomendaciones para prendas del catálogo.

| N° | Campo | Tipo de dato | Descripción |
| :---: | :--- | :--- | :--- |
| 1 | `id_descripcion_catalogo` | SERIAL (INTEGER) | [PK] Clave primaria secuencial de la descripción del catálogo. (Requerido (NOT NULL)). |
| 2 | `id_catalogo` | INTEGER | [FK -> catalogo.id_catalogo] Clave foránea 1-a-1 hacia el modelo de catálogo (catalogo.id_catalogo). (Opcional (NULL)). |
| 3 | `descripcion` | TEXT | Campo descripcion de la entidad descripciones_catalogo. (Opcional (NULL)). |

