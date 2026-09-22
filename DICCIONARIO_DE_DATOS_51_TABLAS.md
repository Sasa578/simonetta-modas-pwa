# Diccionario de Datos del Sistema (51 Tablas)
## Sistema Web Progresivo (PWA) - Simonetta Modas
**Proyecto de Grado - Escuela Militar de Ingenieria (EMI)**

Este documento constituye el **Diccionario de Datos Oficial** de la base de datos relacional de **Simonetta Modas**, normalizada en **Tercera Forma Normal (3FN)** con un total de **51 tablas** clasificadas en cuatro modulos funcionales.

---

## Indice General por Modulos

1. **Modulo 1: Seguridad, Usuarios y Clientes (Tablas 1 a 13)**
   - `estados_usuario`, `estados_cliente`, `roles`, `descripciones_rol`, `tipo_cliente`, `descripciones_tipo_cliente`, `usuarios`, `datos_usuario`, `clientes`, `datos_cliente_persona`, `datos_cliente_institucional`, `atributos_cliente`, `contratos`.

2. **Modulo 2: Pedidos, Medidas, Citas y Pagos (Tablas 14 a 28)**
   - `estados_pedido`, `estados_pago`, `metodos_pago`, `estados_cita`, `pedidos`, `catalogo`, `descripciones_catalogo`, `prendas`, `descripciones_prenda`, `detalle_pedido`, `notas_diseno_detalle`, `medidas_anatomicas`, `medidas_convencionales`, `pagos`, `citas`.

3. **Modulo 3: Almacen, Catalogos e Inventario (Tablas 29 a 44)**
   - `colores`, `materiales_base`, `unidades_medida`, `categorias_almacen`, `tipos_producto`, `productos_almacen`, `esp_telas`, `esp_botones`, `esp_hilos`, `esp_cierres`, `esp_varillas`, `esp_broches`, `esp_encajes`, `esp_cintas`, `esp_apliques`, `esp_ribetes`.

4. **Modulo 4: Kardex, Reportes y Notas de Venta (Tablas 45 a 51)**
   - `descuentos`, `notas_venta`, `proveedores`, `tipos_movimiento`, `origenes_material`, `movimientos_almacen`, `observaciones_movimiento`.

---


# MODULO 1: SEGURIDAD, USUARIOS Y CLIENTES

### Tabla N° 1: `estados_usuario`
**Descripcion general:** Catalogo de estados operativos para el control del ciclo de vida de los usuarios internos del taller.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_estado_usuario` | `serial` | Identificador unico y autoincremental del estado de usuario (Clave Primaria). |
| 2 | `nombre_estado` | `varchar` | Denominacion descriptiva del estado del usuario (ej. Activo, Inactivo, Suspendido). |

---

### Tabla N° 2: `estados_cliente`
**Descripcion general:** Catalogo que clasifica el estado de registro y vigencia de los clientes en la plataforma.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_estado_cliente` | `serial` | Identificador unico y autoincremental del estado del cliente (Clave Primaria). |
| 2 | `nombre_estado` | `varchar` | Nombre del estado del cliente (ej. Activo, En Mora, Potencial, Inactivo). |

---

### Tabla N° 3: `roles`
**Descripcion general:** Catalogo que define los roles de seguridad y niveles de autorizacion dentro del sistema.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_rol` | `serial` | Identificador unico y autoincremental del rol de seguridad (Clave Primaria). |
| 2 | `nombre_rol` | `varchar` | Nombre del rol asignado en el taller (ej. Administradora, Secretaria, Costurera). |

---

### Tabla N° 4: `descripciones_rol`
**Descripcion general:** Tabla 1:1 que amplia la definicion de responsabilidades y permisos asignados a cada rol.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_descripcion_rol` | `serial` | Identificador unico de la descripcion del rol (Clave Primaria). |
| 2 | `id_rol` | `int` | Clave foranea que referencia a la tabla roles (Relacion estricta 1:1, UNIQUE). |
| 3 | `descripcion` | `text` | Explicacion detallada de las funciones, privilegios y responsabilidades asociadas al rol. |

---

