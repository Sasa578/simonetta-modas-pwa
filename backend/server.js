const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const medidasRoutes = require('./routes/medidasRoutes');

const app = express();
const PUERTO = process.env.PUERTO || 3000;

// --- Middlewares globales ---
app.use(cors());
app.use(express.json());

// --- Rutas ---
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/medidas', medidasRoutes);

// --- Ruta de salud ---
app.get('/api/salud', (req, res) => {
    res.json({ estado: 'ok', servicio: 'Simonetta Modas API', version: '1.0.0' });
});

// --- Iniciar servidor ---
app.listen(PUERTO, () => {
    console.log(`🧵 Simonetta Modas API corriendo en http://localhost:${PUERTO}`);
});

module.exports = app;
