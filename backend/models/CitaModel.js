const db = require('../config/db');

const CitaModel = {
    /**
     * Crea una nueva cita para un cliente (y opcionalmente asociada a un pedido).
     * Soporta id_motivo_cita normalizado de la tabla motivos_cita.
     */
    crearCita: async ({ id_cliente, id_pedido = null, fecha_cita, motivo_cita, id_motivo_cita = null, detalles, id_estado_cita = 1 }) => {
        let idMotivo = id_motivo_cita ? Number(id_motivo_cita) : null;
        let motivoTexto = motivo_cita || detalles;

        // Si no se proporcionó id_motivo_cita, buscar coincidencia por nombre en motivos_cita
        if (!idMotivo && motivoTexto) {
            const mRes = await db.query(
                'SELECT id_motivo_cita, nombre_motivo FROM motivos_cita WHERE LOWER(nombre_motivo) = LOWER($1) LIMIT 1',
                [motivoTexto.trim()]
            );
            if (mRes.rows.length > 0) {
                idMotivo = mRes.rows[0].id_motivo_cita;
                motivoTexto = mRes.rows[0].nombre_motivo;
            } else {
                idMotivo = 1; // Default: 'Cotización y Diseño'
            }
        } else if (idMotivo && !motivoTexto) {
            const mRes = await db.query('SELECT nombre_motivo FROM motivos_cita WHERE id_motivo_cita = $1', [idMotivo]);
            if (mRes.rows.length > 0) {
                motivoTexto = mRes.rows[0].nombre_motivo;
            }
        }

        if (!idMotivo) idMotivo = 1;
        if (!motivoTexto) motivoTexto = 'Cotización y Diseño';

        const resultado = await db.query(
            `INSERT INTO citas (id_cliente, id_pedido, id_estado_cita, fecha_cita, id_motivo_cita, motivo_cita, observaciones)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [id_cliente, id_pedido || null, id_estado_cita, fecha_cita, idMotivo, motivoTexto, detalles || null]
        );
        return resultado.rows[0];
    },

    /**
     * Obtiene todas las citas pendientes o programadas con motivo normalizado.
     */
    obtenerPendientes: async () => {
        const resultado = await db.query(
            `SELECT c.id_cita, c.id_cliente, c.id_pedido, c.fecha_cita,
                    c.id_motivo_cita,
                    COALESCE(mot.nombre_motivo, c.motivo_cita) as motivo_cita,
                    COALESCE(c.observaciones, c.motivo_cita) as detalles,
                    mot.descripcion as motivo_descripcion,
                    ec.id_estado_cita, ec.nombre_estado as estado,
                    COALESCE(NULLIF(TRIM(CONCAT(dp.nombre, ' ', dp.apellido)), ''), di.razon_social) as cliente,
                    COALESCE(dp.telefono, di.telefono_contacto) as telefono_whatsapp
             FROM citas c
             JOIN estados_cita ec ON c.id_estado_cita = ec.id_estado_cita
             LEFT JOIN motivos_cita mot ON c.id_motivo_cita = mot.id_motivo_cita
             JOIN clientes cl ON c.id_cliente = cl.id_cliente
             LEFT JOIN datos_cliente_persona dp ON cl.id_cliente = dp.id_cliente
             LEFT JOIN datos_cliente_institucional di ON cl.id_cliente = di.id_cliente
             WHERE ec.nombre_estado IN ('Programada', 'Reprogramada')
             ORDER BY c.fecha_cita ASC`
        );
        return resultado.rows;
    },

    /**
     * Obtiene las citas de un cliente específico con motivo normalizado.
     */
    obtenerPorCliente: async (id_cliente) => {
        const resultado = await db.query(
            `SELECT c.id_cita, c.id_cliente, c.id_pedido, c.fecha_cita,
                    c.id_motivo_cita,
                    COALESCE(mot.nombre_motivo, c.motivo_cita) as motivo_cita,
                    COALESCE(c.observaciones, c.motivo_cita) as detalles,
                    mot.descripcion as motivo_descripcion,
                    ec.id_estado_cita, ec.nombre_estado as estado
             FROM citas c
             JOIN estados_cita ec ON c.id_estado_cita = ec.id_estado_cita
             LEFT JOIN motivos_cita mot ON c.id_motivo_cita = mot.id_motivo_cita
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
                    idEstado = 2;
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
    },

    /**
     * Obtiene las fechas y horarios de citas activas para consulta de disponibilidad.
     */
    obtenerCitasOcupadas: async () => {
        const query = `
            SELECT c.id_cita, c.fecha_cita, ec.nombre_estado as estado,
                   c.id_motivo_cita,
                   COALESCE(mot.nombre_motivo, c.motivo_cita) as motivo_cita
            FROM citas c
            JOIN estados_cita ec ON c.id_estado_cita = ec.id_estado_cita
            LEFT JOIN motivos_cita mot ON c.id_motivo_cita = mot.id_motivo_cita
            WHERE ec.nombre_estado NOT IN ('Cancelada', 'Rechazada')
              AND c.fecha_cita >= CURRENT_DATE - INTERVAL '1 month'
            ORDER BY c.fecha_cita ASC;
        `;
        const resultado = await db.query(query);
        return resultado.rows;
    }
};

module.exports = CitaModel;
