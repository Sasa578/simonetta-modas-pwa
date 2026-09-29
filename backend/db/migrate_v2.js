const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function migrateV2() {
    console.log('========================================================');
    console.log('  MIGRACIÓN A ESQUEMA SIMONETTA MODAS V2');
    console.log('========================================================\n');

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('1. Eliminando tablas anteriores en cascada...');
        await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await client.query('GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;');
        console.log('   ✅ Esquema public reiniciado.');

        console.log('2. Ejecutando DDL de SimonettaModasV2.sql...');
        const sqlPath = path.join(__dirname, '../../SimonettaModasV2.sql');
        const ddl = fs.readFileSync(sqlPath, 'utf8');
        await client.query(ddl);

        // Añadir columnas de compatibilidad esenciales
        await client.query(`
            ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS debe_cambiar_password boolean DEFAULT false;
            ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS id_costurera int REFERENCES usuarios(id_usuario);
        `);
        console.log('   ✅ Tablas y relaciones creadas exitosamente.');

        console.log('3. Poblando catálogos base...');

        // Estados Usuario
        await client.query(`
            INSERT INTO estados_usuario (nombre_estado) VALUES 
            ('Activo'), ('Inactivo'), ('Bloqueado');
        `);

        // Estados Cliente
        await client.query(`
            INSERT INTO estados_cliente (nombre_estado) VALUES 
            ('Activo'), ('Inactivo'), ('Potencial');
        `);

        // Roles
        await client.query(`
            INSERT INTO roles (nombre_rol) VALUES 
            ('Admin'), ('Secretaria'), ('Costurera'), ('Cliente');
        `);

        // Descripciones Rol
        await client.query(`
            INSERT INTO descripciones_rol (id_rol, descripcion) VALUES
            (1, 'Administrador del sistema con control total'),
            (2, 'Secretaria / mostrador y atención al cliente'),
            (3, 'Costurera / confeccionista de taller'),
            (4, 'Cliente final del taller Simonetta Modas');
        `);

        // Tipo Cliente
        await client.query(`
            INSERT INTO tipo_cliente (nombre_tipo) VALUES 
            ('Persona Natural'), ('Institucional / Empresa');
        `);

        // Descripciones Tipo Cliente
        await client.query(`
            INSERT INTO descripciones_tipo_cliente (id_tipo_cliente, descripcion) VALUES
            (1, 'Cliente individual / particular'),
            (2, 'Colegios, empresas o instituciones');
        `);

        // Estados Pedido
        await client.query(`
            INSERT INTO estados_pedido (nombre_estado) VALUES 
            ('Pendiente'), ('En Confección'), ('Prueba'), ('Terminado'), ('Entregado'), ('Cancelado');
        `);

        // Estados Pago
        await client.query(`
            INSERT INTO estados_pago (nombre_estado) VALUES 
            ('Pendiente'), ('Parcial'), ('Pagado Total'), ('Anulado');
        `);

        // Metodos Pago
        await client.query(`
            INSERT INTO metodos_pago (nombre_metodo) VALUES 
            ('Efectivo'), ('QR / Transferencia');
        `);

        // Estados Cita
        await client.query(`
            INSERT INTO estados_cita (nombre_estado) VALUES 
            ('Programada'), ('Completada'), ('Cancelada');
        `);

        // Unidades de Medida
        await client.query(`
            INSERT INTO unidades_medida (abreviatura, descripcion) VALUES
            ('m', 'Metros'),
            ('uds', 'Unidades'),
            ('yd', 'Yardas'),
            ('paq', 'Paquetes'),
            ('cm', 'Centímetros'),
            ('car', 'Carretes');
        `);

        // Categorias Almacen
        await client.query(`
            INSERT INTO categorias_almacen (nombre_categoria) VALUES
            ('Telas'),
            ('Botones'),
            ('Hilos'),
            ('Cierres'),
            ('Forros y Entretelas'),
            ('Cintas y Adornos');
        `);

        // Tipos Producto
        await client.query(`
            INSERT INTO tipos_producto (id_categoria, nombre_tipo) VALUES
            (1, 'Seda Francesa'),
            (1, 'Lino Italiano'),
            (1, 'Raso Nupcial'),
            (1, 'Terciopelo Suave'),
            (1, 'Chifón / Gasa'),
            (2, '4 Ojales Clásico'),
            (2, 'Botón Nácar Elegante'),
            (3, 'Hilo Mercerizado 100% Poliéster'),
            (4, 'Cierre Invisible Oculto'),
            (4, 'Cierre Metálico Reforzado');
        `);

        // Materiales Base
        await client.query(`
            INSERT INTO materiales_base (nombre_material) VALUES
            ('Algodón'), ('Seda'), ('Poliéster'), ('Lana'), ('Lino'), ('Metal'), ('Plástico');
        `);

        // Tipos Movimiento
        await client.query(`
            INSERT INTO tipos_movimiento (nombre_movimiento) VALUES
            ('Entrada por Compra'),
            ('Entrada de Material Cliente'),
            ('Salida a Producción'),
            ('Ajuste de Inventario'),
            ('Merma / Descarte');
        `);

        // Orígenes Material
        await client.query(`
            INSERT INTO origenes_material (nombre_origen) VALUES
            ('Taller'), ('Cliente');
        `);

        // Descuentos
        await client.query(`
            INSERT INTO descuentos (id_tipo_cliente, nombre_descuento, porcentaje) VALUES
            (1, 'Sin Descuento', 0.00),
            (1, 'Cliente Frecuente', 5.00),
            (2, 'Descuento Institucional', 10.00);
        `);

        // Catálogo Base
        await client.query(`
            INSERT INTO catalogo (nombre_catalogo, url_imagen_catalogo) VALUES
            ('Colección Alta Costura 2026', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446'),
            ('Línea Ceremonial Simonetta', 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67');
        `);

        // Tipos Prenda (10 tipos establecidos para selección)
        await client.query(`
            INSERT INTO tipos_prenda (nombre_tipo) VALUES
            ('Vestido de Gala / Noche'),
            ('Vestido de Novia'),
            ('Vestido de 15 Años'),
            ('Traje Sastre Dama'),
            ('Traje Sastre Caballero'),
            ('Corset de Alta Costura'),
            ('Pollera Tradicional'),
            ('Blusa de Seda / Fiesta'),
            ('Falda Plisada / Tubo'),
            ('Abrigo / Chaqueta de Paño');
        `);

        // 30 Colores seleccionados para el panal de abeja
        await client.query(`
            INSERT INTO colores (nombre_color, codigo_hexadecimal) VALUES
            ('Negro Azabache', '#111111'),
            ('Blanco Puro', '#FFFFFF'),
            ('Blanco Marfil', '#FFFFF0'),
            ('Champán', '#F7E7CE'),
            ('Dorado Metálico', '#D4AF37'),
            ('Plateado Seda', '#C0C0C0'),
            ('Bronce Cobrizo', '#CD7F32'),
            ('Rojo Pasión', '#D00000'),
            ('Rojo Carmesí', '#990000'),
            ('Vino Tinto / Borgoña', '#6A0D25'),
            ('Rosa Pastel', '#F8BBD0'),
            ('Rosa Palo / Nude', '#D8A47F'),
            ('Fucsia Real', '#C2185B'),
            ('Coral Vivo', '#FF6F61'),
            ('Terracota', '#C86446'),
            ('Naranja Ocre', '#D97706'),
            ('Amarillo Oro', '#FBBF24'),
            ('Verde Esmeralda', '#059669'),
            ('Verde Jade', '#00A86B'),
            ('Verde Oliva', '#556B2F'),
            ('Verde Menta', '#A7F3D0'),
            ('Verde Salvia', '#9CAF88'),
            ('Azul Marino Profundo', '#0F172A'),
            ('Azul Rey / Cobalto', '#1D4ED8'),
            ('Azul Petróleo', '#0E7490'),
            ('Azul Celeste Cielo', '#38BDF8'),
            ('Turquesa Intenso', '#06B6D4'),
            ('Morado Real', '#6B21A8'),
            ('Lavanda Lila', '#C084FC'),
            ('Violeta Profundo', '#4C1D95');
        `);
        console.log('   ✅ 30 colores y 10 tipos de prenda insertados.');

        console.log('4. Creando usuarios iniciales...');
        const passHash = await bcrypt.hash('0986067862', 10);

        // Admin 1 (Samuel Altamirano)
        const u1 = await client.query(`
            INSERT INTO usuarios (id_rol, id_estado_usuario, correo_electronico, password_hash, debe_cambiar_password)
            VALUES (1, 1, 'samuelaltamiranoch@gmail.com', $1, false)
            RETURNING id_usuario;
        `, [passHash]);
        await client.query(`
            INSERT INTO datos_usuario (id_usuario, nombre, apellido, carnet_identidad, fecha_nacimiento, telefono, fecha_registro)
            VALUES ($1, 'Samuel', 'Altamirano', '12345678 LP', '1995-01-01', '+591 70000000', CURRENT_TIMESTAMP);
        `, [u1.rows[0].id_usuario]);

        // Admin 2 (Admin de respaldo)
        const uAdmin = await client.query(`
            INSERT INTO usuarios (id_rol, id_estado_usuario, correo_electronico, password_hash, debe_cambiar_password)
            VALUES (1, 1, 'admin@simonetta.com', $1, false)
            RETURNING id_usuario;
        `, [passHash]);
        await client.query(`
            INSERT INTO datos_usuario (id_usuario, nombre, apellido, carnet_identidad, fecha_nacimiento, telefono, fecha_registro)
            VALUES ($1, 'Carlos', 'Mendoza', '1234567 LP', '1990-05-15', '+591 70011223', CURRENT_TIMESTAMP);
        `, [uAdmin.rows[0].id_usuario]);

        // Secretaria
        const uSec = await client.query(`
            INSERT INTO usuarios (id_rol, id_estado_usuario, correo_electronico, password_hash, debe_cambiar_password)
            VALUES (2, 1, 'secretaria@simonetta.com', $1, false)
            RETURNING id_usuario;
        `, [passHash]);
        await client.query(`
            INSERT INTO datos_usuario (id_usuario, nombre, apellido, carnet_identidad, fecha_nacimiento, telefono, fecha_registro)
            VALUES ($1, 'Patricia', 'Gómez', '2345678 LP', '1992-08-20', '+591 70022334', CURRENT_TIMESTAMP);
        `, [uSec.rows[0].id_usuario]);

        // Costurera
        const uCost = await client.query(`
            INSERT INTO usuarios (id_rol, id_estado_usuario, correo_electronico, password_hash, debe_cambiar_password)
            VALUES (3, 1, 'costurera@simonetta.com', $1, false)
            RETURNING id_usuario;
        `, [passHash]);
        await client.query(`
            INSERT INTO datos_usuario (id_usuario, nombre, apellido, carnet_identidad, fecha_nacimiento, telefono, fecha_registro)
            VALUES ($1, 'Elena', 'Rojas', '3456789 LP', '1988-12-10', '+591 70033445', CURRENT_TIMESTAMP);
        `, [uCost.rows[0].id_usuario]);

        console.log('5. Creando clientes de prueba...');
        // Cliente 1 (Maria Garcia con correo samuelaltamiranoch@gmail.com para pruebas de correo)
        const c1 = await client.query(`
            INSERT INTO clientes (id_tipo_cliente, id_rol, id_estado_cliente, correo_electronico, password_hash, fecha_registro)
            VALUES (1, 4, 1, 'samuelaltamiranoch@gmail.com', $1, CURRENT_TIMESTAMP)
            RETURNING id_cliente;
        `, [passHash]);
        await client.query(`
            INSERT INTO datos_cliente_persona (id_cliente, nombre, apellido, telefono, fecha_nacimiento)
            VALUES ($1, 'María', 'García López', '+591 77712345', '1994-08-20');
        `, [c1.rows[0].id_cliente]);

        // Cliente 2 (Juana Perez)
        const c2 = await client.query(`
            INSERT INTO clientes (id_tipo_cliente, id_rol, id_estado_cliente, correo_electronico, password_hash, fecha_registro)
            VALUES (1, 4, 1, 'juana.perez@email.com', $1, CURRENT_TIMESTAMP)
            RETURNING id_cliente;
        `, [passHash]);
        await client.query(`
            INSERT INTO datos_cliente_persona (id_cliente, nombre, apellido, telefono, fecha_nacimiento)
            VALUES ($1, 'Juana', 'Pérez Mamani', '+591 77723456', '1995-03-12');
        `, [c2.rows[0].id_cliente]);

        // Cliente 3 (Institucional)
        const c3 = await client.query(`
            INSERT INTO clientes (id_tipo_cliente, id_rol, id_estado_cliente, correo_electronico, password_hash, fecha_registro)
            VALUES (2, 4, 1, 'contacto@colegiofrances.edu.bo', $1, CURRENT_TIMESTAMP)
            RETURNING id_cliente;
        `, [passHash]);
        await client.query(`
            INSERT INTO datos_cliente_institucional (id_cliente, razon_social, nit, nombre_contacto, telefono_contacto)
            VALUES ($1, 'Colegio Francés La Paz S.R.L.', '1023948571', 'Lic. Fernando Morales', '+591 76543210');
        `, [c3.rows[0].id_cliente]);

        console.log('6. Creando productos de almacén y detalles técnicos unificados...');
        // Proveedor demo
        const prov = await client.query(`
            INSERT INTO proveedores (nombre_empresa, nombre_contacto, telefono_contacto, direccion)
            VALUES ('Importadora Textil Andina', 'Roberto Suárez', '+591 71234567', 'Av. Buenos Aires #1240')
            RETURNING id_proveedor;
        `);
        const idProv = prov.rows[0].id_proveedor;

        // Insumo 1: Seda Francesa Azul Rey (color 24)
        const p1 = await client.query(`
            INSERT INTO productos_almacen (id_tipo_producto, id_unidad_medida, id_color, id_material_base, nombre_articulo, cantidad_stock, stock_minimo)
            VALUES (1, 1, 24, 2, 'Seda Francesa Azul Rey', 25.50, 10.00)
            RETURNING id_producto;
        `);
        await client.query(`
            INSERT INTO detalles_tecnicos_producto (id_producto, caracteristica_principal, caracteristica_secundaria, observaciones_tecnicas)
            VALUES ($1, 'Textura Lisa Satinada', 'Alta densidad / Caída Pesada', 'Apto para vestidos de gala y faldas de fiesta');
        `, [p1.rows[0].id_producto]);

        // Insumo 2: Botón Nácar Elegante Dorado (color 5)
        const p2 = await client.query(`
            INSERT INTO productos_almacen (id_tipo_producto, id_unidad_medida, id_color, id_material_base, nombre_articulo, cantidad_stock, stock_minimo)
            VALUES (7, 2, 5, 6, 'Botón Nácar Dorado 24L', 150, 40)
            RETURNING id_producto;
        `);
        await client.query(`
            INSERT INTO detalles_tecnicos_producto (id_producto, caracteristica_principal, caracteristica_secundaria, observaciones_tecnicas)
            VALUES ($1, '4 Ojales Sastrería', 'Diámetro 15mm (24L)', 'Borde biselado de nácar');
        `, [p2.rows[0].id_producto]);

        // Insumo 3: Hilo Coselotodo Negro (color 1)
        const p3 = await client.query(`
            INSERT INTO productos_almacen (id_tipo_producto, id_unidad_medida, id_color, id_material_base, nombre_articulo, cantidad_stock, stock_minimo)
            VALUES (8, 6, 1, 3, 'Hilo Mercerizado Negro', 45, 15)
            RETURNING id_producto;
        `);
        await client.query(`
            INSERT INTO detalles_tecnicos_producto (id_producto, caracteristica_principal, caracteristica_secundaria, observaciones_tecnicas)
            VALUES ($1, '100% Poliéster Mercerizado', 'Grosor No. 40', 'Alta resistencia para costura invisible');
        `, [p3.rows[0].id_producto]);

        // Insumo 4: Cierre Invisible Metálico
        const p4 = await client.query(`
            INSERT INTO productos_almacen (id_tipo_producto, id_unidad_medida, id_color, id_material_base, nombre_articulo, cantidad_stock, stock_minimo)
            VALUES (9, 2, 1, 6, 'Cierre Invisible Oculto 50cm', 30, 10)
            RETURNING id_producto;
        `);
        await client.query(`
            INSERT INTO detalles_tecnicos_producto (id_producto, caracteristica_principal, caracteristica_secundaria, observaciones_tecnicas)
            VALUES ($1, 'Cremallera Invisible', 'Longitud 50 cm', 'Deslizador autoblocante');
        `, [p4.rows[0].id_producto]);

        // Registrar entrada inicial en kardex
        await client.query(`
            INSERT INTO movimientos_almacen (id_producto, id_proveedor, id_tipo_movimiento, id_origen, cantidad, fecha_movimiento)
            VALUES 
            ($1, $5, 1, 1, 25.50, CURRENT_TIMESTAMP),
            ($2, $5, 1, 1, 150, CURRENT_TIMESTAMP),
            ($3, $5, 1, 1, 45, CURRENT_TIMESTAMP),
            ($4, $5, 1, 1, 30, CURRENT_TIMESTAMP);
        `, [p1.rows[0].id_producto, p2.rows[0].id_producto, p3.rows[0].id_producto, p4.rows[0].id_producto, idProv]);

        console.log('7. Creando pedidos de demostración y notas de venta...');
        // Pedido 1: María García - Vestido de Gala / Noche (tipo_prenda 1, color 24 Azul Rey)
        const ped1 = await client.query(`
            INSERT INTO pedidos (id_cliente, id_costurera, id_estado_pedido, fecha_inicio, fecha_prueba, fecha_entrega, costo_total)
            VALUES ($1, $2, 4, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '3 days', 2400.00)
            RETURNING id_pedido;
        `, [c1.rows[0].id_cliente, uCost.rows[0].id_usuario]);
        const idPed1 = ped1.rows[0].id_pedido;

        const pren1 = await client.query(`
            INSERT INTO prendas (id_catalogo, id_tipo_prenda, id_color)
            VALUES (1, 1, 24)
            RETURNING id_prenda;
        `);
        const idPren1 = pren1.rows[0].id_prenda;

        const det1 = await client.query(`
            INSERT INTO detalle_pedido (id_pedido, id_prenda, cantidad, subtotal)
            VALUES ($1, $2, 1, 2400.00)
            RETURNING id_detalle;
        `, [idPed1, idPren1]);
        const idDet1 = det1.rows[0].id_detalle;

        await client.query(`
            INSERT INTO descripciones_prenda (id_prenda, descripcion_detallada)
            VALUES ($1, 'Seda Francesa Azul Rey con forro suave antialérgico');
        `, [idPren1]);

        await client.query(`
            INSERT INTO notas_diseno_detalle (id_detalle, notas_diseno)
            VALUES ($1, 'Escote en V profundo, espalda descubierta y falda con corte sirena');
        `, [idDet1]);

        await client.query(`
            INSERT INTO medidas_convencionales (id_detalle, talla)
            VALUES ($1, 'M');
        `, [idDet1]);

        await client.query(`
            INSERT INTO medidas_anatomicas (id_detalle, busto, cintura, cadera, espalda, hombro, cortas)
            VALUES ($1, 92.5, 68.0, 96.0, 38.0, 12.5, 42.0);
        `, [idDet1]);

        // Pago y Nota de Venta
        await client.query(`
            INSERT INTO pagos (id_pedido, id_estado_pago, id_metodo_pago, monto_pago, fecha_pago)
            VALUES ($1, 2, 2, 2000.00, CURRENT_TIMESTAMP - INTERVAL '5 days');
        `, [idPed1]);

        await client.query(`
            INSERT INTO notas_venta (id_pedido, id_descuento, numero_nota, fecha_emision, subtotal, total_final, estado_envio_correo)
            VALUES ($1, 2, 'NV-2026-00001', CURRENT_TIMESTAMP, 2400.00, 2280.00, 'Generada');
        `, [idPed1]);

        await client.query('COMMIT');
        console.log('\n========================================================');
        console.log('  ✅ MIGRACIÓN A V2 COMPLETADA EXITOSAMENTE');
        console.log('========================================================\n');
        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error durante la migración a V2:', err);
        process.exit(1);
    } finally {
        client.release();
    }
}

migrateV2();