### Tabla N° 5: `tipo_cliente`
**Descripcion general:** Catalogo de segmentacion comercial para diferenciar personas particulares de empresas.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_tipo_cliente` | `serial` | Identificador unico y autoincremental del tipo de cliente (Clave Primaria). |
| 2 | `nombre_tipo` | `varchar` | Clasificacion comercial del cliente (ej. Persona Natural, Institucional / Corporativo). |

---

### Tabla N° 6: `descripciones_tipo_cliente`
**Descripcion general:** Informacion complementaria y politicas comerciales asociadas a cada tipo de cliente.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_descripcion_tipo` | `serial` | Identificador unico de la descripcion del tipo de cliente (Clave Primaria). |
| 2 | `id_tipo_cliente` | `int` | Clave foranea que referencia a tipo_cliente (Relacion 1:1, UNIQUE). |
| 3 | `descripcion` | `text` | Detalle de beneficios, terminos de facturacion o politicas aplicables al tipo de cliente. |

---

### Tabla N° 7: `usuarios`
**Descripcion general:** Entidad central de autenticacion y seguridad para el personal operativo y administrativo del taller.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_usuario` | `serial` | Identificador unico y autoincremental del usuario del sistema (Clave Primaria). |
| 2 | `id_rol` | `int` | Clave foranea que vincula al usuario con su rol y perfil de acceso en roles. |
| 3 | `id_estado_usuario` | `int` | Clave foranea que indica si la cuenta esta activa, suspendida o inactiva en estados_usuario. |
| 4 | `correo_electronico` | `varchar` | Almacena el valor de correo_electronico para el registro de usuarios. |
| 5 | `password_hash` | `varchar` | Almacena el valor de password_hash para el registro de usuarios. |

---

### Tabla N° 8: `datos_usuario`
**Descripcion general:** Particionamiento vertical 1:1 para el resguardo y privacidad de la informacion personal del trabajador.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_datos_usuario` | `serial` | Identificador unico del registro de datos personales del trabajador (Clave Primaria). |
| 2 | `id_usuario` | `int` | Clave foranea que vincula 1:1 con la cuenta de acceso en la tabla usuarios (UNIQUE). |
| 3 | `nombre` | `varchar` | Almacena el valor de nombre para el registro de datos_usuario. |
| 4 | `apellido` | `varchar` | Almacena el valor de apellido para el registro de datos_usuario. |
| 5 | `carnet_identidad` | `varchar` | Cedula de identidad (CI) oficial del trabajador para fines legales y contractuales. |
| 6 | `fecha_nacimiento` | `date` | Almacena el valor de fecha_nacimiento para el registro de datos_usuario. |
| 7 | `telefono` | `varchar` | Numero telefonico o de celular de contacto directo del empleado. |
| 8 | `fecha_registro` | `timestamp` | Almacena el valor de fecha_registro para el registro de datos_usuario. |

---

### Tabla N° 9: `clientes`
**Descripcion general:** Credenciales de acceso y registro para los clientes finales que utilizan la PWA de seguimiento.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_cliente` | `serial` | Identificador unico y autoincremental del cliente en el sistema (Clave Primaria). |
| 2 | `id_tipo_cliente` | `int` | Clave foranea que define si es persona natural o empresa en tipo_cliente. |
| 3 | `id_rol` | `int` | Almacena el valor de id_rol para el registro de clientes. |
| 4 | `id_estado_cliente` | `int` | Clave foranea que determina el estado de la cuenta en estados_cliente. |
| 5 | `correo_electronico` | `varchar` | Almacena el valor de correo_electronico para el registro de clientes. |
| 6 | `password_hash` | `varchar` | Almacena el valor de password_hash para el registro de clientes. |
| 7 | `fecha_registro` | `timestamp` | Marca de tiempo en la que se dio de alta al cliente en el sistema. |

---

### Tabla N° 10: `datos_cliente_persona`
**Descripcion general:** Subtipo logico para clientes individuales (personas naturales) con sus datos civiles.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_datos_persona` | `serial` | Identificador unico del registro de persona natural (Clave Primaria). |
| 2 | `id_cliente` | `int` | Clave foranea que referencia 1:1 a clientes (UNIQUE). |
| 3 | `nombre` | `varchar` | Almacena el valor de nombre para el registro de datos_cliente_persona. |
| 4 | `apellido` | `varchar` | Almacena el valor de apellido para el registro de datos_cliente_persona. |
| 5 | `telefono` | `varchar` | Almacena el valor de telefono para el registro de datos_cliente_persona. |
| 6 | `fecha_nacimiento` | `date` | Almacena el valor de fecha_nacimiento para el registro de datos_cliente_persona. |

---

