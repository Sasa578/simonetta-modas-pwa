const NotaVentaModel = require('../models/NotaVentaModel');

const obtenerNotasVenta = async (req, res) => {
    try {
        const notas = await NotaVentaModel.obtenerNotasVenta();
        return res.json(notas);
    } catch (error) {
        console.error('Error al obtener notas de venta:', error);
        return res.status(500).json({ error: 'Error interno al consultar notas de venta.' });
    }
};

const obtenerNotaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const nota = await NotaVentaModel.obtenerNotaPorId(Number(id));
        if (!nota) {
            return res.status(404).json({ error: 'Nota de venta no encontrada.' });
        }
        return res.json(nota);
    } catch (error) {
        console.error('Error al obtener nota de venta:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

const obtenerNotaPorPedido = async (req, res) => {
    try {
        const { id_pedido } = req.params;
        const nota = await NotaVentaModel.obtenerNotaPorPedido(Number(id_pedido));
        if (!nota) {
            return res.status(404).json({ error: 'No existe nota de venta emitida para este pedido.' });
        }
        return res.json(nota);
    } catch (error) {
        console.error('Error al obtener nota por pedido:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

const generarNotaVenta = async (req, res) => {
    try {
        const { id_pedido, id_descuento } = req.body;
        if (!id_pedido) {
            return res.status(400).json({ error: 'El ID de pedido es obligatorio para emitir la nota de venta.' });
        }

        const nota = await NotaVentaModel.generarNotaVenta({
            id_pedido: Number(id_pedido),
            id_descuento: id_descuento ? Number(id_descuento) : null
        });

        const io = req.app.get('io');
        if (io) io.emit('actualizacion_datos');

        return res.status(201).json({
            mensaje: 'Nota de venta generada exitosamente.',
            nota
        });
    } catch (error) {
        console.error('Error al generar nota de venta:', error);
        return res.status(400).json({ error: error.message || 'Error al emitir la nota de venta.' });
    }
};

const obtenerDescuentos = async (req, res) => {
    try {
        const descuentos = await NotaVentaModel.obtenerDescuentos();
        return res.json(descuentos);
    } catch (error) {
        console.error('Error al obtener catálogo de descuentos:', error);
        return res.status(500).json({ error: 'Error al obtener catálogo de descuentos.' });
    }
};

module.exports = {
    obtenerNotasVenta,
    obtenerNotaPorId,
    obtenerNotaPorPedido,
    generarNotaVenta,
    obtenerDescuentos
};
