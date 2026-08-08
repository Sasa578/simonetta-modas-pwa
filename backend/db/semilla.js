// Script para insertar datos de prueba en la base de datos
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const sembrarDatos = async () => {
    try {
        console.log('🌱 Sembrando datos de prueba...\n');

        // --- Crear usuarios de prueba ---
        const passwordHash = await bcrypt.hash('123456', 10);

        // Admin
        await pool.query(
            `INSERT INTO usuarios (id_rol, correo, password_hash)
             VALUES ((SELECT id_rol FROM roles WHERE nombre_rol = 'Admin'), $1, $2)
             ON CONFLICT (correo) DO NOTHING`,
            ['admin@simonetta.com', passwordHash]
        );

        // Secretaria
        await pool.query(
            `INSERT INTO usuarios (id_rol, correo, password_hash)
             VALUES ((SELECT id_rol FROM roles WHERE nombre_rol = 'Secretaria'), $1, $2)
             ON CONFLICT (correo) DO NOTHING`,
            ['secretaria@simonetta.com', passwordHash]
        );

        // Costurera
        await pool.query(
            `INSERT INTO usuarios (id_rol, correo, password_hash)
             VALUES ((SELECT id_rol FROM roles WHERE nombre_rol = 'Costurera'), $1, $2)
             ON CONFLICT (correo) DO NOTHING`,
            ['costurera@simonetta.com', passwordHash]
        );

        console.log('✅ Usuarios creados (admin, secretaria, costurera) — password: 123456');

        // --- Crear clientes de prueba ---
        const adminId = (await pool.query("SELECT id_usuario FROM usuarios WHERE correo = 'admin@simonetta.com'")).rows[0].id_usuario;

        const clientes = [
            ['María García López', '+591 77712345', adminId],
            ['Juana Pérez Mamani', '+591 77723456', adminId],
            ['Rosa Quispe Flores', '+591 77734567', adminId],
        ];

        for (const [nombre, telefono, idUsuario] of clientes) {
            await pool.query(
                `INSERT INTO clientes (nombre_completo, telefono_whatsapp, id_usuario)
                 VALUES ($1, $2, $3)
                 ON CONFLICT DO NOTHING`,
                [nombre, telefono, idUsuario]
            );
        }

        console.log('✅ 3 clientes creados');

        // --- Crear medidas de prueba ---
        const clientesIds = (await pool.query('SELECT id_cliente FROM clientes')).rows;

        for (const { id_cliente } of clientesIds) {
            // Medida reciente (hoy)
            await pool.query(
                `INSERT INTO medidas (id_cliente, cortas, cintura, frente, alto_cadera, cadera, entre_busto, busto, espalda, hombro, fecha_toma)
                 VALUES ($1, 58.5, 72.0, 42.0, 24.5, 98.0, 22.0, 94.0, 38.0, 14.5, CURRENT_DATE)`,
                [id_cliente]
            );
        }

        console.log('✅ Medidas de prueba creadas para cada cliente');

        // --- Crear inventario (Almacén) ---
        const materiales = [
            ['Gabardina azul marino', 12.5, 5, 'metros'],
            ['Lino blanco', 8, 3, 'metros'],
            ['Hilo dorado (carrete)', 1, 4, 'unidades'],
            ['Cierre invisible 50cm', 15, 5, 'unidades'],
        ];

        for (const [nombre, cantidad, minimo, unidad] of materiales) {
            await pool.query(
                `INSERT INTO almacen (nombre_material, cantidad_actual, stock_minimo, unidad_medida)
                 VALUES ($1, $2, $3, $4)`,
                [nombre, cantidad, minimo, unidad]
            );
        }
        console.log('✅ Inventario inicial creado (almacén)');

        // --- Crear pedidos de prueba ---
        // Obtener ids de materiales
        const idGabardina = (await pool.query("SELECT id_material FROM almacen WHERE nombre_material = 'Gabardina azul marino'")).rows[0].id_material;
        const idLino = (await pool.query("SELECT id_material FROM almacen WHERE nombre_material = 'Lino blanco'")).rows[0].id_material;

        // Pedido 1: En Corte (Gabardina)
        const pedido1 = await pool.query(
            `INSERT INTO pedidos (id_cliente, fecha_pedido, fecha_entrega, costo_total, adelanto, saldo, estado)
             VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '10 days', 500.00, 200.00, 300.00, 'Corte') RETURNING id_pedido`,
            [clientesIds[0].id_cliente]
        );
        await pool.query(
            `INSERT INTO detalle_pedido_material (id_pedido, id_material, descripcion_tela, origen_material, cantidad_metros)
             VALUES ($1, $2, 'Vestido de novia - Gabardina', 'Taller', 2.5)`,
            [pedido1.rows[0].id_pedido, idGabardina]
        );

        // Pedido 2: En Confección (Lino)
        const pedido2 = await pool.query(
            `INSERT INTO pedidos (id_cliente, fecha_pedido, fecha_entrega, costo_total, adelanto, saldo, estado)
             VALUES ($1, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', 800.00, 400.00, 400.00, 'Armado') RETURNING id_pedido`,
            [clientesIds[1].id_cliente]
        );
        await pool.query(
            `INSERT INTO detalle_pedido_material (id_pedido, id_material, descripcion_tela, origen_material, cantidad_metros)
             VALUES ($1, $2, 'Terno ejecutivo - Lino', 'Taller', 3.0)`,
            [pedido2.rows[0].id_pedido, idLino]
        );

        // Pedido 3: Terminado (Tela del cliente)
        const pedido3 = await pool.query(
            `INSERT INTO pedidos (id_cliente, fecha_pedido, fecha_entrega, costo_total, adelanto, saldo, estado)
             VALUES ($1, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '1 day', 200.00, 100.00, 100.00, 'Terminado') RETURNING id_pedido`,
            [clientesIds[2].id_cliente]
        );
        await pool.query(
            `INSERT INTO detalle_pedido_material (id_pedido, id_material, descripcion_tela, origen_material, cantidad_metros)
             VALUES ($1, NULL, 'Pollera - Seda del cliente', 'Cliente', 4.0)`,
            [pedido3.rows[0].id_pedido]
        );

        console.log('✅ Pedidos de prueba creados');
        console.log('\n🎉 Datos de prueba listos.\n');

    } catch (error) {
        console.error('❌ Error sembrando datos:', error.message);
    } finally {
        await pool.end();
    }
};

sembrarDatos();
