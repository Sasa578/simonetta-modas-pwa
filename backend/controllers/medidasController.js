const MedidaModel = require('../models/MedidaModel');

// POST /api/medidas — Registrar medidas de un cliente
const crearMedida = async (req, res) => {
    const datos = req.body;

    if (datos.fecha_toma) { const hoy = new Date(); hoy.setHours(0,0,0,0); const fechaToma = new Date(datos.fecha_toma + 'T00:00:00'); if (fechaToma > hoy) return res.status(400).json({ error: 'La fecha de toma no puede ser a futuro.' }); } if (!datos.id_cliente) {
        return res.status(400).json({ error: 'El ID del cliente es obligatorio.' });
    }

    try {
        const existe = await MedidaModel.clienteExiste(datos.id_cliente);
        if (!existe) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        const medida = await MedidaModel.crear(datos); const io = req.app.get('io'); if (io) io.emit('actualizacion_datos');

        return res.status(201).json({
            mensaje: 'Medida registrada exitosamente.',
            medida,
            medidas_caducadas: MedidaModel.estaCaducada(medida.fecha_toma),
        });
    } catch (error) {
        console.error('Error al crear medida:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// GET /api/medidas/cliente/:id_cliente — Obtener medidas de un cliente
const obtenerMedidasPorCliente = async (req, res) => {
    try {
        const medidas = await MedidaModel.obtenerPorCliente(req.params.id_cliente);
        return res.json(medidas);
    } catch (error) {
        console.error('Error al obtener medidas:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    crearMedida,
    obtenerMedidasPorCliente,
};
