const db = require('../config/db');

/**
 * Obtiene todos los IDs de cliente (id_cliente) asociados a un usuario de rol Cliente.
 * Compatible 100% con la arquitectura 3FN.
 */
const obtenerIdsClienteParaUsuario = async (id_usuario, correo, directIdCliente = null) => {
    try {
        const ids = new Set();

        if (directIdCliente) {
            ids.add(Number(directIdCliente));
        }

        const cleanCorreo = correo ? correo.trim().toLowerCase() : '';
        if (cleanCorreo) {
            const res = await db.pool.query(
                'SELECT id_cliente FROM clientes WHERE LOWER(correo_electronico) = LOWER($1)',
                [cleanCorreo]
            );
            res.rows.forEach(r => ids.add(r.id_cliente));
        }

        return Array.from(ids);
    } catch (err) {
        console.error('Error en obtenerIdsClienteParaUsuario:', err);
        return [];
    }
};

module.exports = { obtenerIdsClienteParaUsuario };
