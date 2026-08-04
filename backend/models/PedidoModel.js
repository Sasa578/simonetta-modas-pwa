const db = require('../config/db');

const PedidoModel = {
    /**
     * Crea un pedido y su detalle de material en una transacción atómica.
     * Si falla el material, el pedido NO se guarda (ROLLBACK).
     *
     * @param {object} datosPedido  — { id_cliente, fecha_entrega, costo_total, adelanto, saldo, estado }
     * @param {object} datosMaterial — { descripcion_tela, origen_material, cantidad_metros }
     * @returns {object} { pedido, detalle }
     */
    crearPedido: async (datosPedido, datosMaterial) => {
        const cliente = await db.pool.connect();

        try {
            await cliente.query('BEGIN');

            // 1. Insertar pedido
            const resultadoPedido = await cliente.query(
                `INSERT INTO pedidos (id_cliente, fecha_entrega, costo_total, adelanto, saldo, estado)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [
                    datosPedido.id_cliente,
                    datosPedido.fecha_entrega,
                    datosPedido.costo_total,
                    datosPedido.adelanto,
                    datosPedido.saldo,
                    datosPedido.estado || 'Pendiente',
                ]
            );

            const pedido = resultadoPedido.rows[0];

            // 2. Insertar detalle de material
            const resultadoDetalle = await cliente.query(
                `INSERT INTO detalle_pedido_material (id_pedido, descripcion_tela, origen_material, cantidad_metros)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [
                    pedido.id_pedido,
                    datosMaterial.descripcion_tela,
                    datosMaterial.origen_material,
                    datosMaterial.cantidad_metros || null,
                ]
            );

            await cliente.query('COMMIT');

            return {
                pedido,
                detalle: resultadoDetalle.rows[0],
            };
        } catch (error) {
            await cliente.query('ROLLBACK');
            throw error;
        } finally {
            cliente.release();
        }
    },
};

module.exports = PedidoModel;
