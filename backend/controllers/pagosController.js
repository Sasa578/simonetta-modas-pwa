const PagoModel = require('../models/PagoModel');

const registrarPago = async (req, res) => {
    try {
        const { id_pedido, monto_pago, id_metodo_pago, id_estado_pago } = req.body;

        if (!id_pedido) {
            return res.status(400).json({ error: 'El ID de pedido es obligatorio.' });
        }

        const monto = parseFloat(monto_pago);
        if (isNaN(monto) || monto <= 0) {
            return res.status(400).json({ error: 'El monto del pago debe ser un valor mayor a 0.' });
        }

        const nuevoPago = await PagoModel.registrarPago({
            id_pedido: Number(id_pedido),
            monto_pago: monto,
            id_metodo_pago: id_metodo_pago ? Number(id_metodo_pago) : 1,
            id_estado_pago: id_estado_pago ? Number(id_estado_pago) : 2
        });

        const io = req.app.get('io');
        if (io) io.emit('actualizacion_datos');

        return res.status(201).json({
            mensaje: 'Pago registrado exitosamente.',
            pago: nuevoPago
        });
    } catch (error) {
        console.error('Error al registrar pago:', error);
        return res.status(500).json({ error: 'Error interno al registrar el pago.' });
    }
};

const obtenerPagosPorPedido = async (req, res) => {
    try {
        const { id_pedido } = req.params;
        const pagos = await PagoModel.obtenerPagosPorPedido(Number(id_pedido));
        return res.json(pagos);
    } catch (error) {
        console.error('Error al obtener pagos:', error);
        return res.status(500).json({ error: 'Error interno al obtener pagos.' });
    }
};

const obtenerCatalogos = async (req, res) => {
    try {
        const catalogos = await PagoModel.obtenerCatalogosPago();
        return res.json(catalogos);
    } catch (error) {
        console.error('Error al obtener catálogos de pago:', error);
        return res.status(500).json({ error: 'Error interno al obtener catálogos de pago.' });
    }
};

module.exports = {
    registrarPago,
    obtenerPagosPorPedido,
    obtenerCatalogos
};
