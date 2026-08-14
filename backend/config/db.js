const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'simonetta_db',
    password: process.env.DB_PASSWORD || '0986067862',
    port: process.env.DB_PORT || 5432
});

pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
    process.exit(-1);
});

module.exports = {
    query: (texto, params) => pool.query(texto, params),
    pool,
};