### Tabla N° 11: `datos_cliente_institucional`
**Descripcion general:** Subtipo logico para empresas, colegios, academias o comparsas con pedidos por volumen.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_datos_institucional` | `serial` | Identificador unico de los datos de la institucion (Clave Primaria). |
| 2 | `id_cliente` | `int` | Clave foranea que referencia 1:1 a clientes (UNIQUE). |
| 3 | `razon_social` | `varchar` | Nombre oficial o razon social de la empresa, institucion o comparsa. |
| 4 | `nit` | `varchar` | Numero de Identificacion Tributaria (NIT) oficial para facturacion corporativa. |
| 5 | `nombre_contacto` | `varchar` | Almacena el valor de nombre_contacto para el registro de datos_cliente_institucional. |
| 6 | `telefono_contacto` | `varchar` | Linea telefonica o PBX de contacto de la entidad. |

---

### Tabla N° 12: `atributos_cliente`
**Descripcion general:** Almacenamiento dinamico de preferencias particulares y requerimientos especiales del cliente.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_atributo_cliente` | `serial` | Almacena el valor de id_atributo_cliente para el registro de atributos_cliente. |
| 2 | `id_cliente` | `int` | Clave foranea que referencia al cliente en la tabla clientes. |
| 3 | `nombre_atributo` | `varchar` | Almacena el valor de nombre_atributo para el registro de atributos_cliente. |
| 4 | `valor_atributo` | `varchar` | Almacena el valor de valor_atributo para el registro de atributos_cliente. |

---

### Tabla N° 13: `contratos`
**Descripcion general:** Documentacion contractual y terminos legales acordados con clientes corporativos o institucionales.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_contrato` | `serial` | Identificador unico y correlativo del contrato de confeccion (Clave Primaria). |
| 2 | `id_datos_institucional` | `int` | Almacena el valor de id_datos_institucional para el registro de contratos. |
| 3 | `numero_contrato` | `varchar` | Codigo o numero formal del documento contractual (ej. CONT-2026-001). |
| 4 | `fecha_firma` | `date` | Almacena el valor de fecha_firma para el registro de contratos. |
| 5 | `fecha_vencimiento` | `date` | Almacena el valor de fecha_vencimiento para el registro de contratos. |
| 6 | `url_clausulas_pdf` | `varchar` | Almacena el valor de url_clausulas_pdf para el registro de contratos. |

---


# MODULO 2: PEDIDOS, MEDIDAS, CITAS Y PAGOS

### Tabla N° 14: `estados_pedido`
**Descripcion general:** Catalogo que define el flujo secuencial de estados de un pedido en el taller de confeccion.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_estado_pedido` | `serial` | Identificador unico del estado de pedido (Clave Primaria). |
| 2 | `nombre_estado` | `varchar` | Nombre del estado operativo (Pendiente, Corte, Armado, Acabados, Listo para Prueba, Para Entregar, Terminado). |

---

### Tabla N° 15: `estados_pago`
**Descripcion general:** Catalogo de clasificacion del estado financiero de una orden respecto a sus adelantos y saldos.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_estado_pago` | `serial` | Identificador unico del estado de pago (Clave Primaria). |
| 2 | `nombre_estado` | `varchar` | Denominacion del estado de cancelacion (ej. Pendiente, Adelanto Parcial, Completado). |

---

### Tabla N° 16: `metodos_pago`
**Descripcion general:** Catalogo de modalidades e instrumentos de cobro aceptados en Simonetta Modas.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_metodo_pago` | `serial` | Identificador unico del metodo de pago (Clave Primaria). |
| 2 | `nombre_metodo` | `varchar` | Forma de pago registrada (ej. Efectivo, QR Simple, Transferencia Bancaria, Tarjeta). |

---

### Tabla N° 17: `estados_cita`
**Descripcion general:** Catalogo de seguimiento de citas programadas para pruebas de calce o toma de medidas.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_estado_cita` | `serial` | Identificador unico del estado de la cita (Clave Primaria). |
| 2 | `nombre_estado` | `varchar` | Estado de la reunion en agenda (ej. Programada, Confirmada, Realizada, Cancelada). |

---

### Tabla N° 18: `pedidos`
**Descripcion general:** Cabecera transaccional que agrupa la orden de confeccion, sus fechas clave y su costo total pactado.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_pedido` | `serial` | Identificador unico y correlativo de la orden de confeccion (Clave Primaria). |
| 2 | `id_cliente` | `int` | Clave foranea que referencia al cliente propietario de la orden en clientes. |
| 3 | `id_estado_pedido` | `int` | Clave foranea que controla el avance actual del pedido en estados_pedido. |
| 4 | `fecha_inicio` | `timestamp` | Fecha y hora en la que se registra formalmente el pedido en el sistema. |
| 5 | `fecha_prueba` | `timestamp` | Fecha estimada o comprometida para la primera prueba de vestuario y entalle. |
| 6 | `fecha_entrega` | `timestamp` | Fecha limite acordada contractualmente para la entrega de las prendas confeccionadas. |
| 7 | `costo_total` | `decimal` | Monto total en Bolivianos (Bs.) acordado para la confeccion del pedido. |

