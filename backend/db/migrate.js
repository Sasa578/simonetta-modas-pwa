const { pool } = require('../config/db');

async function migrate() {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');

        console.log('--- Iniciando Migración ---');

        // 1. Añadir fecha_prueba a pedidos
        console.log('1. Añadiendo fecha_prueba a la tabla pedidos...');
        await cliente.query(`
            ALTER TABLE pedidos
            ADD COLUMN IF NOT EXISTS fecha_prueba DATE;
        `);
        console.log('✔ Columna fecha_prueba añadida (o ya existía).');

        // 2. Crear tabla citas
        console.log('2. Creando tabla citas...');
        await cliente.query(`
            CREATE TABLE IF NOT EXISTS citas (
                id_cita SERIAL PRIMARY KEY,
                id_cliente INTEGER NOT NULL,
                fecha_cita DATE NOT NULL,
                estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
                detalles TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_cita_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
            );
        `);
        console.log('✔ Tabla citas creada (o ya existía).');

        // 3. Crear índice para citas
        console.log('3. Creando índices...');
        await cliente.query(`
            CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
            CREATE INDEX IF NOT EXISTS idx_citas_id_cliente ON citas(id_cliente);
        `);
        console.log('✔ Índices creados.');

        await cliente.query('COMMIT');
        console.log('--- Migración Completada Exitosamente ---');

    } catch (error) {
        await cliente.query('ROLLBACK');
        console.error('❌ Error en la migración. Haciendo ROLLBACK:', error);
    } finally {
        cliente.release();
        process.exit();
    }
}

migrate();
