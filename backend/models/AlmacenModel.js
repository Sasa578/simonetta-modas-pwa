const db = require('../config/db');

const AlmacenModel = {
    /**
     * Obtiene todo el inventario (HU-07)
     */
    obtenerInventario: async () => {
        const resultado = await db.pool.query(
            `SELECT id_material, nombre_material as producto, cantidad_actual as stock, stock_minimo as minimo, unidad_medida
             FROM almacen
             ORDER BY nombre_material ASC`
        );
        return resultado.rows;
    }
};

module.exports = AlmacenModel;
