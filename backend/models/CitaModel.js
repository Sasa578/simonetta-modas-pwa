const db = require('../config/db');

const CitaModel = {
    crearCita: async ({ id_cliente, fecha_cita, detalles }) => {
        const resultado = await db.pool.query(
            `INSERT INTO citas (id_cliente, fecha_cita, detalles, estado)
             VALUES ($1, $2, $3, 'Pendiente')
             RETURNING *`,
            [id_cliente, fecha_cita, detalles || null]
        );
        return resultado.rows[0];
    },

    obtenerPendientes: async () => {
        const resultado = await db.pool.query(
            `SELECT c.id_cita, c.fecha_cita, c.detalles, c.estado, c.fecha_creacion, cl.nombre_completo as cliente, cl.telefono_whatsapp, cl.id_cliente
             FROM citas c
             JOIN clientes cl ON c.id_cliente = cl.id_cliente
             WHERE c.estado = 'Pendiente'
             ORDER BY c.fecha_cita ASC`
        );
        return resultado.rows;
    },

    obtenerPorCliente: async (id_cliente) => {
        const resultado = await db.pool.query(
            `SELECT * FROM citas 
             WHERE id_cliente = $1 
             ORDER BY fecha_cita DESC`,
            [id_cliente]
        );
        return resultado.rows;
    },

    actualizarEstado: async (id_cita, estado) => {
        const resultado = await db.pool.query(
            `UPDATE citas 
             SET estado = $1 
             WHERE id_cita = $2 
             RETURNING *`,
            [estado, id_cita]
        );
        return resultado.rows[0];
    }
};

module.exports = CitaModel;
