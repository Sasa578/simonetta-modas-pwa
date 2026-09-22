const CitaModel = require('../models/CitaModel');
const db = require('../config/db');

// POST /api/citas
const crearCita = async (req, res) => {
    try {
        const { fecha_cita, detalles, motivo_cita, id_cliente: bodyIdCliente } = req.body;

        if (!fecha_cita) {
            return res.status(400).json({ error: 'La fecha de la cita es obligatoria.' });
        }

        // Resolver id_cliente: desde el body o desde el token del cliente autenticado
        let id_cliente = bodyIdCliente || req.usuario?.id_cliente;

        if (!id_cliente && req.usuario?.correo) {
            const clienteRes = await db.pool.query(
                'SELECT id_cliente FROM clientes WHERE LOWER(correo_electronico) = LOWER($1)',
                [req.usuario.correo.trim()]
            );
            if (clienteRes.rows.length > 0) {
                id_cliente = clienteRes.rows[0].id_cliente;
            }
        }

        if (!id_cliente) {
            return res.status(400).json({ error: 'Debe especificar el cliente para la cita o estar autenticado como cliente.' });
        }

        const nuevaCita = await CitaModel.crearCita({
            id_cliente: Number(id_cliente),
            fecha_cita,
            detalles: detalles || motivo_cita
        });

        // Emitir evento en tiempo real
        const io = req.app.get('io');
        if (io) io.emit('actualizacion_datos');

        res.status(201).json({ mensaje: 'Cita solicitada con éxito.', cita: nuevaCita });
    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({ error: 'Error del servidor al crear la cita.' });
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
        let id_cliente = req.usuario?.id_cliente;

        if (!id_cliente && req.usuario?.correo) {
            const clienteRes = await db.pool.query(
                'SELECT id_cliente FROM clientes WHERE LOWER(correo_electronico) = LOWER($1)',
                [req.usuario.correo.trim()]
            );
            if (clienteRes.rows.length > 0) {
                id_cliente = clienteRes.rows[0].id_cliente;
            }
        }

        if (!id_cliente) {
            return res.json([]);
        }

        const citas = await CitaModel.obtenerPorCliente(Number(id_cliente));
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener citas del cliente:', error);
        res.status(500).json({ error: 'Error del servidor al obtener citas.' });
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

        // Emitir evento en tiempo real
        const io = req.app.get('io');
        if (io) io.emit('actualizacion_datos');

        res.json(cita);
    } catch (error) {
        console.error('Error al actualizar estado de cita:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// GET /api/citas/disponibilidad — Fechas de citas activas para que los clientes consulten disponibilidad
const obtenerDisponibilidadCitas = async (req, res) => {
    try {
        const citas = await CitaModel.obtenerCitasOcupadas();
        return res.json(citas);
    } catch (error) {
        console.error('Error al obtener disponibilidad de citas:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener disponibilidad.' });
    }
};

module.exports = { crearCita, obtenerCitasPendientes, obtenerMisCitas, actualizarEstado, obtenerDisponibilidadCitas };
