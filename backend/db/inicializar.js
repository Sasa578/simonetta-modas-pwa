// Script para ejecutar la inicialización de la base de datos
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const inicializarBD = async () => {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    try {
        await pool.query(sql);
        console.log('✅ Base de datos inicializada correctamente.');
    } catch (error) {
        console.error('❌ Error al inicializar la BD:', error.message);
        console.log('💡 Asegúrate de que PostgreSQL esté corriendo y la BD `simonetta_db` exista.');
    } finally {
        await pool.end();
    }
};

inicializarBD();
