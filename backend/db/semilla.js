// =====================================================================
// SIMONETTA MODAS - SCRIPT DE SEMILLA (SEED) INTEGRAL
// Población de catálogos y datos iniciales para los 4 módulos (3FN)
// =====================================================================

const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const sembrarDatos = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('🌱 Iniciando siembra de catálogos y datos iniciales...\n');

        // =====================================================================
        // MÓDULO 1: SEGURIDAD, USUARIOS Y CLIENTES
        // =====================================================================
        console.log('📦 Sembrando catálogos Módulo 1 (Seguridad, Usuarios, Clientes)...');

        // Roles
        await client.query(`
            INSERT INTO roles (id_rol, nombre_rol) VALUES
                (1, 'Admin'),
                (2, 'Secretaria'),
                (3, 'Costurera'),
                (4, 'Cliente')
            ON CONFLICT DO NOTHING;
        `);

        // Descripciones de roles
        await client.query(`
            INSERT INTO descripciones_rol (id_rol, descripcion) VALUES
                (1, 'Administrador general con acceso total a reportes, usuarios y finanzas.'),
                (2, 'Gestión de clientes, toma de pedidos, citas de prueba y registro de pagos.'),
                (3, 'Visualización de fichas técnicas de confección, corte, armado y registro de avance.'),
                (4, 'Consumidor final. Acceso a seguimiento de pedidos, catálogo y citas en la PWA.')
            ON CONFLICT DO NOTHING;
        `);

        // Estados de usuario
        await client.query(`
            INSERT INTO estados_usuario (id_estado_usuario, nombre_estado) VALUES
                (1, 'Activo'),
                (2, 'Inactivo'),
                (3, 'Suspendido')
            ON CONFLICT DO NOTHING;
        `);

        // Tipos de cliente
        await client.query(`
            INSERT INTO tipo_cliente (id_tipo_cliente, nombre_tipo) VALUES
                (1, 'Persona'),
                (2, 'Institucional')
            ON CONFLICT DO NOTHING;
        `);

        // Descripciones de tipos de cliente
        await client.query(`
            INSERT INTO descripciones_tipo_cliente (id_tipo_cliente, descripcion) VALUES
                (1, 'Cliente individual o particular que solicita prendas a medida personales.'),
                (2, 'Empresa, comparsa, fraternidad o institución que solicita uniformes o trajes en lote.')
            ON CONFLICT DO NOTHING;
        `);

        // Estados de cliente
        await client.query(`
            INSERT INTO estados_cliente (id_estado_cliente, nombre_estado) VALUES
                (1, 'Activo'),
                (2, 'Inactivo'),
                (3, 'Frecuente'),
                (4, 'Moroso')
            ON CONFLICT DO NOTHING;
        `);

        // =====================================================================
        // MÓDULO 2: PEDIDOS, MEDIDAS, PAGOS Y CITAS NORMALIZADAS (3FN)
        // =====================================================================
        console.log('📋 Sembrando catálogos Módulo 2 (Pedidos, Pagos, Citas, Patronaje)...');

        // Estados de pedido
        await client.query(`
            INSERT INTO estados_pedido (id_estado_pedido, nombre_estado) VALUES
                (1, 'Pendiente'),
                (2, 'Corte'),
                (3, 'Armado'),
                (4, 'Prueba'),
                (5, 'Terminado'),
                (6, 'Entregado'),
                (7, 'Cancelado')
            ON CONFLICT DO NOTHING;
        `);

        // Estados de pago
        await client.query(`
            INSERT INTO estados_pago (id_estado_pago, nombre_estado) VALUES
                (1, 'Pendiente'),
                (2, 'Adelanto Parcial'),
                (3, 'Completado'),
                (4, 'Anulado')
            ON CONFLICT DO NOTHING;
        `);

        // Métodos de pago
        await client.query(`
            INSERT INTO metodos_pago (id_metodo_pago, nombre_metodo) VALUES
                (1, 'Efectivo'),
                (2, 'QR / Transferencia')
            ON CONFLICT DO NOTHING;
        `);

        // Estados de cita
        await client.query(`
            INSERT INTO estados_cita (id_estado_cita, nombre_estado) VALUES
                (1, 'Programada'),
                (2, 'Realizada'),
                (3, 'Reprogramada'),
                (4, 'Cancelada')
            ON CONFLICT DO NOTHING;
        `);

        // Motivos de cita normalizados
        await client.query(`
            INSERT INTO motivos_cita (id_motivo_cita, nombre_motivo, descripcion) VALUES
                (1, 'Cotización y Diseño', 'Asesoría inicial de diseño, elección de modelo y presupuesto'),
                (2, 'Toma de Medidas', 'Registro presencial de medidas corporales y patronaje'),
                (3, 'Primera Prueba de Vestuario', 'Prueba preliminar del ensamble y caída de la prenda'),
                (4, 'Ajuste de Prenda', 'Segunda prueba de precisión y ajustes finos'),
                (5, 'Entrega y Retiro', 'Recepción final de la prenda terminada y liquidación de saldo'),
                (6, 'Consulta General', 'Atención para consultas generales y requerimientos especiales')
            ON CONFLICT (nombre_motivo) DO NOTHING;
        `);

        // Rangos de edad
        await client.query(`
            INSERT INTO rangos_edad (id_rango_edad, nombre_rango, descripcion) VALUES
                (1, 'Adulto', 'Rango de personas adultas (18 años en adelante)'),
                (2, 'Adolescente', 'Rango de jóvenes y adolescentes (12 a 17 años)'),
                (3, 'Niño', 'Rango infantil (4 a 11 años)')
            ON CONFLICT (nombre_rango) DO NOTHING;
        `);

        // Géneros
        await client.query(`
            INSERT INTO generos (id_genero, nombre_genero) VALUES
                (1, 'Mujer'),
                (2, 'Varón'),
                (3, 'Unisex')
            ON CONFLICT (nombre_genero) DO NOTHING;
        `);

        // Tallas estándar
        await client.query(`
            INSERT INTO tallas_estandar (id_talla_estandar, nombre_talla, equivalencia_europea, orden) VALUES
                (1, 'XS', '34-36', 1),
                (2, 'S', '36-38', 2),
                (3, 'M', '38-40', 3),
                (4, 'L', '42-44', 4),
                (5, 'XL', '46-48', 5),
                (6, 'XXL', '50-52', 6)
            ON CONFLICT (nombre_talla) DO UPDATE SET 
                equivalencia_europea = EXCLUDED.equivalencia_europea,
                orden = EXCLUDED.orden;
        `);

        // Matriz Maestra de Medidas Convencionales (36 combinaciones)
        console.log('📐 Sembrando matriz maestra de 36 combinaciones de patronaje...');
        const matriz = [
            // Adulto - Mujer
            ['Adulto', 'Mujer', 'XS', 82, 62, 88, 35, 11, 38, 41, 18, 16],
            ['Adulto', 'Mujer', 'S', 86, 66, 92, 36, 11.5, 40, 42, 19, 17],
            ['Adulto', 'Mujer', 'M', 92, 72, 98, 37, 12, 42, 44, 20, 18],
            ['Adulto', 'Mujer', 'L', 100, 80, 106, 38.5, 12.5, 43.5, 46, 21, 19],
            ['Adulto', 'Mujer', 'XL', 108, 88, 114, 40, 13, 45, 48, 22, 20],
            ['Adulto', 'Mujer', 'XXL', 116, 96, 122, 42, 13.5, 46, 50, 23, 21],
            
            // Adulto - Varón
            ['Adulto', 'Varón', 'XS', 88, 74, 90, 41, 13, 43, 43, 20, 19],
            ['Adulto', 'Varón', 'S', 94, 80, 96, 43, 13.5, 44.5, 45, 20.5, 20],
            ['Adulto', 'Varón', 'M', 100, 86, 102, 45, 14, 46, 47, 21, 21],
            ['Adulto', 'Varón', 'L', 108, 94, 110, 47, 14.5, 48, 49, 22, 22],
            ['Adulto', 'Varón', 'XL', 116, 102, 118, 49, 15, 49.5, 51, 23, 23],
            ['Adulto', 'Varón', 'XXL', 124, 110, 126, 51, 15.5, 51, 53, 24, 24],

            // Adolescente - Mujer
            ['Adolescente', 'Mujer', 'XS', 74, 56, 80, 32, 9.5, 34, 36, 16, 14],
            ['Adolescente', 'Mujer', 'S', 78, 60, 84, 33, 10, 36, 38, 17, 15],
            ['Adolescente', 'Mujer', 'M', 82, 64, 88, 34.5, 10.5, 38, 40, 18, 16],
            ['Adolescente', 'Mujer', 'L', 86, 68, 92, 36, 11, 40, 42, 19, 17],
            ['Adolescente', 'Mujer', 'XL', 92, 74, 98, 37, 11.5, 41, 43, 19.5, 18],
            ['Adolescente', 'Mujer', 'XXL', 98, 80, 104, 38, 12, 42, 44, 20, 19],

            // Adolescente - Varón
            ['Adolescente', 'Varón', 'XS', 76, 64, 80, 36, 11, 38, 38, 17, 16],
            ['Adolescente', 'Varón', 'S', 82, 68, 84, 38, 11.5, 40, 40, 18, 17],
            ['Adolescente', 'Varón', 'M', 88, 74, 90, 40, 12, 42, 42, 19, 18],
            ['Adolescente', 'Varón', 'L', 94, 80, 96, 42, 12.5, 44, 44, 20, 19],
            ['Adolescente', 'Varón', 'XL', 100, 86, 102, 44, 13, 45.5, 46, 21, 20],
            ['Adolescente', 'Varón', 'XXL', 106, 92, 108, 46, 13.5, 47, 48, 21.5, 21],

            // Niño - Mujer
            ['Niño', 'Mujer', 'XS', 54, 50, 56, 24, 7, 24, 25, 12, 11],
            ['Niño', 'Mujer', 'S', 58, 53, 60, 25.5, 7.5, 26, 27, 13, 12],
            ['Niño', 'Mujer', 'M', 62, 56, 64, 27, 8, 28, 29, 14, 13],
            ['Niño', 'Mujer', 'L', 66, 59, 68, 28.5, 8.5, 30, 31, 14.5, 13.5],
            ['Niño', 'Mujer', 'XL', 70, 62, 72, 30, 9, 32, 33, 15, 14],
            ['Niño', 'Mujer', 'XXL', 74, 65, 76, 31, 9.5, 34, 35, 15.5, 14.5],

            // Niño - Varón
            ['Niño', 'Varón', 'XS', 56, 52, 58, 25, 7.5, 25, 26, 12.5, 12],
            ['Niño', 'Varón', 'S', 60, 55, 62, 26.5, 8, 27, 28, 13.5, 12.5],
            ['Niño', 'Varón', 'M', 64, 58, 66, 28, 8.5, 29, 30, 14, 13],
            ['Niño', 'Varón', 'L', 68, 61, 70, 29.5, 9, 31, 32, 15, 14],
            ['Niño', 'Varón', 'XL', 72, 64, 74, 31, 9.5, 33, 34, 15.5, 14.5],
            ['Niño', 'Varón', 'XXL', 76, 67, 78, 32.5, 10, 35, 36, 16, 15]
        ];

        for (const row of matriz) {
            const [rango, genero, talla, busto, cintura, cadera, espalda, hombro, cortas, frente, alto_cadera, entre_busto] = row;
            await client.query(`
                INSERT INTO tabla_medidas_convencionales (
                    id_rango_edad, id_genero, id_talla_estandar,
                    busto, cintura, cadera, espalda, hombro, cortas, frente, alto_cadera, entre_busto
                ) VALUES (
                    (SELECT id_rango_edad FROM rangos_edad WHERE nombre_rango = $1),
                    (SELECT id_genero FROM generos WHERE nombre_genero = $2),
                    (SELECT id_talla_estandar FROM tallas_estandar WHERE nombre_talla = $3),
                    $4, $5, $6, $7, $8, $9, $10, $11, $12
                )
                ON CONFLICT (id_rango_edad, id_genero, id_talla_estandar) DO UPDATE SET
                    busto = EXCLUDED.busto,
                    cintura = EXCLUDED.cintura,
                    cadera = EXCLUDED.cadera,
                    espalda = EXCLUDED.espalda,
                    hombro = EXCLUDED.hombro,
                    cortas = EXCLUDED.cortas,
                    frente = EXCLUDED.frente,
                    alto_cadera = EXCLUDED.alto_cadera,
                    entre_busto = EXCLUDED.entre_busto;
            `, [rango, genero, talla, busto, cintura, cadera, espalda, hombro, cortas, frente, alto_cadera, entre_busto]);
        }

        // Colores
        await client.query(`
            INSERT INTO colores (id_color, nombre_color, codigo_hexadecimal) VALUES
                (1, 'Negro Ébano', '#0a0a0a'),
                (2, 'Blanco Marfil', '#fdfbf7'),
                (3, 'Azul Noche', '#0d1b2a'),
                (4, 'Rojo Rubí', '#9b111e'),
                (5, 'Esmeralda', '#046307'),
                (6, 'Dorado Champagne', '#fad02c'),
                (7, 'Plateado Seda', '#e0e1dd')
            ON CONFLICT DO NOTHING;
        `);

        // Tipos de prenda
        await client.query(`
            INSERT INTO tipos_prenda (id_tipo_prenda, nombre_tipo) VALUES
                (1, 'Vestido de Gala'),
                (2, 'Traje Formal'),
                (3, 'Falda'),
                (4, 'Pantalón'),
                (5, 'Blusa'),
                (6, 'Corset')
            ON CONFLICT DO NOTHING;
        `);

        // =====================================================================
        // MÓDULO 3: ALMACÉN E INSUMOS
        // =====================================================================
        console.log('🧵 Sembrando catálogos Módulo 3 (Almacén e Insumos)...');

        // Unidades de medida
        await client.query(`
            INSERT INTO unidades_medida (id_unidad_medida, abreviatura, descripcion) VALUES
                (1, 'm', 'Metros'),
                (2, 'uds', 'Unidades'),
                (3, 'yd', 'Yardas'),
                (4, 'paq', 'Paquetes'),
                (5, 'cm', 'Centímetros'),
                (6, 'car', 'Carretes')
            ON CONFLICT DO NOTHING;
        `);

        // Materiales base
        await client.query(`
            INSERT INTO materiales_base (id_material_base, nombre_material) VALUES
                (1, 'Algodón'),
                (2, 'Seda'),
                (3, 'Poliéster'),
                (4, 'Lana'),
                (5, 'Lino'),
                (6, 'Metal'),
                (7, 'Plástico')
            ON CONFLICT DO NOTHING;
        `);

        // Categorías de almacén
        await client.query(`
            INSERT INTO categorias_almacen (id_categoria, nombre_categoria) VALUES
                (1, 'Telas Principales'),
                (2, 'Botones y Broches'),
                (3, 'Hilos y Conos'),
                (4, 'Cierres y Cremalleras')
            ON CONFLICT DO NOTHING;
        `);

        // Tipos de producto
        await client.query(`
            INSERT INTO tipos_producto (id_tipo_producto, id_categoria, nombre_tipo) VALUES
                (1, 1, 'Seda Francesa'),
                (2, 1, 'Lino Italiano'),
                (3, 1, 'Raso Nupcial'),
                (4, 1, 'Terciopelo Suave'),
                (5, 1, 'Chifón / Gasa'),
                (6, 2, '4 Ojales Clásico'),
                (7, 2, 'Botón Nácar Elegante'),
                (8, 3, 'Hilo Mercerizado 100% Poliéster'),
                (9, 4, 'Cierre Invisible Oculto'),
                (10, 4, 'Cierre Metálico Reforzado')
            ON CONFLICT DO NOTHING;
        `);

        // =====================================================================
        // MÓDULO 4: KARDEX, DESCUENTOS Y PROVEEDORES
        // =====================================================================
        console.log('📊 Sembrando catálogos Módulo 4 (Kardex, Descuentos, Proveedores)...');

        // Descuentos
        await client.query(`
            INSERT INTO descuentos (id_descuento, nombre_descuento, porcentaje) VALUES
                (1, 'Descuento Temporada Promocional', 5.00),
                (2, 'Descuento Corporativo Institucional', 10.00)
            ON CONFLICT DO NOTHING;
        `);

        // Orígenes de material
        await client.query(`
            INSERT INTO origenes_material (id_origen, nombre_origen) VALUES
                (1, 'Taller'),
                (2, 'Cliente')
            ON CONFLICT DO NOTHING;
        `);

        // Tipos de movimiento
        await client.query(`
            INSERT INTO tipos_movimiento (id_tipo_movimiento, nombre_movimiento) VALUES
                (1, 'Entrada por Compra'),
                (2, 'Salida por Confección'),
                (3, 'Ajuste de Inventario'),
                (4, 'Devolución de Sobrante')
            ON CONFLICT DO NOTHING;
        `);

        // =====================================================================
        // USUARIOS BASE CON ACCESO SEGURO (Bcrypt)
        // =====================================================================
        console.log('👤 Creando usuarios base del sistema con contraseñas seguras...');
        const passwordComun = await bcrypt.hash('123456', 10);

        // Administradora
        const adminRes = await client.query(`
            INSERT INTO usuarios (id_rol, id_estado_usuario, correo_electronico, password_hash)
            VALUES (1, 1, 'admin@simonetta.com', $1)
            ON CONFLICT (correo_electronico) DO UPDATE SET password_hash = EXCLUDED.password_hash
            RETURNING id_usuario;
        `, [passwordComun]);
        const idAdmin = adminRes.rows[0].id_usuario;

        await client.query(`
            INSERT INTO datos_usuario (id_usuario, nombre, apellido, carnet_identidad, fecha_nacimiento, telefono)
            VALUES ($1, 'Simonetta', 'Valenzuela', '4891234 LP', '1985-04-12', '+591 71234567')
            ON CONFLICT DO NOTHING;
        `, [idAdmin]);

        // Secretaria
        const secRes = await client.query(`
            INSERT INTO usuarios (id_rol, id_estado_usuario, correo_electronico, password_hash)
            VALUES (2, 1, 'secretaria@simonetta.com', $1)
            ON CONFLICT (correo_electronico) DO UPDATE SET password_hash = EXCLUDED.password_hash
            RETURNING id_usuario;
        `, [passwordComun]);
        const idSec = secRes.rows[0].id_usuario;

        await client.query(`
            INSERT INTO datos_usuario (id_usuario, nombre, apellido, carnet_identidad, fecha_nacimiento, telefono)
            VALUES ($1, 'Gabriela', 'Montaño Flores', '5982341 LP', '1996-08-23', '+591 79876543')
            ON CONFLICT DO NOTHING;
        `, [idSec]);

        // Costurera
        const costRes = await client.query(`
            INSERT INTO usuarios (id_rol, id_estado_usuario, correo_electronico, password_hash)
            VALUES (3, 1, 'costurera@simonetta.com', $1)
            ON CONFLICT (correo_electronico) DO UPDATE SET password_hash = EXCLUDED.password_hash
            RETURNING id_usuario;
        `, [passwordComun]);
        const idCost = costRes.rows[0].id_usuario;

        await client.query(`
            INSERT INTO datos_usuario (id_usuario, nombre, apellido, carnet_identidad, fecha_nacimiento, telefono)
            VALUES ($1, 'Rosa', 'Mamani Quispe', '6123498 LP', '1990-11-05', '+591 76543210')
            ON CONFLICT DO NOTHING;
        `, [idCost]);

        // Cliente Persona Natural
        const cliPerRes = await client.query(`
            INSERT INTO clientes (id_tipo_cliente, id_estado_cliente, correo_electronico)
            VALUES (1, 1, 'maria.garcia@email.com')
            ON CONFLICT DO NOTHING
            RETURNING id_cliente;
        `);
        
        let idCliPer = cliPerRes.rows.length > 0 ? cliPerRes.rows[0].id_cliente : null;
        if (!idCliPer) {
            const findC = await client.query(`SELECT id_cliente FROM clientes WHERE correo_electronico = 'maria.garcia@email.com'`);
            idCliPer = findC.rows[0]?.id_cliente;
        }

        if (idCliPer) {
            await client.query(`
                INSERT INTO datos_cliente_persona (id_cliente, nombre, apellido, telefono)
                VALUES ($1, 'María', 'García López', '+591 70123456')
                ON CONFLICT DO NOTHING;
            `, [idCliPer]);
        }

        // Proveedor inicial
        await client.query(`
            INSERT INTO proveedores (nombre_empresa, nombre_contacto, telefono_contacto, direccion)
            VALUES ('Distribuidora Textil Altiplano S.R.L.', 'Lic. Marcelo Castro', '+591 2 2456789', 'Av. Buenos Aires #890, La Paz')
            ON CONFLICT DO NOTHING;
        `);

        await client.query('COMMIT');
        console.log('\n✨ ¡Siembra de base de datos completada con éxito para los 4 módulos (3FN)!\n');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error durante la siembra de datos:', error);
    } finally {
        client.release();
        await pool.end();
    }
};

sembrarDatos();
