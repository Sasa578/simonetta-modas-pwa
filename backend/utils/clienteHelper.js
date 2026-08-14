const db = require('../config/db');

/**
 * Obtiene todos los IDs de cliente (id_cliente) asociados a un id_usuario de rol Cliente.
 * Autovincula registros huérfanos creados por Secretaría/Admin.
 */
const obtenerIdsClienteParaUsuario = async (id_usuario, correo) => {
    try {
        const prefix = correo ? correo.split('@')[0].toLowerCase() : '';

        // 0. Obtener datos del usuario (telefono, nombre)
        const userRes = await db.pool.query('SELECT nombre_completo, telefono FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        const userTel = userRes.rows[0]?.telefono || '';
        const userNom = userRes.rows[0]?.nombre_completo?.toLowerCase() || '';

        // 1. Autovincular registros de la tabla clientes que tengan id_usuario NULL
        if (prefix || userTel || userNom) {
            await db.pool.query(
                `UPDATE clientes 
                 SET id_usuario = $1 
                 WHERE id_usuario IS NULL 
                   AND (
                       (LOWER(nombre_completo) = $4 AND $4 != '')
                       OR (telefono_whatsapp = $5 AND $5 != '')
                       OR (LOWER(nombre_completo) LIKE $2 AND $2 != '%%')
                       OR ($3 LIKE '%' || LOWER(SPLIT_PART(nombre_completo, ' ', 1)) || '%' AND $3 != '')
                   )`,
                [id_usuario, `%${prefix}%`, prefix, userNom, userTel]
            );
        }

        // 2. Obtener todos los id_cliente asociados a este id_usuario
        const res = await db.pool.query(
            `SELECT id_cliente FROM clientes WHERE id_usuario = $1`,
            [id_usuario]
        );

        let ids = res.rows.map(r => r.id_cliente);

        // 3. Fallback: Si no hay vinculación aún, obtener por búsqueda de nombre o teléfono
        if (ids.length === 0 && (prefix || userTel || userNom)) {
            const resFallback = await db.pool.query(
                `SELECT id_cliente FROM clientes WHERE 
                   (LOWER(nombre_completo) = $2 AND $2 != '')
                   OR (telefono_whatsapp = $3 AND $3 != '')
                   OR (LOWER(nombre_completo) LIKE $1 AND $1 != '%%')`,
                [`%${prefix}%`, userNom, userTel]
            );
            ids = resFallback.rows.map(r => r.id_cliente);
        }

        return ids;
    } catch (err) {
        console.error('Error en obtenerIdsClienteParaUsuario:', err);
        return [];
    }
};

module.exports = { obtenerIdsClienteParaUsuario };
