const AlmacenModel = require('../models/AlmacenModel');

// GET /api/almacen — Listar todo el inventario de insumos
const obtenerAlmacen = async (req, res) => {
    try {
        const inventario = await AlmacenModel.obtenerInventario();
        return res.json(inventario);
    } catch (error) {
        console.error('Error al obtener almacén:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// GET /api/almacen/catalogos — Listar categorías, tipos, unidades, colores y materiales
const obtenerCatalogosAlmacen = async (req, res) => {
    try {
        const catalogos = await AlmacenModel.obtenerCatalogos();
        return res.json(catalogos);
    } catch (error) {
        console.error('Error al obtener catálogos de almacén:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// GET /api/almacen/:id — Obtener detalle de un producto específico
const obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await AlmacenModel.buscarPorId(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Insumo no encontrado en almacén.' });
        }
        return res.json(producto);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// POST /api/almacen — Registrar nuevo insumo
const agregarProducto = async (req, res) => {
    try {
        const { nombre_articulo, nombre_material, cantidad_stock, cantidad_actual, stock_minimo } = req.body;
        const nombre = nombre_articulo || nombre_material;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del artículo o material es obligatorio.' });
        }

        const nuevoProducto = await AlmacenModel.crear(req.body);
        return res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error('Error al agregar producto:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/almacen/:id — Modificar insumo
const editarProducto = async (req, res) => {
    try {
        const productoActualizado = await AlmacenModel.actualizar(req.params.id, req.body);
        if (!productoActualizado) {
            return res.status(404).json({ error: 'Insumo no encontrado.' });
        }
        return res.json(productoActualizado);
    } catch (error) {
        console.error('Error al editar producto:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// DELETE /api/almacen/:id — Eliminar insumo
const eliminarProducto = async (req, res) => {
    try {
        const ok = await AlmacenModel.eliminar(req.params.id);
        if (!ok) {
            return res.status(404).json({ error: 'Insumo no encontrado.' });
        }
        return res.json({ mensaje: 'Insumo eliminado correctamente del almacén.' });
    } catch (error) {
        if (error.constraint === 'movimientos_almacen_id_producto_fkey' || error.constraint?.includes('fkey')) {
            return res.status(409).json({ error: 'No se puede eliminar: el insumo tiene movimientos de inventario registrados.' });
        }
        console.error('Error al eliminar producto:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    obtenerAlmacen,
    obtenerCatalogosAlmacen,
    obtenerProductoPorId,
    agregarProducto,
    editarProducto,
    eliminarProducto
};
