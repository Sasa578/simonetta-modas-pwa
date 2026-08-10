const db = require('../config/db');

const ClienteModel = {
    /**
     * Lista todos los clientes ordenados alfabéticamente.
     * @returns {Array} lista de clientes
     */
    listarTodos: async () => {
        const resultado = await db.query(
            `SELECT c.id_cliente, c.nombre_completo, c.telefono_whatsapp, u.correo,
                    m.cortas, m.cintura, m.frente, m.alto_cadera, m.cadera, 
                    m.entre_busto, m.busto, m.espalda, m.hombro, m.fecha_toma
             FROM clientes c
             LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
             LEFT JOIN LATERAL (
                 SELECT * FROM medidas 
                 WHERE id_cliente = c.id_cliente 
                 ORDER BY fecha_toma DESC LIMIT 1
             ) m ON true
             ORDER BY c.nombre_completo ASC`
        );
        return resultado.rows;
    },

    /**
     * Busca un cliente por su ID.
     * @param {number} id
     * @returns {object|null} cliente o null si no existe
     */
    buscarPorId: async (id) => {
        const resultado = await db.query(
            `SELECT id_cliente, id_usuario, nombre_completo, telefono_whatsapp
             FROM clientes
             WHERE id_cliente = $1`,
            [id]
        );
        return resultado.rows[0] || null;
    },

    /**
     * Crea un nuevo cliente.
     * @param {object} datos — { nombre_completo, telefono_whatsapp, id_usuario }
     * @returns {object} cliente creado
     */
    crear: async ({ nombre_completo, telefono_whatsapp, id_usuario }) => {
        const resultado = await db.query(
            `INSERT INTO clientes (nombre_completo, telefono_whatsapp, id_usuario)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nombre_completo, telefono_whatsapp, id_usuario || null]
        );
        return resultado.rows[0];
    },

    /**
     * Actualiza los datos de un cliente.
     * @param {number} id
     * @param {object} datos — campos a actualizar
     * @returns {object|null} cliente actualizado o null si no existe
     */
    actualizar: async (id, { nombre_completo, telefono_whatsapp, id_usuario }) => {
        const resultado = await db.query(
            `UPDATE clientes
             SET nombre_completo = COALESCE($1, nombre_completo),
                 telefono_whatsapp = COALESCE($2, telefono_whatsapp),
                 id_usuario = COALESCE($3, id_usuario)
             WHERE id_cliente = $4
             RETURNING *`,
            [nombre_completo || null, telefono_whatsapp || null, id_usuario || null, id]
        );
        return resultado.rows[0] || null;
    },

    /**
     * Elimina un cliente por ID (las medidas se eliminan en cascada).
     * @param {number} id
     * @returns {boolean} true si se eliminó, false si no existía
     */
    eliminar: async (id) => {
        const resultado = await db.query(
            `DELETE FROM clientes WHERE id_cliente = $1 RETURNING id_cliente`,
            [id]
        );
        return resultado.rows.length > 0;
    },
};

module.exports = ClienteModel;
