# INFORME TÉCNICO Y OPERATIVO INTEGRAL DEL SISTEMA: SIMONETTA MODAS PWA
## Documento para el Marco Práctico de Proyecto de Grado y Sincronización entre Agentes de IA

**Proyecto:** Sistema Progresivo Web (PWA) para Gestión y Control de Producción, Almacén, Pedidos y Trazabilidad en el Taller de Alta Costura "Simonetta Modas"  
**Fecha de Emisión:** 15 de Septiembre de 2026  
**Entorno de Desarrollo:** Node.js v20+, Express, PostgreSQL 16 (Arquitectura Relacional 3FN), React 18 (Vite PWA), Socket.io, Jest  
**Versión del Sistema:** v2.0.0 (Reestructuración Modular Completa)  

---

## 📑 ÍNDICE GENERAL
1. [Resumen Ejecutivo y Ficha Técnica](#1-resumen-ejecutivo-y-ficha-técnica)
2. [Trazabilidad de Versionamiento Git (Fases 0 a 4)](#2-trazabilidad-de-versionamiento-git-fases-0-a-4)
3. [Arquitectura Relacional de Base de Datos (Los 4 Módulos)](#3-arquitectura-relacional-de-base-de-datos-los-4-módulos)
4. [Catálogo y Mapa Completo de Endpoints API RESTful](#4-catálogo-y-mapa-completo-de-endpoints-api-restful)
5. [Reglas de Negocio y Lógica Operativa Clave](#5-reglas-de-negocio-y-lógica-operativa-clave)
6. [Metodología y Casos de Prueba del Software](#6-metodología-y-casos-de-prueba-del-software)
   - 6.1 [Pruebas de Caja Blanca (White-Box Testing)](#61-pruebas-de-caja-blanca-white-box-testing)
   - 6.2 [Pruebas de Caja Negra (Black-Box Testing)](#62-pruebas-de-caja-negra-black-box-testing)
   - 6.3 [Pruebas de Usabilidad y Aceptación (UAT)](#63-pruebas-de-usabilidad-y-aceptación-uat)
7. [Resultados de Ejecución de Pruebas Actuales](#7-resultados-de-ejecución-de-pruebas-actuales)
8. [Credenciales y Datos Semilla para Demostración](#8-credenciales-y-datos-semilla-para-demostración)
9. [Guía de Retroalimentación y Colaboración entre Agentes de IA](#9-guía-de-retroalimentación-y-colaboración-entre-agentes-de-ia)

---

## 1. Resumen Ejecutivo y Ficha Técnica

El sistema **Simonetta Modas PWA** es una solución tecnológica integral orientada a la digitalización operativa del taller de alta costura *Simonetta Modas*. Aborda la complejidad del ciclo de confección a medida, el control estricto de inventarios de telas e insumos merceros, la gestión financiera de pagos fraccionados (anticipos/saldos), la trazabilidad de insumos (origen Taller vs. provisto por el Cliente) y la emisión inmutable de comprobantes comerciales.

### Ficha Técnica de la Solución
| Componente | Tecnología Seleccionada | Justificación Técnica |
|---|---|---|
| **Base de Datos** | PostgreSQL 16 (Relacional 3FN) | Integridad referencial ACID, transacciones atómicas seguras, soporte de llaves foráneas en cascada y consultas relacionales con alta eficiencia mediante índices. |
| **Backend API** | Node.js + Express.js | Arquitectura modular orientada a controladores y modelos, sin ORM (SQL puro con `pg.Pool` parametrizado) para máxima transparencia y rendimiento. |
| **Comunicación en Tiempo Real** | Socket.io | Sincronización instantánea de estados entre la Administradora, la Secretaría y las Costureras sin necesidad de recarga manual. |
| **Frontend Web / PWA** | React 18 + Vite | Progressive Web App instalable, Service Workers para funcionamiento offline parcial, diseño Vanilla CSS sin dependencias pesadas para máxima ligereza y elegancia. |
| **Seguridad y Criptografía** | JWT + Bcrypt.js | Autenticación stateless mediante tokens Bearer firmados criptográficamente y hashing de contraseñas con salt de 10 rondas. |
| **Pruebas Automatizadas** | Jest + Supertest | Suite de pruebas unitarias y de integración end-to-end con base de datos real. |

---

## 2. Trazabilidad de Versionamiento Git (Fases 0 a 4)

El proyecto fue estructurado y migrado mediante una estrategia de 5 fases estrictamente versionadas en el repositorio Git local y remoto:

| Commit Hash | Título del Commit | Módulo / Alcance Técnico |
|---|---|---|
| `796cfef` | `DB_Fase_0: Base de Datos DDL y Semilla con Catalogos` | Creación del DDL PostgreSQL con las 36 tablas completas (3FN) y script de semilla inicial de catálogos y datos maestros. |
| `00bcd04` | `DB_Fase_1: Modulo 1 - Seguridad, Usuarios y Clientes` | Implementación de particionamiento vertical (`datos_usuario`), subtipos de clientes (`Persona` vs `Institucional`), contratos y autenticación unificada. |
| `3efb98f` | `DB_Fase_2: Modulo 3 - Almacen e Inventario` | Implementación de catálogos paramétricos y desnormalización controlada con polimorfismo de especificaciones (`esp_telas`, `esp_botones`, etc.). |
| `38efe66` | `DB_Fase_3: Modulo 2 - Pedidos, Medidas, Citas y Pagos` | Transacción atómica maestro-detalle de pedidos, prendas, medidas anatómicas por prenda, pagos fraccionados y agenda de citas. |
| `02d1db5` | `DB_Fase_4: Modulo 4 - Kardex y Notas de Venta` | Auditoría de movimientos de almacén (Kardex), regla de protección de material provisto por cliente, emisión inmutable de notas de venta con descuentos. |

---

## 3. Arquitectura Relacional de Base de Datos (Los 4 Módulos)

El esquema de base de datos fue diseñado erradicando la redundancia y aplicando las 3 Formas Normales (3FN), con patrones avanzados de modelado:

```mermaid
erDiagram
    ROLES ||--o{ USUARIOS : asigna
    ESTADOS_USUARIO ||--o{ USUARIOS : califica
    USUARIOS ||--|| DATOS_USUARIO : particion_vertical
    
    TIPO_CLIENTE ||--o{ CLIENTES : clasifica
    ESTADOS_CLIENTE ||--o{ CLIENTES : califica
    CLIENTES ||--o| DATOS_CLIENTE_PERSONA : subtipo_persona
    CLIENTES ||--o| DATOS_CLIENTE_INSTITUCIONAL : subtipo_institucion
    DATOS_CLIENTE_INSTITUCIONAL ||--o{ CONTRATOS : ampara
    CLIENTES ||--o{ ATRIBUTOS_CLIENTE : preferencias
    
    CLIENTES ||--o{ PEDIDOS : solicita
    ESTADOS_PEDIDO ||--o{ PEDIDOS : rige
    PEDIDOS ||--o{ DETALLE_PEDIDO : compone
    PRENDAS ||--o{ DETALLE_PEDIDO : especifica
    DETALLE_PEDIDO ||--o| NOTAS_DISENO_DETALLE : anota
    DETALLE_PEDIDO ||--o| MEDIDAS_ANATOMICAS : entalla
    DETALLE_PEDIDO ||--o| MEDIDAS_CONVENCIONALES : talla
    
    PEDIDOS ||--o{ PAGOS : liquida
    METODOS_PAGO ||--o{ PAGOS : medio
    ESTADOS_PAGO ||--o{ PAGOS : control
    
    CLIENTES ||--o{ CITAS : agenda
    PEDIDOS ||--o{ CITAS : vincula
    
    CATEGORIAS_ALMACEN ||--o{ TIPOS_PRODUCTO : agrupa
    TIPOS_PRODUCTO ||--o{ PRODUCTOS_ALMACEN : clasifica
    UNIDADES_MEDIDA ||--o{ PRODUCTOS_ALMACEN : mide
    COLORES ||--o{ PRODUCTOS_ALMACEN : matiza
    PRODUCTOS_ALMACEN ||--o| ESP_TELAS : polimorfismo
    PRODUCTOS_ALMACEN ||--o| ESP_BOTONES : polimorfismo
    
    PRODUCTOS_ALMACEN ||--o{ MOVIMIENTOS_ALMACEN : audita
    TIPOS_MOVIMIENTO ||--o{ MOVIMIENTOS_ALMACEN : tipo
    ORIGENES_MATERIAL ||--o{ MOVIMIENTOS_ALMACEN : origen
    PROVEEDORES ||--o{ MOVIMIENTOS_ALMACEN : abastece
    DETALLE_PEDIDO ||--o{ MOVIMIENTOS_ALMACEN : consume
    
    PEDIDOS ||--|| NOTAS_VENTA : congela_factura
    DESCUENTOS ||--o{ NOTAS_VENTA : bonifica
```

### Detalle de Módulos y Tablas

#### MÓDULO 1: SEGURIDAD, USUARIOS Y CLIENTES
1. `roles` & `descripciones_rol`: Catálogo cerrado de roles (`Admin`, `Secretaria`, `Costurera`, `Cliente`).
2. `estados_usuario`: `Activo`, `Inactivo`, `Suspendido`.
3. `estados_cliente`: `Activo`, `Inactivo`, `Potencial`.
4. `tipo_cliente` & `descripciones_tipo_cliente`: `Persona` vs `Institucional`.
5. `usuarios`: Aísla exclusivamente credenciales criptográficas (`correo_electronico`, `password_hash`).
6. `datos_usuario`: **Particionamiento Vertical (1:1)**. Contiene datos personales de los trabajadores (`nombre`, `apellido`, `carnet_identidad`, `telefono`, `fecha_nacimiento`).
7. `clientes`: Credenciales de acceso de clientes a la PWA.
8. `datos_cliente_persona`: **Subtipo de Herencia Lógica (1:1)** para personas naturales (`nombre`, `apellido`, `telefono`, `fecha_nacimiento`).
9. `datos_cliente_institucional`: **Subtipo de Herencia Lógica (1:1)** para personas jurídicas (`razon_social`, `nit`, `nombre_contacto`, `telefono_contacto`).
10. `atributos_cliente`: Atributos polimórficos 1:N (preferencias textiles, tolerancias).
11. `contratos`: Contratos corporativos vinculados a clientes institucionales con fechas de vigencia y URL de archivo legal.

#### MÓDULO 2: PEDIDOS, MEDIDAS, CITAS Y PAGOS
1. `estados_pedido`: `Pendiente`, `Corte`, `Armado`, `Prueba`, `Terminado`, `Entregado`, `Cancelado`.
2. `estados_pago`: `Pendiente`, `Adelanto Parcial`, `Completado`.
3. `metodos_pago`: `Efectivo`, `QR / Transferencia Bancaria`, `Tarjeta de Débito/Crédito`.
4. `estados_cita`: `Programada`, `Realizada`, `Cancelada`, `Reprogramada`.
5. `pedidos`: Cabecera financiera y cronológica de la orden (`id_cliente`, `id_estado_pedido`, `fecha_inicio`, `fecha_prueba`, `fecha_entrega`, `costo_total`).
6. `catalogo` & `descripciones_catalogo`: Catálogo general de confección con imágenes y descripciones extendidas 1:1.
7. `prendas` & `descripciones_prenda`: Prendas confeccionables (`tipo_prenda`, `color`).
8. `detalle_pedido`: Entidad asociativa (1:N) que enlaza pedidos con prendas, cantidades y subtotales.
9. `notas_diseno_detalle`: Instrucciones técnicas de diseño y corte por prenda (1:1 con detalle).
10. `medidas_anatomicas`: Medidas corporales en centímetros vinculadas **1:1 con detalle_pedido** (`busto`, `cintura`, `cadera`, `espalda`, `hombro`, `cortas`, `frente`, `alto_cadera`, `entre_busto`). Resuelve el problema de medidas distintas por tipo de prenda (ej. vestido entallado vs. saco holgado).
11. `medidas_convencionales`: Tallas estándar (S, M, L, XL) y equivalencia europea vinculadas a detalle_pedido.
12. `pagos`: Registro de anticipos y pagos fraccionados con fecha, método y estado.
13. `citas`: Agenda de pruebas y reuniones vinculadas al cliente y/o pedido.

#### MÓDULO 3: ALMACÉN E INVENTARIO
1. `categorias_almacen`: `Telas`, `Hilos`, `Botones`, `Cierres`, `Insumos Auxiliares`.
2. `tipos_producto`: Clasificación específica por categoría.
3. `unidades_medida`: `Metros (m)`, `Unidades (u)`, `Conos`, `Gramos (g)`.
4. `colores`: Catálogo de colores con nombre y código hexadecimal (`codigo_hexadecimal`).
5. `materiales_base`: Composición textil (`Seda`, `Algodón`, `Poliéster`, etc.).
6. `productos_almacen`: Núcleo de control de stock físico (`nombre_articulo`, `cantidad_stock`, `stock_minimo`).
7. **Tablas de Especificaciones Técnicas (Desnormalización Controlada 1:1):**
   - `esp_telas`: Grupo, subgrupo, textura, calidad.
   - `esp_botones`: Tipo de botón, tamaño (líneas/L).
   - `esp_hilos`: Tipo de hilo, grosor/calibre.
   - `esp_cierres`: Tipo de cierre (invisible, metálico), longitud.
   - `esp_varillas`, `esp_broches`, `esp_encajes`, `esp_cintas`, `esp_apliques`, `esp_ribetes`.

#### MÓDULO 4: KARDEX, REPORTES Y NOTAS DE VENTA
1. `proveedores`: Directorio de proveedores textiles (`nombre_empresa`, `nombre_contacto`, `telefono_contacto`, `direccion`).
2. `tipos_movimiento`: `Entrada por Compra`, `Salida por Confección`, `Ajuste de Inventario`, `Devolución de Sobrante`.
3. `origenes_material`: `Taller` (afecta stock general) vs. `Cliente` (custodia temporal sin afectar stock del taller).
4. `movimientos_almacen`: Tabla transaccional inmutable de auditoría Kardex.
5. `observaciones_movimiento`: Justificación técnica de cada movimiento (1:1).
6. `descuentos`: Reglas de descuento parametrizadas por tipo de cliente (ej. 5% Promocional, 10% Corporativo, 15% Frecuente).
7. `notas_venta`: Comprobante comercial inmutable vinculado 1:1 al pedido con numeración correlativa (`NV-YYYY-XXXXX`), subtotal, descuento y total final.

---

## 4. Catálogo y Mapa Completo de Endpoints API RESTful

Todas las rutas privadas requieren el header `Authorization: Bearer <JWT_TOKEN>`.

### Módulo 1: Autenticación, Usuarios y Clientes
| Método | Endpoint | Descripción | Parámetros / Body | Códigos HTTP |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Login unificado (Personal interno y Clientes PWA) | `{ correo, password }` | 200, 400, 401 |
| `POST` | `/api/auth/register` | Auto-registro de clientes desde la PWA | `{ correo, password, nombre, apellido, telefono }` | 201, 400, 409 |
| `GET` | `/api/auth/perfil` | Obtiene el perfil del usuario autenticado | Token Bearer | 200, 401 |
| `GET` | `/api/usuarios` | Listado completo de personal (Admin) | - | 200, 403 |
| `POST` | `/api/usuarios` | Crear nuevo personal (particionado vertical) | `{ correo, password, id_rol, nombre, apellido, ci, telefono }` | 201, 400 |
| `GET` | `/api/usuarios/costureras` | Obtiene lista de costureras activas para asignación | - | 200 |
| `GET` | `/api/clientes` | Listado de clientes (Persona e Institucional) con filtros | Query: `?tipo=Persona&busqueda=García` | 200 |
| `POST` | `/api/clientes` | Registro de cliente con subtipos | `{ tipo_cliente, correo, password, datos_persona, datos_institucional }` | 201, 400 |
| `GET` | `/api/clientes/:id` | Consulta detallada de cliente y contratos | Param: `:id` | 200, 404 |

### Módulo 2: Pedidos, Medidas, Citas y Pagos
| Método | Endpoint | Descripción | Parámetros / Body | Códigos HTTP |
|---|---|---|---|---|
| `GET` | `/api/pedidos` | Obtiene pedidos activos con saldos y prendas | Personal: todos / Cliente: propios | 200 |
| `GET` | `/api/pedidos/catalogos` | Catálogo de estados de pedido y métodos de pago | - | 200 |
| `POST` | `/api/pedidos` | **Transacción atómica de pedido completo** | `{ id_cliente, fecha_entrega, fecha_prueba, costo_total, adelanto, id_metodo_pago, tipo_prenda, color, notas_diseno, medidas_anatomicas, talla }` | 201, 400 |
| `GET` | `/api/pedidos/:id` | Detalle íntegro de un pedido (medidas y pagos) | Param: `:id` | 200, 404 |
| `PUT` | `/api/pedidos/:id` | Actualización de fechas, costo y costurera | `{ fecha_entrega, fecha_prueba, costo_total, adelanto }` | 200, 400, 404 |
| `PUT` | `/api/pedidos/:id/estado` | Cambio de estado de confección | `{ estado: 'Corte' \| 'Prueba' \| 'Terminado' }` | 200, 400 |
| `PUT` | `/api/pedidos/:id/saldar` | **Liquida saldo restante y marca como Entregado** | Param: `:id` | 200, 404 |
| `GET` | `/api/pedidos/metricas` | KPIs operativos (pendientes, entregas 48h, ingresos) | - | 200 |
| `GET` | `/api/pagos/pedido/:id_pedido` | Historial de pagos fraccionados de un pedido | Param: `:id_pedido` | 200 |
| `POST` | `/api/pagos` | Registrar un nuevo abono fraccionado | `{ id_pedido, monto_pago, id_metodo_pago, id_estado_pago }` | 201, 400 |
| `GET` | `/api/citas/pendientes` | Agenda de citas activas para la Secretaría | - | 200 |
| `POST` | `/api/citas` | Solicitud / programación de nueva cita | `{ id_cliente, fecha_cita, motivo_cita }` | 201, 400 |
| `PUT` | `/api/citas/:id/estado` | Actualizar estado de cita | `{ estado: 'Realizada' }` | 200, 404 |

### Módulo 3: Almacén e Inventario
| Método | Endpoint | Descripción | Parámetros / Body | Códigos HTTP |
|---|---|---|---|---|
| `GET` | `/api/almacen` | Listado de insumos con especificaciones polimórficas | Query: `?categoria=Telas` | 200 |
| `GET` | `/api/almacen/catalogos` | Todos los catálogos de almacén (unidades, colores, etc.) | - | 200 |
| `GET` | `/api/almacen/:id` | Detalle técnico por ID de insumo | Param: `:id` | 200, 404 |
| `POST` | `/api/almacen` | Registro de nuevo insumo con especificaciones | `{ nombre_articulo, id_tipo_producto, id_unidad_medida, id_color, cantidad_stock, stock_minimo, especificaciones }` | 201, 400 |
| `PUT` | `/api/almacen/:id` | Actualización de insumo y propiedades técnicas | Param: `:id` + Body | 200, 400 |
| `DELETE` | `/api/almacen/:id` | Eliminación protegida (impide borrar si hay Kardex) | Param: `:id` | 200, 400 |

### Módulo 4: Kardex y Notas de Venta
| Método | Endpoint | Descripción | Parámetros / Body | Códigos HTTP |
|---|---|---|---|---|
| `GET` | `/api/kardex` | Auditoría de movimientos con filtros | Query: `?id_producto=&id_tipo_movimiento=&id_origen=` | 200 |
| `GET` | `/api/kardex/catalogos` | Catálogos de movimientos, orígenes y proveedores | - | 200 |
| `POST` | `/api/kardex` | **Registrar entrada, salida o ajuste en Kardex** | `{ id_producto, id_tipo_movimiento, cantidad, id_origen, id_proveedor, id_detalle_pedido, observacion }` | 201, 400 |
| `GET` | `/api/kardex/proveedores` | Listado de proveedores de insumos textiles | - | 200 |
| `POST` | `/api/kardex/proveedores` | Registro de nuevo proveedor textil | `{ nombre_empresa, nombre_contacto, telefono_contacto, direccion }` | 201, 400 |
| `GET` | `/api/notas-venta` | Listado general de notas de venta emitidas | - | 200 |
| `GET` | `/api/notas-venta/descuentos` | Catálogo de descuentos por tipo de cliente | - | 200 |
| `GET` | `/api/notas-venta/pedido/:id` | Consulta de nota de venta por ID de pedido | Param: `:id` | 200, 404 |
| `POST` | `/api/notas-venta` | **Emisión inmutable de Nota de Venta** | `{ id_pedido, id_descuento }` | 201, 400 |

---

## 5. Reglas de Negocio y Lógica Operativa Clave

1. **Regla de Protección de Inventario (Origen Taller vs Cliente):**
   - Cuando un movimiento en el Kardex tiene `id_origen = 1` (Taller), el sistema altera la columna `cantidad_stock` de `productos_almacen` (suma en compras y resta en confección previa verificación de stock).
   - Cuando el movimiento tiene `id_origen = 2` (Cliente), el material fue provisto externamente por el usuario final. El sistema registra el consumo físico para control de calidad y auditoría, pero **no descuenta el stock del almacén del taller**, protegiendo los activos propios del negocio.
2. **Inmutabilidad de la Nota de Venta:**
   - La tabla `notas_venta` actúa como una fotografía contable inmutable. Si un pedido finalizado recibe cambios posteriores en sus tarifas base, la nota de venta mantiene intactos los valores de `subtotal`, `descuento` y `total_final` registrados en su fecha de emisión.
3. **Control Financiero de Saldos y Entregas:**
   - Los pedidos admiten múltiples pagos fraccionados en la tabla `pagos`.
   - El saldo nunca se confía al cliente/frontend; se computa en base de datos como `costo_total - SUM(monto_pago)`.
   - Al ejecutar `saldarYEntregar`, el backend calcula automáticamente el monto restante exacto, genera el pago de finiquito con estado `Completado`, y pasa el pedido a `Entregado`.
4. **Relación Estricta 1:1 entre Medidas Anatómicas y Prenda:**
   - Las medidas no se anclan globalmente al cliente, sino al `id_detalle` del pedido. Esto permite que una misma clienta tenga fichas antropométricas radicalmente distintas en una misma fecha (ejemplo: holgura para abrigo vs entallado ajustado para vestido de fiesta).

---

## 6. Metodología y Casos de Prueba del Software

Para el capítulo de **Validación y Pruebas del Software** del documento de grado, se adopta un enfoque formal y riguroso combinando:
1. **Pruebas de Caja Blanca (Estructurales)**.
2. **Pruebas de Caja Negra (Funcionales y de Límites)**.
3. **Pruebas de Usabilidad y Aceptación (UAT)**.

---

### 6.1 Pruebas de Caja Blanca (White-Box Testing)

Las pruebas de caja blanca examinan la estructura interna del código fuente, asegurando la cobertura de sentencias (Statement Coverage), de caminos lógicos (Path Coverage) y la robustez de las transacciones atómicas.

#### Criterios de Cobertura Aplicados
- **Cobertura de bifurcaciones (Branch Coverage):** Evaluación de ramas `if/else` en controladores y modelos (ej. validación de cliente nulo, fechas pasadas, sobregiros de stock, cálculo de descuentos con o sin tipo de cliente).
- **Cobertura de transacciones de base de datos:** Verificación de que en caso de excepción a mitad de proceso, se dispare `ROLLBACK` sin dejar registros huérfanos.

#### Casos de Prueba de Caja Blanca

| ID Caso | Módulo / Función Objetivo | Camino Lógico Evaluado | Entrada de Prueba | Comportamiento Interno Esperado | Resultado |
|---|---|---|---|---|---|
| **CB-01** | `UsuarioModel.crear` | Inserción transaccional vertical (`usuarios` + `datos_usuario`). | Correo nuevo, hash bcrypt, datos personales completos. | Ejecuta `BEGIN`, inserta credencial, toma `id_usuario` generado, inserta en `datos_usuario` y hace `COMMIT`. | **EXITOSO** |
| **CB-02** | `PedidoModel.crearPedido` | Transacción compuesta de 5 tablas hijas. | Cliente válido, costo 850, adelanto 400, medidas `{ busto: 90, cintura: 68 }`. | Inserta en `pedidos`, `prendas`, `detalle_pedido`, `medidas_anatomicas`, `pagos` y `citas`. Calcula `saldo = 450`. | **EXITOSO** |
| **CB-03** | `KardexModel.registrarMovimiento` | Rama de control `id_origen = 1` vs `id_origen = 2`. | Salida de 5 unidades con `id_origen = 2` (Cliente). | Evalúa `id_origen === 2`, omite la sentencia `UPDATE productos_almacen` e inserta únicamente el registro de auditoría. | **EXITOSO** |
| **CB-04** | `KardexModel.registrarMovimiento` | Rama de validación de suficiencia de stock. | Salida de 999,999 unidades en insumo con stock 100. | Dispara condición `stockActual < cant`, arroja excepción `Error('Stock insuficiente')`, ejecuta `ROLLBACK`. | **EXITOSO** |
| **CB-05** | `PedidoModel.saldarYEntregar` | Finiquito automático y cierre transaccional. | Pedido con costo 1000 y pagos acumulados de 600. | Detecta `restante = 400 > 0`, inserta pago por 400 con `id_estado_pago = 3`, actualiza `id_estado_pedido = 6 (Entregado)`. | **EXITOSO** |
| **CB-06** | `NotaVentaModel.generarNotaVenta` | Rama de inmutabilidad (evitar duplicidad). | Invocación sobre pedido que ya cuenta con nota `NV-2026-00001`. | Consulta existencia, detecta fila existente, no ejecuta nuevo INSERT y devuelve la nota previa sin recalcular montos. | **EXITOSO** |

---

### 6.2 Pruebas de Caja Negra (Black-Box Testing)

Las pruebas de caja negra evalúan las entradas y salidas de la API y la interfaz de usuario sin considerar el código interno, empleando técnicas formales de ingeniería de software:

#### 1. Partición de Clases de Equivalencia (Equivalence Partitioning)
- **Clases de Clientes:**
  - *Válida 1:* Cliente Persona (requiere nombre, apellido, teléfono).
  - *Válida 2:* Cliente Institucional (requiere razón social, NIT, contacto).
  - *Inválida:* Tipo de cliente no registrado o sin campos específicos de subtipo.
- **Clases de Estados de Pedido:**
  - *Válida:* Estados del ciclo de vida (`Pendiente`, `Corte`, `Armado`, `Prueba`, `Terminado`, `Entregado`).
  - *Inválida:* Estados inexistentes o cadenas vacías.
- **Clases de Origen de Material:**
  - *Clase Taller:* Disminuye inventario general.
  - *Clase Cliente:* No disminuye inventario general.

#### 2. Análisis de Valores Límite (Boundary Value Analysis - BVA)
- **Stock de Insumos ($S$):**
  - Límite inferior: Consumo de $0$ unidades $\rightarrow$ Rechazo (debe ser $> 0$).
  - Límite exacto: Consumo de $S$ unidades $\rightarrow$ Aceptado, stock resultante $= 0$.
  - Límite superior: Consumo de $S + 0.01$ unidades $\rightarrow$ Rechazado por stock insuficiente.
- **Finanzas y Abonos ($P$ = Saldo Pendiente):**
  - Límite cero: Abono de Bs. $0.00$ o negativo $\rightarrow$ Error 400.
  - Límite parcial: Abono de Bs. $0.01$ hasta $P - 0.01$ $\rightarrow$ Aceptado, estado `Adelanto Parcial`.
  - Límite exacto: Abono de Bs. $P$ $\rightarrow$ Aceptado, saldo pasa a 0 y estado a `Completado`.
  - Límite excedente: Abono de Bs. $P + 1.00$ $\rightarrow$ Error 400 por sobrepago.
- **Fechas de Entrega:**
  - Límite pasado: Fecha de entrega = Ayer $\rightarrow$ Rechazo con Error 400 ("No puede ser anterior a hoy").
  - Límite presente: Fecha de entrega = Hoy $\rightarrow$ Aceptado (entrega express en el día).
  - Límite futuro: Fecha de entrega = Mañana en adelante $\rightarrow$ Aceptado.

#### Matriz de Casos de Prueba de Caja Negra

| ID Caso | Módulo / Endpoint | Entrada Enviada (Payload) | Salida Esperada | Código HTTP | Estado |
|---|---|---|---|---|---|
| **CN-01** | `POST /api/auth/login` | Credenciales correctas de Administradora. | Token JWT válido, datos de usuario y rol `Admin`. | `200 OK` | **APROBADO** |
| **CN-02** | `POST /api/auth/login` | Correo registrado con contraseña errónea. | JSON con mensaje `'Contraseña incorrecta'`. | `401 Unauthorized` | **APROBADO** |
| **CN-03** | `POST /api/auth/login` | Cuerpo vacío `{}` o sin correo. | JSON con mensaje `'Correo y contraseña requeridos'`. | `400 Bad Request` | **APROBADO** |
| **CN-04** | `POST /api/pedidos` | Fecha de entrega anterior al día actual (`2020-01-01`). | Error: `'La fecha de entrega no puede ser anterior a hoy.'` | `400 Bad Request` | **APROBADO** |
| **CN-05** | `POST /api/pedidos` | Costo total negativo (`-150.00`). | Error: `'El costo total debe ser mayor o igual a 0.'` | `400 Bad Request` | **APROBADO** |
| **CN-06** | `POST /api/pedidos` | Pedido completo con anticipo del 50% por QR. | Pedido creado, ID generado, saldo calculado exactamente al 50%. | `201 Created` | **APROBADO** |
| **CN-07** | `POST /api/pagos` | Abono mayor al saldo pendiente de la orden. | Error: `'El monto supera el saldo pendiente'`. | `400 Bad Request` | **APROBADO** |
| **CN-08** | `POST /api/pagos` | Abono exacto por el saldo pendiente. | Pago registrado, estado del pago pasa a `Completado`. | `201 Created` | **APROBADO** |
| **CN-09** | `POST /api/kardex` | Entrada por compra de 20 m de tela a proveedor. | Stock aumentado en +20 m, registro en auditoría con fecha. | `201 Created` | **APROBADO** |
| **CN-10** | `POST /api/kardex` | Salida de insumo con cantidad superior al stock. | Error: `'Stock insuficiente para el insumo'`. | `400 Bad Request` | **APROBADO** |
| **CN-11** | `POST /api/kardex` | Salida de tela con origen `Cliente` (id_origen = 2). | Registro creado en Kardex, stock de almacén sin alteración. | `201 Created` | **APROBADO** |
| **CN-12** | `POST /api/notas-venta` | Generación de nota para pedido institucional con descuento. | Comprobante emitido con descuento del 10% y número correlativo. | `201 Created` | **APROBADO** |

---

### 6.3 Pruebas de Usabilidad y Aceptación (UAT)

Las pruebas de usabilidad y aceptación verifican el cumplimiento de las expectativas del usuario final (Administradora, Secretaria, Costurera y Cliente) en escenarios reales de operación:

| ID Historia | Rol de Usuario | Criterio de Aceptación Evaluado | Escenario de Validación UAT | Resultado UAT |
|---|---|---|---|---|
| **HU-01** | Administradora | Visualizar métricas en tiempo real y flujo de pedidos. | Ingreso al Dashboard Admin, visualización de tarjetas KPI de pedidos pendientes, ingresos del mes y entregas próximas. | **SATISFACTORIO** |
| **HU-02** | Secretaría | Agendamiento visual en calendario y atención de citas. | Vista del calendario interactivo por días, selección de día para agendar pedido y vinculación de cita pendiente al modal de nuevo pedido. | **SATISFACTORIO** |
| **HU-03** | Secretaría | Cobro de saldo pendiente y entrega oficial de prendas. | Apertura de `ModalEntrega.jsx`, corroboración visual de desglose de anticipo y saldo restante, confirmación de cobro con actualización a `Entregado`. | **SATISFACTORIO** |
| **HU-04** | Secretaría | Registro integral de pedidos con medidas anatómicas. | Llenado de `ModalPedido.jsx`, desplegado de campos de busto, cintura, cadera, selección de método de pago (QR) y verificación de saldo en vivo. | **SATISFACTORIO** |
| **HU-05** | Costurera | Vista móvil simplificada de fichas técnicas y cambio de estado. | Acceso desde dispositivo móvil PWA (`/mobile`), visualización de medidas anatómicas y avance de etapas (Corte $\rightarrow$ Armado $\rightarrow$ Prueba). | **SATISFACTORIO** |
| **HU-06** | Administradora | Auditoría de movimientos en Kardex e insumos bajos. | Acceso a `KardexView.jsx`, filtrado por pestañas de entradas y salidas, visualización de insumos con stock bajo en amarillo/rojo. | **SATISFACTORIO** |
| **HU-07** | Administradora | Emisión e impresión de Notas de Venta inmutables. | Presión del botón `🧾 Nota` en la tabla de pedidos, visualización de `ModalNotaVenta.jsx` con formato de factura oficial y función de impresión. | **SATISFACTORIO** |
| **HU-08** | Cliente | Consulta de estado de confección desde la PWA. | Inicio de sesión desde el móvil, visualización del progreso en tiempo real de su prenda y verificación de medidas registradas. | **SATISFACTORIO** |

---

## 7. Resultados de Ejecución de Pruebas Actuales

### 1. Ejecución de la Suite Automatizada con Jest
Se configuró Jest con soporte para base de datos PostgreSQL real bajo aislamiento transaccional:

```bash
> backend@1.0.0 test
> cross-env NODE_ENV=test jest --runInBand

PASS tests/models/KardexModel.test.js
  Kardex & Notas de Venta - Módulo 4 (Integration)
    √ debe registrar una entrada por compra en Kardex e incrementar el stock (62 ms)
    √ debe registrar un movimiento con material de cliente sin alterar el stock del taller (5 ms)
    √ debe rechazar una salida que supere el stock disponible (8 ms)
    √ debe generar una nota de venta inmutable con descuento (8 ms)

PASS tests/controllers/authController.test.js
  Auth API (Integration)
    √ POST /api/auth/login - debe autenticar y retornar JWT (92 ms)
    √ POST /api/auth/login - debe fallar con contraseña incorrecta (61 ms)
    √ POST /api/auth/login - debe fallar si falta correo o contraseña (5 ms)

PASS tests/models/UsuarioModel.test.js
  UsuarioModel (Integration)
    √ debe crear un nuevo usuario correctamente (168 ms)
    √ debe buscar un usuario por correo (1 ms)
    √ debe retornar null para un correo inexistente (1 ms)

PASS tests/models/PedidoModel.test.js
  PedidoModel & Módulo 2 (Integration)
    √ debe crear un pedido completo con detalle, medidas y pago inicial (61 ms)
    √ debe registrar un abono adicional correctamente (5 ms)
    √ debe actualizar el estado del pedido a Prueba (3 ms)
    √ debe saldar el resto y marcar como Entregado (4 ms)

Test Suites: 4 passed, 4 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        1.528 s
Ran all test suites.
```
**Efectividad:** 100% de pruebas unitarias e integración aprobadas sin fallos.

### 2. Dashboard de Pruebas Integrado (`AdminTestDashboard.jsx`)
Para facilitar la demostración ante tribunales de tesis y la interacción entre agentes de IA, se integró una herramienta visual en `/admin/pruebas`:
- **Pestaña Jest Runner:** Ejecuta las pruebas automatizadas en tiempo real desde el frontend mediante el endpoint `POST /api/tests/run` y renderiza los resultados detallados por suite.
- **Pestaña API Tester:** Cliente HTTP interactivo integrado en el sistema con botones de acceso rápido preconfigurados para probar cualquier endpoint (`/api/pedidos`, `/api/kardex`, `/api/notas-venta`, `/api/pagos/catalogos`).

### 3. Rendimiento de Compilación Frontend (Vite Build)
- Total de módulos transformados: **156 módulos**.
- Tiempo de compilación: **412 ms**.
- Service Worker PWA generado con Workbox en modo producción sin advertencias de sintaxis.

---

## 8. Credenciales y Datos Semilla para Demostración

La base de datos cuenta con datos representativos pre-cargados para pruebas funcionales inmediatas. La contraseña de todos los usuarios de prueba es `123456`.

### Personal Interno del Taller
| Rol | Correo Electrónico | Contraseña | Perfil / Alcance |
|---|---|---|---|
| **Admin** | `admin@simonetta.com` | `123456` | Acceso irrestricto a todos los módulos, Kardex, usuarios, finanzas y reportes. |
| **Secretaria** | `secretaria@simonetta.com` | `123456` | Acceso a agenda de citas, recepción de pedidos, cobros de saldos y almacén. |
| **Costurera** | `costurera1@simonetta.com` | `123456` | Vista móvil para taller: fichas técnicas de prendas asignadas y avance de corte/armado. |
| **Costurera** | `costurera2@simonetta.com` | `123456` | Vista móvil de costura secundaria. |

### Clientes de Prueba
| Tipo Cliente | Correo Electrónico | Contraseña | Nombre / Razón Social | Datos Adicionales |
|---|---|---|---|---|
| **Persona** | `maria.garcia@email.com` | `123456` | María García López | CI: 6789012 LP, Tel: 70123456 |
| **Persona** | `juana.perez@email.com` | `123456` | Juana Pérez Mamani | CI: 7890123 LP, Tel: 71234567 |
| **Institucional** | `contacto@colegiofrances.edu.bo` | `123456` | Colegio Francés La Paz S.R.L. | NIT: 1029384021, Contrato #CTR-2026-001 |

---

## 9. Guía de Retroalimentación y Colaboración entre Agentes de IA

Para asegurar la coherencia entre el desarrollo técnico del software y la redacción del documento de Proyecto de Grado, se establecen las siguientes pautas de trabajo colaborativo:

### 📌 Puntos Clave para el Agente que Redacta el Documento
1. **Capítulo de Análisis y Diseño de Base de Datos:**
   - Citar explícitamente el uso de la **Tercera Forma Normal (3FN)** con particionamiento vertical (`usuarios`/`datos_usuario`) y subtipos lógicos para personas naturales vs jurídicas.
   - Resaltar la innovación del **Polimorfismo de Atributos** en el Almacén (evita columnas nulas masivas) y el enlace de **Medidas 1:1 a Detalle de Pedido**.
2. **Capítulo de Implementación de Reglas de Negocio:**
   - Enfatizar la **Auditoría Kardex con doble origen** (`Taller` vs `Cliente`), justificando cómo la solución protege contablemente el inventario de la empresa cuando los clientes proveen sus propias telas exclusivas.
   - Describir la **Inmutabilidad de la Nota de Venta**, garantizando certeza jurídica y financiera en auditorías fiscales.
3. **Capítulo de Verificación y Pruebas del Software:**
   - Incorporar las tablas de **Pruebas de Caja Blanca**, **Pruebas de Caja Negra** (Valores Límite y Clases de Equivalencia) y **Pruebas UAT** detalladas en la Sección 6 de este informe.
   - Adjuntar el resultado formal de la suite Jest (14 pruebas aprobadas al 100%).

### 🔄 Mecanismo de Ajustes y Correcciones Técnicas
Si durante la redacción del documento el agente de IA o el tutor académico sugieren:
- Ajustar un caso de uso o agregar un parámetro adicional a un reporte.
- Modificar el porcentaje de algún descuento o incorporar un nuevo tipo de movimiento en el Kardex.
- Añadir nuevas aserciones a la suite de pruebas automatizadas.

El presente agente de desarrollo está preparado para realizar las modificaciones directamente en el código fuente, ejecutar las pruebas pertinentes y emitir los commits correspondientes.

---
*Fin del Informe Técnico. Documento oficial generado para Simonetta Modas PWA.*
