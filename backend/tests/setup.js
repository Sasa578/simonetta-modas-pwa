
require('dotenv').config();
const db = require('../config/db');

afterAll(async () => {
    // Cerrar la conexión a la base de datos después de todas las pruebas
    if (db.pool) {
        await db.pool.end();
    }
});
