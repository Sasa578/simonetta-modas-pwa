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
                `INSERT INTO detalle_pedido_material (id_pedido, id_material, descripcion_tela, origen_material, cantidad_metros)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [
                    pedido.id_pedido,
                    datosMaterial.id_material || null,
                    datosMaterial.descripcion_tela,
                    datosMaterial.origen_material,
                    datosMaterial.cantidad_metros || null,
                ]
            );

            // 3. REGLA DE NEGOCIO: Descontar stock si el material es del Taller
            if (datosMaterial.origen_material === 'Taller' && datosMaterial.id_material && datosMaterial.cantidad_metros) {
                await cliente.query(
                    `UPDATE almacen 
                     SET cantidad_actual = cantidad_actual - $1 
                     WHERE id_material = $2`,
                    [datosMaterial.cantidad_metros, datosMaterial.id_material]
                );
            }

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

    /**
     * Actualiza el estado de un pedido (HU-06)
     */
    actualizarEstado: async (id_pedido, nuevoEstado) => {
        const resultado = await db.pool.query(
            `UPDATE pedidos 
             SET estado = $1 
             WHERE id_pedido = $2 
             RETURNING *`,
            [nuevoEstado, id_pedido]
        );
        return resultado.rows[0];
    },

    /**
     * Obtiene los pedidos activos con información del cliente y detalle material (HU-06)
     */
    obtenerPedidosActivos: async () => {
        const resultado = await db.pool.query(
            `SELECT p.id_pedido, p.estado, p.fecha_pedido, p.fecha_entrega, c.nombre_completo as cliente, d.descripcion_tela as prenda
             FROM pedidos p
             JOIN clientes c ON p.id_cliente = c.id_cliente
             LEFT JOIN detalle_pedido_material d ON p.id_pedido = d.id_pedido
             ORDER BY p.fecha_entrega ASC`
        );
        return resultado.rows;
    },

    /**
     * Obtiene el cliente asociado a un pedido (para notificaciones FCM).
     */
    obtenerClienteDelPedido: async (idPedido) => {
        const resultado = await db.pool.query(
            `SELECT c.nombre_completo, c.telefono_whatsapp, u.fcm_token
             FROM pedidos p
             JOIN clientes c ON p.id_cliente = c.id_cliente
             LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
             WHERE p.id_pedido = $1`,
            [idPedido]
        );
        return resultado.rows[0] || null;
    },

    /**
     * Obtiene métricas (KPIs) para el dashboard gerencial (TI-4.1)
     * @returns {object} { pendientes, proximos48h, ingresosMes }
     */
    obtenerMetricas: async () => {
        const [pendientes, proximos, ingresos] = await Promise.all([
            db.pool.query(
                `SELECT COUNT(*)::int AS total FROM pedidos WHERE estado IN ('Pendiente', 'Corte')`
            ),
            db.pool.query(
                `SELECT COUNT(*)::int AS total FROM pedidos 
                 WHERE fecha_entrega BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 days'`
            ),
            db.pool.query(
                `SELECT COALESCE(SUM(costo_total), 0)::float AS total FROM pedidos 
                 WHERE DATE_TRUNC('month', fecha_pedido) = DATE_TRUNC('month', CURRENT_DATE)`
            ),
        ]);

        return {
            pedidosPendientes: pendientes.rows[0].total,
            pedidosProximos48h: proximos.rows[0].total,
            ingresosMes: ingresos.rows[0].total,
        };
    },
};

module.exports = PedidoModel;
