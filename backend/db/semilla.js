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
        console.log('\n🎉 Datos de prueba listos.\n');

    } catch (error) {
        console.error('❌ Error sembrando datos:', error.message);
    } finally {
        await pool.end();
    }
};

sembrarDatos();
