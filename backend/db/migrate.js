const { pool } = require('../config/db');

async function migrate() {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');

        console.log('--- Iniciando Migración Completa de Base de Datos ---');

        console.log('1. Verificando tabla pedidos (fecha_prueba)...');
        await cliente.query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_prueba DATE;");
        console.log('✔ Columna fecha_prueba en pedidos asegurada.');

        console.log('2. Verificando tabla usuarios (nombre_completo, carnet_identidad, telefono, debe_cambiar_password, fecha_registro)...');
        await cliente.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(200), ADD COLUMN IF NOT EXISTS carnet_identidad VARCHAR(50), ADD COLUMN IF NOT EXISTS telefono VARCHAR(50), ADD COLUMN IF NOT EXISTS debe_cambiar_password BOOLEAN DEFAULT false, ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
        console.log('✔ Columnas extendidas en usuarios aseguradas.');

        console.log('3. Verificando tabla clientes (carnet_identidad, correo)...');
        await cliente.query("ALTER TABLE clientes ADD COLUMN IF NOT EXISTS carnet_identidad VARCHAR(50), ADD COLUMN IF NOT EXISTS correo VARCHAR(150);");
        console.log('✔ Columnas extendidas en clientes aseguradas.');

        console.log('4. Verificando tabla citas...');
        await cliente.query("CREATE TABLE IF NOT EXISTS citas (id_cita SERIAL PRIMARY KEY, id_cliente INTEGER NOT NULL, fecha_cita DATE NOT NULL, estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', detalles TEXT, fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_cita_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE);");
        console.log('✔ Tabla citas creada (o ya existía).');

        console.log('5. Verificando índices...');
        await cliente.query("CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado); CREATE INDEX IF NOT EXISTS idx_citas_id_cliente ON citas(id_cliente);");
        console.log('✔ Índices comprobados.');

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
