const db = require('../config/db');

const PagoModel = {
    /**
     * Registra un pago o abono para un pedido.
     */
    registrarPago: async ({ id_pedido, monto_pago, id_metodo_pago = 1, id_estado_pago = 2 }) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const pagoRes = await client.query(
                `INSERT INTO pagos (id_pedido, id_estado_pago, id_metodo_pago, monto_pago)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [id_pedido, id_estado_pago, id_metodo_pago, parseFloat(monto_pago)]
            );

            // Verificar si con este pago se completa el costo total
            const resumen = await client.query(
                `SELECT p.costo_total, COALESCE(SUM(pg.monto_pago), 0) as total_pagado
                 FROM pedidos p
                 LEFT JOIN pagos pg ON p.id_pedido = pg.id_pedido
                 WHERE p.id_pedido = $1
                 GROUP BY p.costo_total`,
                [id_pedido]
            );

            const costoTotal = parseFloat(resumen.rows[0]?.costo_total || 0);
            const totalPagado = parseFloat(resumen.rows[0]?.total_pagado || 0);

            if (totalPagado >= costoTotal && costoTotal > 0) {
                // Actualizar estado del pago a Completado (id 3)
                await client.query(
                    `UPDATE pagos SET id_estado_pago = 3 WHERE id_pedido = $1`,
                    [id_pedido]
                );
            }

            await client.query('COMMIT');
            return pagoRes.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Obtiene los pagos registrados para un pedido con método y estado.
     */
    obtenerPagosPorPedido: async (id_pedido) => {
        const resultado = await db.query(
            `SELECT pg.id_pago, pg.id_pedido, pg.monto_pago, pg.fecha_pago,
                    ep.id_estado_pago, ep.nombre_estado as estado_pago,
                    mp.id_metodo_pago, mp.nombre_metodo as metodo_pago
             FROM pagos pg
             JOIN estados_pago ep ON pg.id_estado_pago = ep.id_estado_pago
             JOIN metodos_pago mp ON pg.id_metodo_pago = mp.id_metodo_pago
             WHERE pg.id_pedido = $1
             ORDER BY pg.fecha_pago ASC`,
            [id_pedido]
        );
        return resultado.rows;
    },

    /**
     * Catálogo de métodos y estados de pago.
     */
    obtenerCatalogosPago: async () => {
        const [metodos, estados] = await Promise.all([
            db.query('SELECT id_metodo_pago, nombre_metodo FROM metodos_pago ORDER BY id_metodo_pago'),
            db.query('SELECT id_estado_pago, nombre_estado FROM estados_pago ORDER BY id_estado_pago')
        ]);
        return {
            metodos: metodos.rows,
            estados: estados.rows
        };
    }
};

module.exports = PagoModel;