---

### Tabla N° 19: `catalogo`
**Descripcion general:** Galeria de modelos, disenos de temporada y prendas de alta costura exhibidas a clientes.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_catalogo` | `serial` | Identificador unico del diseno en catalogo (Clave Primaria). |
| 2 | `nombre_catalogo` | `varchar` | Nombre comercial o titulo del diseno (ej. Vestido de Gala Imperial, Traje Ejecutivo). |
| 3 | `url_imagen_catalogo` | `varchar` | Ruta o URL de la fotografia digital de alta resolucion que ilustra la prenda. |

---

### Tabla N° 20: `descripciones_catalogo`
**Descripcion general:** Detalle ampliado de inspiracion, siluetas y acabados recomendados para cada diseno en catalogo.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_descripcion_catalogo` | `serial` | Identificador unico de la descripcion de catalogo (Clave Primaria). |
| 2 | `id_catalogo` | `int` | Clave foranea que referencia 1:1 a catalogo (UNIQUE). |
| 3 | `descripcion` | `text` | Texto descriptivo con la propuesta de moda, estilo, ocasion de uso y cortes sugeridos. |

---

### Tabla N° 21: `prendas`
**Descripcion general:** Entidad que representa las prendas especificas a ser confeccionadas en un taller a medida.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_prenda` | `serial` | Identificador unico de la prenda confeccionable (Clave Primaria). |
| 2 | `id_catalogo` | `int` | Clave foranea opcional que enlaza la prenda con un modelo predisenado de catalogo. |
| 3 | `tipo_prenda` | `varchar` | Clasificacion de la prenda (ej. Vestido de Noche, Falda Plisada, Chaqueta Sastre). |
| 4 | `color` | `varchar` | Color predominante o paleta cromatica seleccionada para la confeccion. |

---

### Tabla N° 22: `descripciones_prenda`
**Descripcion general:** Especificaciones tecnicas detalladas y observaciones del diseno particular de la prenda.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_descripcion_prenda` | `serial` | Identificador unico de la descripcion de la prenda (Clave Primaria). |
| 2 | `id_prenda` | `int` | Clave foranea que referencia 1:1 a prendas (UNIQUE). |
| 3 | `descripcion_detallada` | `text` | Texto con requerimientos especificos (ej. forro de saten, corte sirena, mangas acampanadas). |

---

### Tabla N° 23: `detalle_pedido`
**Descripcion general:** Tabla puente asociativa (1:N) que desglosa las prendas incluidas, cantidades y subtotales por pedido.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_detalle` | `serial` | Identificador unico del item dentro del pedido (Clave Primaria). |
| 2 | `id_pedido` | `int` | Clave foranea que referencia a la cabecera en la tabla pedidos. |
| 3 | `id_prenda` | `int` | Clave foranea que referencia a la prenda asociada en la tabla prendas. |
| 4 | `cantidad` | `integer` | Numero de unidades identicas a confeccionar para esta prenda (entero positivo). |
| 5 | `subtotal` | `decimal` | Monto parcial en Bs. correspondiente al valor total de las prendas de esta linea. |

---

### Tabla N° 24: `notas_diseno_detalle`
**Descripcion general:** Anotaciones tecnicas de taller y origen de materiales asignadas a cada item de confeccion.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_nota_diseno` | `serial` | Identificador unico de la nota de diseno (Clave Primaria). |
| 2 | `id_detalle` | `int` | Clave foranea que vincula 1:1 con la linea en detalle_pedido (UNIQUE). |
| 3 | `notas_diseno` | `text` | Instrucciones especiales para corte y confeccion, incluyendo el origen y desglose de insumos. |

---

