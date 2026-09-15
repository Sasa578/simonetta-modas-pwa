// =====================================================================
// SIMONETTA MODAS - SCRIPT DE SEMILLA (SEED) INTEGRAL
// Población de catálogos y datos iniciales para los 4 módulos
// =====================================================================

const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const sembrarDatos = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('🌱 Iniciando siembra de catálogos y datos iniciales...\n');

        // =====================================================================
        // MÓDULO 1: CATÁLOGOS Y DOMINIOS
        // =====================================================================
        console.log('📦 Sembrando catálogos Módulo 1 (Seguridad, Usuarios, Clientes)...');

        // Roles
        await client.query(`
            INSERT INTO roles (id_rol, nombre_rol) VALUES
                (1, 'Admin'),
                (2, 'Secretaria'),
                (3, 'Costurera'),
                (4, 'Cliente')
            ON CONFLICT (nombre_rol) DO NOTHING;
        `);

        // Descripciones de roles
        await client.query(`
            INSERT INTO descripciones_rol (id_rol, descripcion) VALUES
                (1, 'Administrador general con acceso total a reportes, usuarios y finanzas.'),
                (2, 'Gestión de clientes, toma de pedidos, citas de prueba y registro de pagos.'),
                (3, 'Visualización de fichas técnicas de confección, corte, armado y registro de avance.'),
                (4, 'Consumidor final. Acceso a seguimiento de pedidos, catálogo y citas en la PWA.')
            ON CONFLICT (id_rol) DO NOTHING;
        `);

        // Estados de usuario
        await client.query(`
            INSERT INTO estados_usuario (id_estado_usuario, nombre_estado) VALUES
                (1, 'Activo'),
                (2, 'Inactivo'),
                (3, 'Suspendido')
            ON CONFLICT (nombre_estado) DO NOTHING;
        `);

        // Estados de cliente
        await client.query(`
            INSERT INTO estados_cliente (id_estado_cliente, nombre_estado) VALUES
                (1, 'Activo'),
                (2, 'Inactivo'),
                (3, 'Potencial')
            ON CONFLICT (nombre_estado) DO NOTHING;
        `);

        // Tipo de cliente
        await client.query(`
            INSERT INTO tipo_cliente (id_tipo_cliente, nombre_tipo) VALUES
                (1, 'Persona'),
                (2, 'Institucional')
            ON CONFLICT (nombre_tipo) DO NOTHING;
        `);

        // Descripciones de tipos de cliente
        await client.query(`
            INSERT INTO descripciones_tipo_cliente (id_tipo_cliente, descripcion) VALUES
                (1, 'Consumidor particular individual con medidas anatómicas personales.'),
                (2, 'Empresas, colegios o instituciones corporativas que contratan confección por lote.')
            ON CONFLICT (id_tipo_cliente) DO NOTHING;
        `);

        // =====================================================================
        // MÓDULO 1: USUARIOS Y CLIENTES DE PRUEBA
        // =====================================================================
        const passwordHash = await bcrypt.hash('123456', 10);

        // 1. Personal Interno
        const staff = [
            { rol: 1, correo: 'admin@simonetta.com', nombre: 'Carlos', apellido: 'Mendoza', ci: '1234567 LP', tel: '+591 70011223' },
            { rol: 2, correo: 'secretaria@simonetta.com', nombre: 'Patricia', apellido: 'Gómez', ci: '2345678 LP', tel: '+591 70022334' },
            { rol: 3, correo: 'costurera@simonetta.com', nombre: 'Elena', apellido: 'Rojas', ci: '3456789 LP', tel: '+591 70033445' },
        ];

        for (const s of staff) {
            const uRes = await client.query(`
                INSERT INTO usuarios (id_rol, id_estado_usuario, correo_electronico, password_hash)
                VALUES ($1, 1, $2, $3)
                RETURNING id_usuario
            `, [s.rol, s.correo, passwordHash]);

            const idUsuario = uRes.rows[0].id_usuario;

            await client.query(`
                INSERT INTO datos_usuario (id_usuario, nombre, apellido, carnet_identidad, fecha_nacimiento, telefono)
                VALUES ($1, $2, $3, $4, '1990-05-15', $5)
            `, [idUsuario, s.nombre, s.apellido, s.ci, s.tel]);
        }
        console.log('✅ Personal interno registrado con partición vertical (usuarios + datos_usuario)');

        // 2. Clientes Persona Natural
        const clientesPersona = [
            { correo: 'maria.garcia@email.com', nombre: 'María', apellido: 'García López', tel: '+591 77712345' },
            { correo: 'juana.perez@email.com', nombre: 'Juana', apellido: 'Pérez Mamani', tel: '+591 77723456' }
        ];

        for (const cp of clientesPersona) {
            const cRes = await client.query(`
                INSERT INTO clientes (id_tipo_cliente, id_rol, id_estado_cliente, correo_electronico, password_hash)
                VALUES (1, 4, 1, $1, $2)
                RETURNING id_cliente
            `, [cp.correo, passwordHash]);

            const idCli = cRes.rows[0].id_cliente;

            await client.query(`
                INSERT INTO datos_cliente_persona (id_cliente, nombre, apellido, telefono, fecha_nacimiento)
                VALUES ($1, $2, $3, $4, '1994-08-20')
            `, [idCli, cp.nombre, cp.apellido, cp.tel]);

            // Atributos de cliente
            await client.query(`
                INSERT INTO atributos_cliente (id_cliente, nombre_atributo, valor_atributo)
                VALUES ($1, 'Preferencia de tela', 'Fibras naturales (Lino, Seda)'),
                       ($1, 'Estilo de ajuste', 'Entallado anatómico')
            `, [idCli]);
        }

        // 3. Cliente Institucional
        const cInstRes = await client.query(`
            INSERT INTO clientes (id_tipo_cliente, id_rol, id_estado_cliente, correo_electronico, password_hash)
            VALUES (2, 4, 1, 'contacto@colegiofrances.edu.bo', $1)
            RETURNING id_cliente
        `, [passwordHash]);

        const idCliInst = cInstRes.rows[0].id_cliente;

        const dInstRes = await client.query(`
            INSERT INTO datos_cliente_institucional (id_cliente, razon_social, nit, nombre_contacto, telefono_contacto)
            VALUES ($1, 'Colegio Francés La Paz S.R.L.', '1023948571', 'Lic. Rodrigo Terán', '+591 76543210')
            RETURNING id_datos_institucional
        `, [idCliInst]);

        const idDatosInst = dInstRes.rows[0].id_datos_institucional;

        // Contrato institucional
        await client.query(`
            INSERT INTO contratos (id_datos_institucional, numero_contrato, fecha_firma, fecha_vencimiento, url_clausulas_pdf)
            VALUES ($1, 'CTR-2026-001', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 'https://simonetta.com/docs/contratos/ctr-2026-001.pdf')
        `, [idDatosInst]);

        console.log('✅ Clientes de prueba registrados (Persona Natural con atributos + Institucional con contrato)');

        // =====================================================================
        // MÓDULO 2: CATÁLOGOS Y MODELOS DE PEDIDO
        // =====================================================================
        console.log('📦 Sembrando catálogos Módulo 2 (Pedidos, Pagos, Citas)...');

        await client.query(`
            INSERT INTO estados_pedido (id_estado_pedido, nombre_estado) VALUES
                (1, 'Pendiente'),
                (2, 'Corte'),
                (3, 'Armado'),
                (4, 'Prueba'),
                (5, 'Terminado'),
                (6, 'Entregado'),
                (7, 'Cancelado')
            ON CONFLICT (nombre_estado) DO NOTHING;
        `);

        await client.query(`
            INSERT INTO estados_pago (id_estado_pago, nombre_estado) VALUES
                (1, 'Pendiente'),
                (2, 'Adelanto Parcial'),
                (3, 'Completado'),
                (4, 'Anulado')
            ON CONFLICT (nombre_estado) DO NOTHING;
        `);

        await client.query(`
            INSERT INTO metodos_pago (id_metodo_pago, nombre_metodo) VALUES
                (1, 'Efectivo'),
                (2, 'QR / Transferencia Bancaria'),
                (3, 'Tarjeta de Débito/Crédito')
            ON CONFLICT (nombre_metodo) DO NOTHING;
        `);

        await client.query(`
            INSERT INTO estados_cita (id_estado_cita, nombre_estado) VALUES
                (1, 'Programada'),
                (2, 'Realizada'),
                (3, 'Reprogramada'),
                (4, 'Cancelada')
            ON CONFLICT (nombre_estado) DO NOTHING;
        `);

        // Catálogo de modelos
        const catRes = await client.query(`
            INSERT INTO catalogo (nombre_catalogo, url_imagen_catalogo)
            VALUES ('Colección Gala y Ceremonia 2026', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae')
            RETURNING id_catalogo
        `);
        const idCat = catRes.rows[0].id_catalogo;

        await client.query(`
            INSERT INTO descripciones_catalogo (id_catalogo, descripcion)
            VALUES ($1, 'Diseños exclusivos de alta costura para eventos de etiqueta y graduaciones.')
        `, [idCat]);

        // Prenda
        const prenRes = await client.query(`
            INSERT INTO prendas (id_catalogo, tipo_prenda, color)
            VALUES ($1, 'Vestido de Gala Escote V', 'Azul Noche')
            RETURNING id_prenda
        `, [idCat]);
        const idPrenda = prenRes.rows[0].id_prenda;

        await client.query(`
            INSERT INTO descripciones_prenda (id_prenda, descripcion_detallada)
            VALUES ($1, 'Vestido largo con corset interno estructurado con varillas, falda con caída en A y espalda descubierta.')
        `, [idPrenda]);

        // Pedido de prueba para María García
        const cliMariaRes = await client.query(`SELECT id_cliente FROM clientes WHERE correo_electronico = 'maria.garcia@email.com'`);
        const idMaria = cliMariaRes.rows[0].id_cliente;

        const pedRes = await client.query(`
            INSERT INTO pedidos (id_cliente, id_estado_pedido, fecha_inicio, fecha_prueba, fecha_entrega, costo_total)
            VALUES ($1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '12 days', 750.00)
            RETURNING id_pedido
        `, [idMaria]);
        const idPedido = pedRes.rows[0].id_pedido;

        // Detalle del pedido
        const detRes = await client.query(`
            INSERT INTO detalle_pedido (id_pedido, id_prenda, cantidad, subtotal)
            VALUES ($1, $2, 1, 750.00)
            RETURNING id_detalle
        `, [idPedido, idPrenda]);
        const idDetalle = detRes.rows[0].id_detalle;

        await client.query(`
            INSERT INTO notas_diseno_detalle (id_detalle, notas_diseno)
            VALUES ($1, 'Agregar refuerzo en sisa. La clienta solicitó largo especial para tacones de 10 cm.')
        `, [idDetalle]);

        // Medidas vinculadas al detalle de la prenda
        await client.query(`
            INSERT INTO medidas_anatomicas (id_detalle, cortas, cintura, frente, alto_cadera, cadera, entre_busto, busto, espalda, hombro)
            VALUES ($1, 58.5, 72.0, 42.0, 24.5, 98.0, 22.0, 94.0, 38.0, 14.5)
        `, [idDetalle]);

        await client.query(`
            INSERT INTO medidas_convencionales (id_detalle, talla, equivalencia_europea)
            VALUES ($1, 'M', '38')
        `, [idDetalle]);

        // Pago inicial fraccionado (Adelanto)
        await client.query(`
            INSERT INTO pagos (id_pedido, id_estado_pago, id_metodo_pago, monto_pago)
            VALUES ($1, 2, 2, 350.00)
        `, [idPedido]);

        // Cita de prueba
        await client.query(`
            INSERT INTO citas (id_cliente, id_pedido, id_estado_cita, fecha_cita, motivo_cita)
            VALUES ($1, $2, 1, CURRENT_TIMESTAMP + INTERVAL '5 days', 'Primera prueba de estructura y entallado')
        `, [idMaria, idPedido]);

        console.log('✅ Pedido de prueba creado con detalle, notas de diseño, medidas por prenda, pago y cita');

        // =====================================================================
        // MÓDULO 3: CATÁLOGOS Y ALMACÉN
        // =====================================================================
        console.log('📦 Sembrando catálogos Módulo 3 (Almacén e Insumos)...');

        // Unidades de medida
        await client.query(`
            INSERT INTO unidades_medida (abreviatura, descripcion) VALUES
                ('m', 'Metros lineales'),
                ('cm', 'Centímetros'),
                ('u', 'Unidades'),
                ('pz', 'Piezas'),
                ('carrete', 'Carretes / Rollos')
            ON CONFLICT (abreviatura) DO NOTHING;
        `);

        // Colores
        await client.query(`
            INSERT INTO colores (nombre_color, codigo_hexadecimal) VALUES
                ('Azul Noche', '#001A4D'),
                ('Blanco Perla', '#F8F9FA'),
                ('Negro Ébano', '#1A1A1A'),
                ('Dorado Real', '#D4AF37'),
                ('Rojo Rubí', '#9B111E')
            ON CONFLICT (nombre_color) DO NOTHING;
        `);

        // Materiales base
        await client.query(`
            INSERT INTO materiales_base (nombre_material) VALUES
                ('Algodón'),
                ('Seda'),
                ('Lino'),
                ('Poliéster'),
                ('Metal'),
                ('Nylon')
            ON CONFLICT (nombre_material) DO NOTHING;
        `);

        // Categorías de almacén
        await client.query(`
            INSERT INTO categorias_almacen (id_categoria, nombre_categoria) VALUES
                (1, 'Telas y Forros'),
                (2, 'Hilos y Confección'),
                (3, 'Botones y Broches'),
                (4, 'Cierres y Herrajes')
            ON CONFLICT (nombre_categoria) DO NOTHING;
        `);

        // Tipos de producto
        await client.query(`
            INSERT INTO tipos_producto (id_categoria, nombre_tipo) VALUES
                (1, 'Gabardina Pesada'),
                (1, 'Lino Suizo'),
                (2, 'Hilo Mercerizado 100m'),
                (3, 'Botón de Resina 4 Ojales'),
                (4, 'Cierre Invisible Reforzado')
            ON CONFLICT (id_categoria, nombre_tipo) DO NOTHING;
        `);

        // Insumos en stock y sus especificaciones 1:1
        // 1. Tela Gabardina
        const prod1 = await client.query(`
            INSERT INTO productos_almacen (id_tipo_producto, id_unidad_medida, id_color, id_material_base, nombre_articulo, cantidad_stock, stock_minimo)
            VALUES (
                (SELECT id_tipo_producto FROM tipos_producto WHERE nombre_tipo = 'Gabardina Pesada'),
                (SELECT id_unidad_medida FROM unidades_medida WHERE abreviatura = 'm'),
                (SELECT id_color FROM colores WHERE nombre_color = 'Azul Noche'),
                (SELECT id_material_base FROM materiales_base WHERE nombre_material = 'Algodón'),
                'Gabardina Twill Azul Noche', 28.50, 6.00
            ) RETURNING id_producto;
        `);
        await client.query(`
            INSERT INTO esp_telas (id_producto, grupo, subgrupo, textura, calidad)
            VALUES ($1, 'Sastrería', 'Gabardinas', 'Sarga Diagonal', 'Alta Densidad')
        `, [prod1.rows[0].id_producto]);

        // 2. Hilo Mercerizado
        const prod2 = await client.query(`
            INSERT INTO productos_almacen (id_tipo_producto, id_unidad_medida, id_color, id_material_base, nombre_articulo, cantidad_stock, stock_minimo)
            VALUES (
                (SELECT id_tipo_producto FROM tipos_producto WHERE nombre_tipo = 'Hilo Mercerizado 100m'),
                (SELECT id_unidad_medida FROM unidades_medida WHERE abreviatura = 'carrete'),
                (SELECT id_color FROM colores WHERE nombre_color = 'Dorado Real'),
                (SELECT id_material_base FROM materiales_base WHERE nombre_material = 'Poliéster'),
                'Hilo Mercerizado Dorado 100m', 12.00, 4.00
            ) RETURNING id_producto;
        `);
        await client.query(`
            INSERT INTO esp_hilos (id_producto, tipo_hilo, grosor)
            VALUES ($1, 'Poliéster Mercerizado', 'No. 40')
        `, [prod2.rows[0].id_producto]);

        // 3. Botón de Resina
        const prod3 = await client.query(`
            INSERT INTO productos_almacen (id_tipo_producto, id_unidad_medida, id_color, id_material_base, nombre_articulo, cantidad_stock, stock_minimo)
            VALUES (
                (SELECT id_tipo_producto FROM tipos_producto WHERE nombre_tipo = 'Botón de Resina 4 Ojales'),
                (SELECT id_unidad_medida FROM unidades_medida WHERE abreviatura = 'u'),
                (SELECT id_color FROM colores WHERE nombre_color = 'Negro Ébano'),
                (SELECT id_material_base FROM materiales_base WHERE nombre_material = 'Metal'),
                'Botón Sastre Negro 24L', 150.00, 40.00
            ) RETURNING id_producto;
        `);
        await client.query(`
            INSERT INTO esp_botones (id_producto, tipo_boton, tamano)
            VALUES ($1, '4 Ojales Sastrería', '24L (15mm)')
        `, [prod3.rows[0].id_producto]);

        console.log('✅ Insumos de almacén creados con desnormalización controlada (esp_telas, esp_hilos, esp_botones)');

        // =====================================================================
        // MÓDULO 4: KARDEX, PROVEEDORES Y NOTAS DE VENTA
        // =====================================================================
        console.log('📦 Sembrando catálogos Módulo 4 (Kardex, Descuentos, Proveedores)...');

        // Descuentos por tipo de cliente
        await client.query(`
            INSERT INTO descuentos (id_tipo_cliente, nombre_descuento, porcentaje) VALUES
                (1, 'Descuento Temporada Promocional', 5.00),
                (2, 'Descuento Corporativo Institucional', 10.00)
            ON CONFLICT DO NOTHING;
        `);

        // Proveedores
        const provRes = await client.query(`
            INSERT INTO proveedores (nombre_empresa, nombre_contacto, telefono_contacto, direccion)
            VALUES ('Distribuidora Textil Altiplano S.R.L.', 'Lic. Marcelo Castro', '+591 2 2456789', 'Av. Buenos Aires #890, La Paz')
            RETURNING id_proveedor;
        `);
        const idProv = provRes.rows[0].id_proveedor;

        // Catálogos de movimientos
        await client.query(`
            INSERT INTO tipos_movimiento (id_tipo_movimiento, nombre_movimiento) VALUES
                (1, 'Entrada por Compra'),
                (2, 'Salida por Confección'),
                (3, 'Ajuste de Inventario'),
                (4, 'Devolución de Sobrante')
            ON CONFLICT (nombre_movimiento) DO NOTHING;
        `);

        await client.query(`
            INSERT INTO origenes_material (id_origen, nombre_origen) VALUES
                (1, 'Taller'),
                (2, 'Cliente')
            ON CONFLICT (nombre_origen) DO NOTHING;
        `);

        // Movimiento inicial de Kardex (Entrada de Gabardina por compra a proveedor)
        const movRes = await client.query(`
            INSERT INTO movimientos_almacen (id_producto, id_proveedor, id_detalle_pedido, id_tipo_movimiento, id_origen, cantidad)
            VALUES ($1, $2, NULL, 1, 1, 30.00)
            RETURNING id_movimiento
        `, [prod1.rows[0].id_producto, idProv]);

        await client.query(`
            INSERT INTO observaciones_movimiento (id_movimiento, observacion)
            VALUES ($1, 'Ingreso según Factura Proveedor N° 45892. Material inspeccionado y recibido en óptimas condiciones.')
        `, [movRes.rows[0].id_movimiento]);

        // Nota de Venta para el pedido
        await client.query(`
            INSERT INTO notas_venta (id_pedido, id_descuento, numero_nota, subtotal, total_final, estado_envio_correo)
            VALUES ($1, (SELECT id_descuento FROM descuentos WHERE nombre_descuento = 'Descuento Temporada Promocional'), 'NV-2026-0001', 750.00, 712.50, 'Pendiente')
        `, [idPedido]);

        console.log('✅ Kardex, proveedores, movimientos y nota de venta registrados exitosamente');

        await client.query('COMMIT');
        console.log('\n🎉 ¡Siembra de base de datos completada con éxito para los 4 módulos!\n');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error durante la siembra de datos:', error);
    } finally {
        client.release();
        await pool.end();
    }
};

sembrarDatos();
