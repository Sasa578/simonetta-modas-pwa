const AlmacenModel = require('../models/AlmacenModel');

// GET /api/almacen
const obtenerAlmacen = async (req, res) => {
    try {
        const almacen = await AlmacenModel.obtenerInventario();
        // Add "alerta" boolean for convenience on frontend
        const conAlerta = almacen.map(item => ({
            ...item,
            alerta: parseFloat(item.stock) <= parseFloat(item.minimo)
        }));
        res.json(conAlerta);
    } catch (error) {
        console.error('Error al obtener almacén:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { obtenerAlmacen };
