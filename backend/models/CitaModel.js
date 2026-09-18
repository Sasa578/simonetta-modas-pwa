const db = require('../config/db');

const CitaModel = {
    /**
     * Crea una nueva cita para un cliente (y opcionalmente asociada a un pedido).
     */
    crearCita: async ({ id_cliente, id_pedido = null, fecha_cita, motivo_cita, detalles, id_estado_cita = 1 }) => {
        const motivo = motivo_cita || detalles || 'Cita de prueba / toma de medidas';
        const resultado = await db.query(
            `INSERT INTO citas (id_cliente, id_pedido, id_estado_cita, fecha_cita, motivo_cita)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [id_cliente, id_pedido || null, id_estado_cita, fecha_cita, motivo]
        );
        return resultado.rows[0];
    },

    /**
     * Obtiene todas las citas pendientes o programadas.
     */
    obtenerPendientes: async () => {
        const resultado = await db.query(
            `SELECT c.id_cita, c.id_cliente, c.id_pedido, c.fecha_cita, c.motivo_cita, c.motivo_cita as detalles,
                    ec.id_estado_cita, ec.nombre_estado as estado,
                    COALESCE(NULLIF(TRIM(CONCAT(dp.nombre, ' ', dp.apellido)), ''), di.razon_social) as cliente,
                    COALESCE(dp.telefono, di.telefono_contacto) as telefono_whatsapp
             FROM citas c
             JOIN estados_cita ec ON c.id_estado_cita = ec.id_estado_cita
             JOIN clientes cl ON c.id_cliente = cl.id_cliente
             LEFT JOIN datos_cliente_persona dp ON cl.id_cliente = dp.id_cliente
             LEFT JOIN datos_cliente_institucional di ON cl.id_cliente = di.id_cliente
             WHERE ec.nombre_estado IN ('Programada', 'Reprogramada')
             ORDER BY c.fecha_cita ASC`
        );
        return resultado.rows;
    },

    /**
     * Obtiene las citas de un cliente específico.
     */
    obtenerPorCliente: async (id_cliente) => {
        const resultado = await db.query(
            `SELECT c.id_cita, c.id_cliente, c.id_pedido, c.fecha_cita, c.motivo_cita, c.motivo_cita as detalles,
                    ec.id_estado_cita, ec.nombre_estado as estado
             FROM citas c
             JOIN estados_cita ec ON c.id_estado_cita = ec.id_estado_cita
             WHERE c.id_cliente = $1
             ORDER BY c.fecha_cita DESC`,
            [id_cliente]
        );
        return resultado.rows;
    },

    /**
     * Actualiza el estado de una cita.
     */
    actualizarEstado: async (id_cita, estado) => {
        // Buscar el id_estado_cita por nombre o ID
        let idEstado = estado;
        if (typeof estado === 'string') {
            const estadoLower = estado.toLowerCase().trim();
            if (estadoLower === 'atendida' || estadoLower === 'completada') {
                idEstado = 2; // 'Realizada'
            } else {
                const estadoRes = await db.query('SELECT id_estado_cita FROM estados_cita WHERE LOWER(nombre_estado) = LOWER($1)', [estadoLower]);
                if (estadoRes.rows.length > 0) {
                    idEstado = estadoRes.rows[0].id_estado_cita;
                } else {
                    idEstado = 2; // 'Realizada'
                }
            }
        }

        const resultado = await db.query(
            `UPDATE citas 
             SET id_estado_cita = $1 
             WHERE id_cita = $2 
             RETURNING *`,
            [idEstado, id_cita]
        );
        return resultado.rows[0];
    }
};

module.exports = CitaModel;
