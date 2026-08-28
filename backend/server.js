const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const medidasRoutes = require('./routes/medidasRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');
const almacenRoutes = require('./routes/almacenRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const citasRoutes = require('./routes/citasRoutes');
const pruebasRoutes = require('./routes/pruebasRoutes');

const app = express();
const PUERTO = process.env.PUERTO || 3000;

// --- Middlewares globales ---
app.use(cors());
app.use(express.json());

// --- Rutas ---
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/medidas', medidasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/almacen', almacenRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/pruebas', pruebasRoutes);

// --- Ruta de salud ---
app.get('/api/salud', (req, res) => {
    res.json({ estado: 'ok', servicio: 'Simonetta Modas API', version: '1.0.0' });
});

// --- Iniciar servidor con Socket.io ---
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Guardar io en app para acceder desde controladores via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
    console.log(\🔌 Cliente conectado (Socket ID: \)\);
    socket.on('disconnect', () => {
        console.log(\🔌 Cliente desconectado (Socket ID: \)\);
    });
});

server.listen(PUERTO, () => {
    console.log(\👗 Simonetta Modas API corriendo en http://localhost:\ (Con WebSockets)\);
});

module.exports = { app, server, io };
