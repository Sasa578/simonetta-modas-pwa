const KardexModel = require('../models/KardexModel');

const obtenerMovimientos = async (req, res) => {
    try {
        const { id_producto, id_tipo_movimiento, id_origen, limite } = req.query;
        const movimientos = await KardexModel.obtenerMovimientos({
            id_producto: id_producto ? Number(id_producto) : null,
            id_tipo_movimiento: id_tipo_movimiento ? Number(id_tipo_movimiento) : null,
            id_origen: id_origen ? Number(id_origen) : null,
            limite: limite ? Number(limite) : 100
        });
        return res.json(movimientos);
    } catch (error) {
        console.error('Error al obtener movimientos de Kardex:', error);
        return res.status(500).json({ error: 'Error interno al consultar el Kardex.' });
    }
};

const registrarMovimiento = async (req, res) => {
    try {
        const {
            id_producto,
            id_tipo_movimiento,
            cantidad,
            id_origen,
            id_proveedor,
            id_detalle_pedido,
            observacion
        } = req.body;

        if (!id_producto || !id_tipo_movimiento || !cantidad) {
            return res.status(400).json({ error: 'Producto, tipo de movimiento y cantidad son obligatorios.' });
        }

        const movimiento = await KardexModel.registrarMovimiento({
            id_producto: Number(id_producto),
            id_tipo_movimiento: Number(id_tipo_movimiento),
            cantidad: parseFloat(cantidad),
            id_origen: id_origen ? Number(id_origen) : 1,
            id_proveedor: id_proveedor ? Number(id_proveedor) : null,
            id_detalle_pedido: id_detalle_pedido ? Number(id_detalle_pedido) : null,
            observacion: observacion || null
        });

        const io = req.app.get('io');
        if (io) io.emit('actualizacion_datos');

        return res.status(201).json({
            mensaje: 'Movimiento registrado correctamente en Kardex.',
            movimiento
        });
    } catch (error) {
        console.error('Error al registrar movimiento en Kardex:', error);
        return res.status(400).json({ error: error.message || 'Error al procesar el movimiento de inventario.' });
    }
};

const obtenerCatalogos = async (req, res) => {
    try {
        const catalogos = await KardexModel.obtenerCatalogos();
        return res.json(catalogos);
    } catch (error) {
        console.error('Error al obtener catálogos de Kardex:', error);
        return res.status(500).json({ error: 'Error al obtener catálogos de Kardex.' });
    }
};

const obtenerProveedores = async (req, res) => {
    try {
        const proveedores = await KardexModel.obtenerProveedores();
        return res.json(proveedores);
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        return res.status(500).json({ error: 'Error al obtener proveedores.' });
    }
};

const crearProveedor = async (req, res) => {
    try {
        const { nombre_empresa, nombre_contacto, telefono_contacto, direccion } = req.body;
        if (!nombre_empresa || !nombre_empresa.trim()) {
            return res.status(400).json({ error: 'El nombre de la empresa proveedora es obligatorio.' });
        }

        const nuevoProveedor = await KardexModel.crearProveedor({
            nombre_empresa: nombre_empresa.trim(),
            nombre_contacto: nombre_contacto ? nombre_contacto.trim() : null,
            telefono_contacto: telefono_contacto ? telefono_contacto.trim() : null,
            direccion: direccion ? direccion.trim() : null
        });

        return res.status(201).json({
            mensaje: 'Proveedor registrado exitosamente.',
            proveedor: nuevoProveedor
        });
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        return res.status(500).json({ error: 'Error interno al registrar proveedor.' });
    }
};

module.exports = {
    obtenerMovimientos,
    registrarMovimiento,
    obtenerCatalogos,
    obtenerProveedores,
    crearProveedor
};