### Tabla N° 25: `medidas_anatomicas`
**Descripcion general:** Ficha antropometrica personalizada de puntos anatomicos asociada a la prenda confeccionada.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_medida_anatomica` | `serial` | Identificador unico de la ficha de medidas (Clave Primaria). |
| 2 | `id_detalle` | `int` | Clave foranea que conecta 1:1 con detalle_pedido para garantizar medidas por prenda. |
| 3 | `cortas` | `decimal` | Medida de longitud de mangas o talle corto tomada en centimetros (cm). |
| 4 | `cintura` | `decimal` | Medida de contorno de cintura anatomica en centimetros (cm). |
| 5 | `frente` | `decimal` | Medida de longitud del talle delantero o distancia de hombro a cintura en cm. |
| 6 | `alto_cadera` | `decimal` | Distancia vertical desde la linea de cintura hasta la parte mas prominente de cadera en cm. |
| 7 | `cadera` | `decimal` | Medida de contorno de cadera en centimetros (cm). |
| 8 | `entre_busto` | `decimal` | Distancia horizontal entre los dos vertices del busto en centimetros (cm). |
| 9 | `busto` | `decimal` | Medida de contorno total de busto en centimetros (cm). |
| 10 | `espalda` | `decimal` | Ancho dorsal de espalda tomado entre extremos de hombros en centimetros (cm). |
| 11 | `hombro` | `decimal` | Longitud del hombro desde la base del cuello hasta el nacimiento del brazo en cm. |

---

### Tabla N° 26: `medidas_convencionales`
**Descripcion general:** Registro de talla comercial estandar para prendas sin patronaje a medida individual.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_medida_convencional` | `serial` | Identificador unico de la medida convencional (Clave Primaria). |
| 2 | `id_detalle` | `int` | Clave foranea que referencia 1:1 con detalle_pedido (UNIQUE). |
| 3 | `talla` | `varchar` | Nomenclatura estandar de talla (ej. XS, S, M, L, XL, XXL). |
| 4 | `equivalencia_europea` | `varchar` | Numero de talla segun el estandar europeo o numerico (ej. 36, 38, 40, 42). |

---

### Tabla N° 27: `pagos`
**Descripcion general:** Historial transaccional de pagos fraccionados, anticipos y cancelaciones finales por orden.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_pago` | `serial` | Identificador unico del comprobante transaccional de pago (Clave Primaria). |
| 2 | `id_pedido` | `int` | Clave foranea que vincula el abono a la orden en la tabla pedidos. |
| 3 | `id_estado_pago` | `int` | Clave foranea que indica si fue un adelanto parcial o saldo completo en estados_pago. |
| 4 | `id_metodo_pago` | `int` | Clave foranea que registra el medio monetario utilizado en metodos_pago. |
| 5 | `monto_pago` | `decimal` | Cantidad en Bolivianos (Bs.) abonada en esta transaccion particular. |
| 6 | `fecha_pago` | `timestamp` | Marca de tiempo en la que se efectuo y registro la transaccion de pago. |

---

### Tabla N° 28: `citas`
**Descripcion general:** Agenda interactiva de reuniones de prueba, calibracion y entrega fisica de prendas en el taller.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_cita` | `serial` | Identificador unico de la cita en agenda (Clave Primaria). |
| 2 | `id_cliente` | `int` | Clave foranea que enlaza al cliente citado en la tabla clientes. |
| 3 | `id_pedido` | `int` | Clave foranea opcional que vincula la cita con la orden de confeccion en pedidos. |
| 4 | `id_estado_cita` | `int` | Clave foranea que controla si fue atendida o esta pendiente en estados_cita. |
| 5 | `fecha_cita` | `timestamp` | Fecha y hora exacta acordada para la asistencia del cliente al taller. |
| 6 | `motivo_cita` | `varchar` | Descripcion del objetivo de la cita (ej. Primera Prueba de Calce, Toma de Medidas, Entrega Final). |

---


# MODULO 3: ALMACEN, CATALOGOS E INVENTARIO

### Tabla N° 29: `colores`
**Descripcion general:** Catalogo maestro de tonos y colores estandarizados para insumos y telas.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_color` | `serial` | Identificador unico del color registrado (Clave Primaria). |
| 2 | `nombre_color` | `varchar` | Nombre comercial del tono (ej. Azul Marino, Rojo Borgona, Blanco Perla, Marfil). |
| 3 | `codigo_hexadecimal` | `varchar` | Codigo hexadecimal web para representacion visual del color (ej. #1A1A2E, #C9A96E). |

---

### Tabla N° 30: `materiales_base`
**Descripcion general:** Catalogo de composicion y naturaleza textil de los articulos (fibras y materias primas).

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_material_base` | `serial` | Identificador unico de la materia prima base (Clave Primaria). |
| 2 | `nombre_material` | `varchar` | Nombre de la composicion textil (ej. Seda Natural, Algodon Pima, Poliester, Lana Merino). |

