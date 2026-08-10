const CitaModel = require('../models/CitaModel');
const db = require('../config/db');

// POST /api/citas
const crearCita = async (req, res) => {
    try {
        const { fecha_cita, detalles } = req.body;
        const { id_usuario } = req.usuario; // Extraído del token JWT

        if (!fecha_cita) {
            return res.status(400).json({ error: 'La fecha de la cita es obligatoria.' });
        }

        // Buscar el id_cliente asociado al usuario actual
        const clienteRes = await db.pool.query('SELECT id_cliente FROM clientes WHERE id_usuario = $1', [id_usuario]);
        if (clienteRes.rows.length === 0) {
            return res.status(403).json({ error: 'Usuario no registrado como cliente.' });
        }
        
        const id_cliente = clienteRes.rows[0].id_cliente;

        const nuevaCita = await CitaModel.crearCita({
            id_cliente,
            fecha_cita,
            detalles
        });

        res.status(201).json({ mensaje: 'Cita solicitada con éxito.', cita: nuevaCita });
    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// GET /api/citas/pendientes (Secretaría/Admin)
const obtenerCitasPendientes = async (req, res) => {
    try {
        const citas = await CitaModel.obtenerPendientes();
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener citas pendientes:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// GET /api/citas/mis-citas (Cliente)
const obtenerMisCitas = async (req, res) => {
    try {
        const { id_usuario } = req.usuario;
        
        const clienteRes = await db.pool.query('SELECT id_cliente FROM clientes WHERE id_usuario = $1', [id_usuario]);
        if (clienteRes.rows.length === 0) {
            return res.json([]);
        }
        const id_cliente = clienteRes.rows[0].id_cliente;

        const citas = await CitaModel.obtenerPorCliente(id_cliente);
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener citas del cliente:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// PUT /api/citas/:id/estado
const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        const cita = await CitaModel.actualizarEstado(id, estado);
        if (!cita) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }

        res.json(cita);
    } catch (error) {
        console.error('Error al actualizar estado de cita:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

module.exports = { crearCita, obtenerCitasPendientes, obtenerMisCitas, actualizarEstado };
