const AlmacenModel = require('../models/AlmacenModel');
const db = require('../config/db'); // import db

// GET /api/almacen
const obtenerAlmacen = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM almacen ORDER BY nombre_material ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener almacén:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// POST /api/almacen
const agregarProducto = async (req, res) => {
    const { nombre_material, cantidad_actual, stock_minimo, unidad_medida } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO almacen (nombre_material, cantidad_actual, stock_minimo, unidad_medida) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre_material, cantidad_actual, stock_minimo, unidad_medida]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// PUT /api/almacen/:id
const editarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre_material, cantidad_actual, stock_minimo, unidad_medida } = req.body;
    try {
        const result = await db.query(
            'UPDATE almacen SET nombre_material=$1, cantidad_actual=$2, stock_minimo=$3, unidad_medida=$4 WHERE id_material=$5 RETURNING *',
            [nombre_material, cantidad_actual, stock_minimo, unidad_medida, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al editar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// DELETE /api/almacen/:id
const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM almacen WHERE id_material=$1', [id]);
        res.json({ mensaje: 'Eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { obtenerAlmacen, agregarProducto, editarProducto, eliminarProducto };