---

### Tabla N° 31: `unidades_medida`
**Descripcion general:** Catalogo de unidades de control de stock fisico y pesaje para el inventario.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_unidad_medida` | `serial` | Identificador unico de la unidad de medida (Clave Primaria). |
| 2 | `abreviatura` | `varchar` | Simbolo corto o abreviatura normalizada (ej. m, cm, un, conos, pares, gr). |
| 3 | `descripcion` | `varchar` | Nombre completo de la unidad de medicion fisica (ej. Metros lineales, Unidades, Rollos). |

---

### Tabla N° 32: `categorias_almacen`
**Descripcion general:** Clasificacion superior del almacen para agrupar familias de insumos de costura.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_categoria` | `serial` | Identificador unico de la categoria de almacen (Clave Primaria). |
| 2 | `nombre_categoria` | `varchar` | Nombre del grupo de almacen (ej. Telas y Forros, Hilos, Botones, Cierres, Accesorios). |

---

### Tabla N° 33: `tipos_producto`
**Descripcion general:** Subcategorias normalizadas que derivan de cada categoria principal de almacen.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_tipo_producto` | `serial` | Identificador unico del tipo de producto (Clave Primaria). |
| 2 | `id_categoria` | `int` | Clave foranea que vincula con la familia en categorias_almacen. |
| 3 | `nombre_tipo` | `varchar` | Nombre del tipo especifico (ej. Seda Brocada, Saten Nupcial, Boton Metalico, Cierre Invisible). |

---

### Tabla N° 34: `productos_almacen`
**Descripcion general:** Nucleo cuantitativo del inventario. Controla el stock disponible, stock minimo y alertas.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | `serial` | Identificador unico del articulo en almacen (Clave Primaria). |
| 2 | `id_tipo_producto` | `int` | Clave foranea que define el tipo de insumo en tipos_producto. |
| 3 | `id_unidad_medida` | `int` | Clave foranea que define la escala de conteo en unidades_medida. |
| 4 | `id_color` | `int` | Clave foranea opcional que especifica el color en la tabla colores. |
| 5 | `id_material_base` | `int` | Clave foranea opcional que indica la fibra o composicion en materiales_base. |
| 6 | `nombre_articulo` | `varchar` | Denominacion completa del producto en inventario para facturacion y kardex. |
| 7 | `cantidad_stock` | `decimal` | Existencia fisica actual disponible en almacen (admite decimales para metros/kilos). |
| 8 | `stock_minimo` | `decimal` | Umbral minimo de inventario para disparar advertencias automaticas de reabastecimiento. |

---

### Tabla N° 35: `esp_telas`
**Descripcion general:** Especificaciones polimorficas 1:1 exclusivas para articulos de la familia de telas.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | `int` | Identificador del producto en productos_almacen (Clave Primaria y Foranea 1:1). |
| 2 | `grupo` | `varchar` | Agrupacion comercial o uso principal de la tela (ej. Alta Costura, Sastreria, Forreria). |
| 3 | `subgrupo` | `varchar` | Subtipo textil complementario (ej. Liviano, Con caida, Elongacion media). |
| 4 | `textura` | `varchar` | Sensacion al tacto y acabado superficial (ej. Lisa, Satinada, Rugosa, Labrada). |
| 5 | `calidad` | `varchar` | Grado o procedencia de calidad textil (ej. Premium Importado, Nacional Grado A). |

---

### Tabla N° 36: `esp_botones`
**Descripcion general:** Especificaciones tecnicas particulares para el inventario de botones.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | `int` | Identificador del boton en productos_almacen (Clave Primaria y Foranea 1:1). |
| 2 | `tipo_boton` | `varchar` | Morfologia o estilo del boton (ej. Bombe, De ojal, De pie, De presion). |
| 3 | `tamano` | `varchar` | Medida o calibre del boton en lineas o milimetros (ej. 18 mm, 24L, 30L). |

---

### Tabla N° 37: `esp_hilos`
**Descripcion general:** Especificaciones tecnicas para hilos de costura, sobrehilado y bordado.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | `int` | Identificador del hilo en productos_almacen (Clave Primaria y Foranea 1:1). |
| 2 | `tipo_hilo` | `varchar` | Proposito del hilo (ej. Coser general, Remallado, Bordado metalico). |
| 3 | `grosor` | `varchar` | Calibre o titulacion del hilo (ej. 40/2, 120, 75D). |

---

### Tabla N° 38: `esp_cierres`
**Descripcion general:** Especificaciones de cremalleras y cierres para prendas a medida.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | `int` | Identificador del cierre en productos_almacen (Clave Primaria y Foranea 1:1). |
| 2 | `tipo_cierre` | `varchar` | Mecanismo del cierre (ej. Invisible, Diente de perro, Metalico reforzado). |
| 3 | `tamano` | `varchar` | Largo del cierre en centimetros o pulgadas (ej. 18 cm, 50 cm, 60 cm). |

---

### Tabla N° 39: `esp_varillas`
**Descripcion general:** Especificaciones para ballenas y varillas estructurantes de corses y corpiños.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | `int` | Identificador de la varilla en productos_almacen (Clave Primaria y Foranea 1:1). |
| 2 | `tipo` | `varchar` | Material de fabricacion (ej. Plastica rigida, Acero espiralado, Poliester termosensible). |
| 3 | `grosor` | `varchar` | Ancho o calibre de la varilla en milimetros (ej. 5 mm, 8 mm, 12 mm). |

---

### Tabla N° 40: `esp_broches`
**Descripcion general:** Especificaciones de broches de gancho, presion y gafetes para faldas y vestidos.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | `int` | Identificador del broche en productos_almacen (Clave Primaria y Foranea 1:1). |
| 2 | `tipo` | `varchar` | Estilo de broche (ej. Gafete metalico, Broche imantado, Gancho de falda). |

---

### Tabla N° 41: `esp_encajes`
**Descripcion general:** Especificaciones de puntillas, encajes chantilly y guipures para alta costura.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | `int` | Identificador del encaje en productos_almacen (Clave Primaria y Foranea 1:1). |
| 2 | `grosor` | `varchar` | Ancho de la franja de encaje en centimetros (ej. 5 cm, 15 cm, 30 cm). |

---

### Tabla N° 42: `esp_cintas`
**Descripcion general:** Especificaciones para cintas de raso, gross, bieses y pasamaneria.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | `int` | Identificador de la cinta en productos_almacen (Clave Primaria y Foranea 1:1). |
| 2 | `grosor` | `varchar` | Ancho de la cinta en milimetros o centimetros (ej. 10 mm, 25 mm, 50 mm). |

---

### Tabla N° 43: `esp_apliques`
**Descripcion general:** Especificaciones de pedreria, flores 3D y bordados artesanales aplicables.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | `int` | Identificador del aplique en productos_almacen (Clave Primaria y Foranea 1:1). |
| 2 | `forma` | `varchar` | Silueta o diseno del aplique (ej. Floral, Ramaje, Geometrico, Escudo). |
| 3 | `fijacion` | `varchar` | Modo de adhesion a la prenda (ej. Termoadhesivo, Para coser a mano, Con pedreria engastada). |

---

### Tabla N° 44: `esp_ribetes`
**Descripcion general:** Especificaciones para vivos, ribetes elasticos y terminaciones de orillo.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_producto` | `int` | Identificador del ribete en productos_almacen (Clave Primaria y Foranea 1:1). |
| 2 | `ancho` | `varchar` | Ancho total del ribete en milimetros o centimetros (ej. 12 mm, 20 mm). |

