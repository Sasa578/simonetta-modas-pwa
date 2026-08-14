const db = require('../config/db');

const ClienteModel = {
    /**
     * Lista todos los clientes ordenados alfabéticamente.
     * @returns {Array} lista de clientes
     */
    listarTodos: async () => {
        const resultado = await db.query(
            `SELECT c.id_cliente, c.nombre_completo, c.telefono_whatsapp, c.correo, c.carnet_identidad, u.correo as u_correo,
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
            `SELECT id_cliente, id_usuario, nombre_completo, telefono_whatsapp, carnet_identidad, correo
             FROM clientes
             WHERE id_cliente = $1`,
            [id]
        );
        return resultado.rows[0] || null;
    },

    /**
     * Crea un nuevo cliente.
     * @param {object} datos — { nombre_completo, telefono_whatsapp, id_usuario, carnet_identidad, correo }
     * @returns {object} cliente creado
     */
    crear: async ({ nombre_completo, telefono_whatsapp, id_usuario, carnet_identidad, correo }) => {
        const resultado = await db.query(
            `INSERT INTO clientes (nombre_completo, telefono_whatsapp, id_usuario, carnet_identidad, correo)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [nombre_completo, telefono_whatsapp, id_usuario || null, carnet_identidad || null, correo || null]
        );
        return resultado.rows[0];
    },

    /**
     * Actualiza los datos de un cliente.
     * @param {number} id
     * @param {object} datos — campos a actualizar
     * @returns {object|null} cliente actualizado o null si no existe
     */
    actualizar: async (id, { nombre_completo, telefono_whatsapp, id_usuario, carnet_identidad, correo }) => {
        const sets = [];
        const vals = [];
        let idx = 1;

        if (nombre_completo !== undefined) { sets.push(`nombre_completo = $${idx++}`); vals.push(nombre_completo); }
        if (telefono_whatsapp !== undefined) { sets.push(`telefono_whatsapp = $${idx++}`); vals.push(telefono_whatsapp); }
        if (id_usuario !== undefined) { sets.push(`id_usuario = $${idx++}`); vals.push(id_usuario); }
        if (carnet_identidad !== undefined) { sets.push(`carnet_identidad = $${idx++}`); vals.push(carnet_identidad); }
        if (correo !== undefined) { sets.push(`correo = $${idx++}`); vals.push(correo); }

        if (sets.length === 0) return null;
        vals.push(id);

        const resultado = await db.query(
            `UPDATE clientes
             SET ${sets.join(', ')}
             WHERE id_cliente = $${idx}
             RETURNING *`,
            vals
        );
        return resultado.rows[0] || null;
    },

    /**
     * Elimina un cliente.
     * @param {number} id
     * @returns {boolean} true si fue eliminado
     */
    eliminar: async (id) => {
        const resultado = await db.query(
            `DELETE FROM clientes WHERE id_cliente = $1 RETURNING id_cliente`,
            [id]
        );
        return resultado.rows.length > 0;
    }
};

module.exports = ClienteModel;