---


# MODULO 4: KARDEX, REPORTES Y NOTAS DE VENTA

### Tabla N° 45: `descuentos`
**Descripcion general:** Catalogo de politicas y porcentajes de descuento por categoria de cliente o promociones.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_descuento` | `serial` | Identificador unico de la regla de descuento (Clave Primaria). |
| 2 | `id_tipo_cliente` | `int` | Clave foranea opcional que vincula el descuento con tipo_cliente (ej. Clientes Corporativos). |
| 3 | `nombre_descuento` | `varchar` | Nombre de la promocion o politica (ej. Descuento Corporativo, Cliente Frecuente, Promocional). |
| 4 | `porcentaje` | `decimal` | Porcentaje de rebaja aplicable sobre el subtotal de la nota (de 0.00% a 100.00%). |

---

### Tabla N° 46: `notas_venta`
**Descripcion general:** Registro comercial oficial e inmutable que congela el valor y comprobante de entrega del pedido.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_nota_venta` | `serial` | Identificador unico de la nota de venta (Clave Primaria). |
| 2 | `id_pedido` | `int` | Clave foranea que conecta la nota con la orden en pedidos (Relacion 1:1, UNIQUE). |
| 3 | `id_descuento` | `int` | Clave foranea opcional que registra el descuento aplicado en descuentos. |
| 4 | `numero_nota` | `varchar` | Codigo correlativo formal del comprobante mercantil (ej. NV-2026-00001) (UNIQUE). |
| 5 | `fecha_emision` | `timestamp` | Fecha y hora exacta de emision y congelamiento contable del comprobante. |
| 6 | `subtotal` | `decimal` | Almacena el valor de subtotal para el registro de notas_venta. |
| 7 | `total_final` | `decimal` | Almacena el valor de total_final para el registro de notas_venta. |
| 8 | `estado_envio_correo` | `varchar` | Almacena el valor de estado_envio_correo para el registro de notas_venta. |

---

### Tabla N° 47: `proveedores`
**Descripcion general:** Directorio de empresas, textileras y distribuidores mayoristas de materia prima.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_proveedor` | `serial` | Identificador unico del proveedor en el sistema (Clave Primaria). |
| 2 | `nombre_empresa` | `varchar` | Almacena el valor de nombre_empresa para el registro de proveedores. |
| 3 | `nombre_contacto` | `varchar` | Almacena el valor de nombre_contacto para el registro de proveedores. |
| 4 | `telefono_contacto` | `varchar` | Almacena el valor de telefono_contacto para el registro de proveedores. |
| 5 | `direccion` | `varchar` | Direccion fisica del deposito o local comercial del proveedor. |

---

### Tabla N° 48: `tipos_movimiento`
**Descripcion general:** Catalogo de transacciones que alteran o auditan el Kardex de inventario.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_tipo_movimiento` | `serial` | Identificador unico del tipo de movimiento (Clave Primaria). |
| 2 | `nombre_movimiento` | `varchar` | Naturaleza del movimiento (Entrada por Compra, Salida por Confeccion, Ajuste de Inventario, Devolucion de Sobrante). |

---

### Tabla N° 49: `origenes_material`
**Descripcion general:** Regla de negocio esencial del taller que distingue la titularidad de los insumos.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_origen` | `serial` | Identificador unico del origen de materia prima (Clave Primaria). |
| 2 | `nombre_origen` | `varchar` | Procedencia del material (Taller: afecta inventario interno; Cliente: custodia y auditoria sin alterar stock). |

---

### Tabla N° 50: `movimientos_almacen`
**Descripcion general:** Libro mayor transaccional (Kardex Fisico) de entradas, salidas y auditoria de insumos.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_movimiento` | `serial` | Identificador unico del registro de movimiento de Kardex (Clave Primaria). |
| 2 | `id_producto` | `int` | Clave foranea que indica el articulo involucrado en productos_almacen. |
| 3 | `id_proveedor` | `int` | Clave foranea opcional que vincula la compra con proveedores. |
| 4 | `id_detalle_pedido` | `int` | Clave foranea opcional que traza el consumo del insumo con la prenda en detalle_pedido. |
| 5 | `id_tipo_movimiento` | `int` | Clave foranea que clasifica la operacion en tipos_movimiento. |
| 6 | `id_origen` | `int` | Clave foranea que define si el insumo fue del taller o provisto por el cliente en origenes_material. |
| 7 | `cantidad` | `decimal` | Magnitud numerica de insumo que entra o sale del almacen. |
| 8 | `fecha_movimiento` | `timestamp` | Marca de tiempo oficial en que se produjo la transaccion de Kardex. |

---

### Tabla N° 51: `observaciones_movimiento`
**Descripcion general:** Justificacion documental y auditoria cualitativa de cada movimiento de Kardex.

| N° | Campo | Tipo de Dato | Descripcion |
| :---: | :--- | :--- | :--- |
| 1 | `id_observacion` | `serial` | Almacena el valor de id_observacion para el registro de observaciones_movimiento. |
| 2 | `id_movimiento` | `int` | Clave foranea que conecta 1:1 con movimientos_almacen (UNIQUE). |
| 3 | `observacion` | `text` | Texto explicativo detallando el motivo, factura de compra o prenda que justifico la transaccion. |

---

