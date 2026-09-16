const db = require('../config/db');

const PedidoModel = {
    /**
     * Crea un pedido completo con su detalle, prenda, medidas, pago inicial y cita en una sola transacción atómica.
     */
    crearPedido: async (datosPedido, datosDetalle = {}) => {
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Resolver el id_estado_pedido
            let idEstadoPedido = 1; // 'Pendiente' por defecto
            if (datosPedido.estado) {
                const estRes = await client.query('SELECT id_estado_pedido FROM estados_pedido WHERE LOWER(nombre_estado) = LOWER($1)', [datosPedido.estado]);
                if (estRes.rows.length > 0) idEstadoPedido = estRes.rows[0].id_estado_pedido;
            } else if (datosPedido.id_estado_pedido) {
                idEstadoPedido = datosPedido.id_estado_pedido;
            }

            const costoTotal = parseFloat(datosPedido.costo_total) || 0;

            // 2. Insertar cabecera en pedidos
            const resultadoPedido = await client.query(
                `INSERT INTO pedidos (id_cliente, id_estado_pedido, fecha_inicio, fecha_prueba, fecha_entrega, costo_total)
                 VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)
                 RETURNING *`,
                [
                    datosPedido.id_cliente,
                    idEstadoPedido,
                    datosPedido.fecha_prueba || null,
                    datosPedido.fecha_entrega,
                    costoTotal
                ]
            );
            const pedido = resultadoPedido.rows[0];
            const idPedido = pedido.id_pedido;

            // 3. Resolver o crear la prenda confeccionable
            let idPrenda = datosDetalle.id_prenda;
            if (!idPrenda) {
                const tipoPrenda = datosDetalle.tipo_prenda || datosDetalle.descripcion_tela || 'Prenda a Medida';
                const color = datosDetalle.color || 'A elección';
                const idCatalogo = datosDetalle.id_catalogo || null;

                const prenRes = await client.query(
                    `INSERT INTO prendas (id_catalogo, tipo_prenda, color)
                     VALUES ($1, $2, $3)
                     RETURNING id_prenda`,
                    [idCatalogo, tipoPrenda, color]
                );
                idPrenda = prenRes.rows[0].id_prenda;

                if (datosDetalle.descripcion_tela) {
                    await client.query(
                        `INSERT INTO descripciones_prenda (id_prenda, descripcion_detallada)
                         VALUES ($1, $2)`,
                        [idPrenda, datosDetalle.descripcion_tela]
                    );
                }
            }

            // 4. Insertar en detalle_pedido
            const cantidad = parseInt(datosDetalle.cantidad) || 1;
            const subtotal = parseFloat(datosDetalle.subtotal) || costoTotal;

            const detRes = await client.query(
                `INSERT INTO detalle_pedido (id_pedido, id_prenda, cantidad, subtotal)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [idPedido, idPrenda, cantidad, subtotal]
            );
            const detalle = detRes.rows[0];
            const idDetalle = detalle.id_detalle;

            // 5. Insertar notas de diseño si existen
            const notas = datosDetalle.notas_diseno || datosDetalle.origen_material ? `Origen tela: ${datosDetalle.origen_material || 'Taller'}. ${datosDetalle.notas_diseno || ''}` : null;
            if (notas) {
                await client.query(
                    `INSERT INTO notas_diseno_detalle (id_detalle, notas_diseno)
                     VALUES ($1, $2)`,
                    [idDetalle, notas]
                );
            }

            // 6. Insertar medidas anatómicas si vienen en el detalle
            const m = datosDetalle.medidas_anatomicas || datosDetalle.medidas;
            if (m) {
                await client.query(
                    `INSERT INTO medidas_anatomicas (id_detalle, cortas, cintura, frente, alto_cadera, cadera, entre_busto, busto, espalda, hombro)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [idDetalle, m.cortas || null, m.cintura || null, m.frente || null, m.alto_cadera || null, m.cadera || null, m.entre_busto || null, m.busto || null, m.espalda || null, m.hombro || null]
                );
            }

            // 7. Insertar talla si viene
            if (datosDetalle.talla) {
                await client.query(
                    `INSERT INTO medidas_convencionales (id_detalle, talla, equivalencia_europea)
                     VALUES ($1, $2, $3)`,
                    [idDetalle, datosDetalle.talla, datosDetalle.equivalencia_europea || null]
                );
            }

            // 8. Normalización financiera: Registrar adelanto en tabla pagos
            const adelanto = parseFloat(datosPedido.adelanto) || 0;
            if (adelanto > 0) {
                const metodoPago = datosPedido.id_metodo_pago || 1; // 1: Efectivo
                const estadoPago = adelanto >= costoTotal ? 3 : 2; // 3: Completado, 2: Adelanto Parcial
                await client.query(
                    `INSERT INTO pagos (id_pedido, id_estado_pago, id_metodo_pago, monto_pago)
                     VALUES ($1, $2, $3, $4)`,
                    [idPedido, estadoPago, metodoPago, adelanto]
                );
            }

            // 9. Agenda: Programar cita de prueba si se definió fecha
            if (datosPedido.fecha_prueba) {
                await client.query(
                    `INSERT INTO citas (id_cliente, id_pedido, id_estado_cita, fecha_cita, motivo_cita)
                     VALUES ($1, $2, 1, $3, $4)`,
                    [datosPedido.id_cliente, idPedido, datosPedido.fecha_prueba, 'Prueba programada de confección']
                );
            }

            
            // 5.1 Registrar insumos múltiples del almacén en Kardex y descontar stock
            if (Array.isArray(datosDetalle.insumos) && datosDetalle.insumos.length > 0) {
                for (const ins of datosDetalle.insumos) {
                    const idProd = Number(ins.id_producto);
                    const cant = parseFloat(ins.cantidad) || 0;
                    if (idProd && cant > 0) {
                        const esTaller = (datosDetalle.origen_material || 'Taller') === 'Taller';
                        if (esTaller) {
                            await client.query(
                                'UPDATE productos_almacen SET cantidad_stock = GREATEST(0, cantidad_stock - $1) WHERE id_producto = $2',
                                [cant, idProd]
                            );
                        }
                        const stRes = await client.query('SELECT cantidad_stock FROM productos_almacen WHERE id_producto = $1', [idProd]);
                        const stockActualizado = stRes.rows[0]?.cantidad_stock || 0;
                        const idOrigen = esTaller ? 1 : 2;

                        const movRes = await client.query(
                            `INSERT INTO movimientos_almacen (id_producto, id_tipo_movimiento, id_origen, id_detalle_pedido, cantidad, stock_resultante)
                             VALUES ($1, 2, $2, $3, $4, $5)
                             RETURNING id_movimiento`,
                            [idProd, idOrigen, idDetalle, cant, stockActualizado]
                        );
                        const idMov = movRes.rows[0].id_movimiento;
                        await client.query(
                            `INSERT INTO observaciones_movimiento (id_movimiento, observacion)
                             VALUES ($1, $2)`,
                            [idMov, `Consumo para confección pedido #${idPedido} (${ins.nombre_articulo || 'Insumo'}: ${cant} ${ins.unidad_medida || 'un'})`]
                        );
                    }
                }
            }

            await client.query('COMMIT');

            return PedidoModel.obtenerPedidoPorId(idPedido);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Actualiza el estado de un pedido en la tabla de estados.
     */
    actualizarEstado: async (id_pedido, nuevoEstado) => {
        let idEstado = nuevoEstado;
        if (typeof nuevoEstado === 'string') {
            const aliasMap = {
                'listo para prueba': 'prueba',
                'para entregar': 'terminado',
                'acabados': 'terminado'
            };
            const limpio = nuevoEstado.trim().toLowerCase();
            const busqueda = aliasMap[limpio] || limpio;

            const resEst = await db.query('SELECT id_estado_pedido FROM estados_pedido WHERE LOWER(nombre_estado) = LOWER($1)', [busqueda]);
            if (resEst.rows.length > 0) {
                idEstado = resEst.rows[0].id_estado_pedido;
            } else {
                idEstado = parseInt(nuevoEstado) || 1;
            }
        }

        await db.query(
            `UPDATE pedidos SET id_estado_pedido = $1 WHERE id_pedido = $2`,
            [idEstado, id_pedido]
        );
        return PedidoModel.obtenerPedidoPorId(id_pedido);
    },

    /**
     * Obtiene los pedidos activos con información del cliente, prenda, pagos y saldo.
     */
    obtenerPedidosActivos: async () => {
        const query = `
            SELECT p.id_pedido,
                   ep.id_estado_pedido, ep.nombre_estado as estado,
                   p.fecha_inicio as fecha_pedido, p.fecha_prueba, p.fecha_entrega,
                   p.costo_total,
                   p.id_cliente,
                   COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social) as cliente,
                   COALESCE(dcp.telefono, dci.telefono_contacto) as telefono_whatsapp,
                   cl.correo_electronico as cliente_correo,
                   tc.nombre_tipo as tipo_cliente,
                   -- Prenda principal
                   pr.id_prenda, pr.tipo_prenda as prenda, pr.color,
                   dp.id_detalle, dp.cantidad, dp.subtotal,
                   nd.notas_diseno,
                   -- Pagos acumulados y saldo
                   COALESCE(pagos_res.total_pagado, 0) as adelanto,
                   (p.costo_total - COALESCE(pagos_res.total_pagado, 0)) as saldo
            FROM pedidos p
            JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
            JOIN clientes cl ON p.id_cliente = cl.id_cliente
            JOIN tipo_cliente tc ON cl.id_tipo_cliente = tc.id_tipo_cliente
            LEFT JOIN datos_cliente_persona dcp ON cl.id_cliente = dcp.id_cliente
            LEFT JOIN datos_cliente_institucional dci ON cl.id_cliente = dci.id_cliente
            LEFT JOIN LATERAL (
                SELECT dp.id_detalle, dp.id_prenda, dp.cantidad, dp.subtotal
                FROM detalle_pedido dp
                WHERE dp.id_pedido = p.id_pedido
                ORDER BY dp.id_detalle ASC
                LIMIT 1
            ) dp ON true
            LEFT JOIN prendas pr ON dp.id_prenda = pr.id_prenda
            LEFT JOIN notas_diseno_detalle nd ON dp.id_detalle = nd.id_detalle
            LEFT JOIN (
                SELECT id_pedido, SUM(monto_pago) as total_pagado
                FROM pagos
                GROUP BY id_pedido
            ) pagos_res ON p.id_pedido = pagos_res.id_pedido
            WHERE ep.nombre_estado != 'Cancelado'
            ORDER BY p.fecha_entrega ASC;
        `;
        const resultado = await db.query(query);
        return resultado.rows;
    },

    /**
     * Obtiene los pedidos asignados o visibles para costureras.
     */
    obtenerPedidosPorCosturera: async (id_costurera) => {
        // En el nuevo modelo, los pedidos en fase Corte/Armado/Prueba son visibles para confección
        const query = `
            SELECT p.id_pedido, ep.nombre_estado as estado, p.fecha_inicio as fecha_pedido, p.fecha_entrega, p.fecha_prueba,
                   COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social) as cliente,
                   cl.id_cliente,
                   pr.tipo_prenda as prenda, pr.color,
                   dp.id_detalle, nd.notas_diseno,
                   ma.cortas, ma.cintura, ma.busto, ma.cadera, ma.espalda
            FROM pedidos p
            JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
            JOIN clientes cl ON p.id_cliente = cl.id_cliente
            LEFT JOIN datos_cliente_persona dcp ON cl.id_cliente = dcp.id_cliente
            LEFT JOIN datos_cliente_institucional dci ON cl.id_cliente = dci.id_cliente
            JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
            JOIN prendas pr ON dp.id_prenda = pr.id_prenda
            LEFT JOIN notas_diseno_detalle nd ON dp.id_detalle = nd.id_detalle
            LEFT JOIN medidas_anatomicas ma ON dp.id_detalle = ma.id_detalle
            WHERE ep.nombre_estado IN ('Corte', 'Armado', 'Prueba', 'Terminado')
            ORDER BY p.fecha_entrega ASC;
        `;
        const resultado = await db.query(query);
        return resultado.rows;
    },

    /**
     * Obtiene los pedidos asignados a una lista de IDs de cliente.
     */
    obtenerPedidosPorClienteIds: async (idsClienteArray) => {
        if (!idsClienteArray || idsClienteArray.length === 0) return [];
        const query = `
            SELECT p.id_pedido, ep.nombre_estado as estado, p.fecha_inicio as fecha_pedido, p.fecha_entrega, p.fecha_prueba,
                   p.costo_total,
                   COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social) as cliente,
                   pr.tipo_prenda as prenda, pr.color,
                   COALESCE(pagos_res.total_pagado, 0) as adelanto,
                   (p.costo_total - COALESCE(pagos_res.total_pagado, 0)) as saldo
            FROM pedidos p
            JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
            JOIN clientes cl ON p.id_cliente = cl.id_cliente
            LEFT JOIN datos_cliente_persona dcp ON cl.id_cliente = dcp.id_cliente
            LEFT JOIN datos_cliente_institucional dci ON cl.id_cliente = dci.id_cliente
            LEFT JOIN LATERAL (
                SELECT id_prenda FROM detalle_pedido WHERE id_pedido = p.id_pedido LIMIT 1
            ) dp ON true
            LEFT JOIN prendas pr ON dp.id_prenda = pr.id_prenda
            LEFT JOIN (
                SELECT id_pedido, SUM(monto_pago) as total_pagado FROM pagos GROUP BY id_pedido
            ) pagos_res ON p.id_pedido = pagos_res.id_pedido
            WHERE p.id_cliente = ANY($1::int[])
            ORDER BY p.fecha_entrega ASC;
        `;
        const resultado = await db.query(query, [idsClienteArray]);
        return resultado.rows;
    },

    /**
     * Obtiene los datos completos de un pedido por su ID con sus detalles y pagos.
     */
    obtenerPedidoPorId: async (id_pedido) => {
        const query = `
            SELECT p.*,
                   ep.nombre_estado as estado,
                   COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social) as cliente,
                   COALESCE(dcp.telefono, dci.telefono_contacto) as telefono_whatsapp,
                   cl.correo_electronico as cliente_correo,
                   -- Prenda y detalles
                   pr.tipo_prenda, pr.color, pr.tipo_prenda as prenda,
                   dp.id_detalle, dp.cantidad, dp.subtotal,
                   nd.notas_diseno,
                   -- Medidas
                   ma.cortas, ma.cintura, ma.frente, ma.alto_cadera, ma.cadera, ma.entre_busto, ma.busto, ma.espalda, ma.hombro,
                   mc.talla,
                   -- Finanzas
                   COALESCE(pagos_res.total_pagado, 0) as adelanto,
                   (p.costo_total - COALESCE(pagos_res.total_pagado, 0)) as saldo
            FROM pedidos p
            JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
            JOIN clientes cl ON p.id_cliente = cl.id_cliente
            LEFT JOIN datos_cliente_persona dcp ON cl.id_cliente = dcp.id_cliente
            LEFT JOIN datos_cliente_institucional dci ON cl.id_cliente = dci.id_cliente
            LEFT JOIN LATERAL (
                SELECT id_detalle, id_prenda, cantidad, subtotal
                FROM detalle_pedido WHERE id_pedido = p.id_pedido LIMIT 1
            ) dp ON true
            LEFT JOIN prendas pr ON dp.id_prenda = pr.id_prenda
            LEFT JOIN notas_diseno_detalle nd ON dp.id_detalle = nd.id_detalle
            LEFT JOIN medidas_anatomicas ma ON dp.id_detalle = ma.id_detalle
            LEFT JOIN medidas_convencionales mc ON dp.id_detalle = mc.id_detalle
            LEFT JOIN (
                SELECT id_pedido, SUM(monto_pago) as total_pagado FROM pagos GROUP BY id_pedido
            ) pagos_res ON p.id_pedido = pagos_res.id_pedido
            WHERE p.id_pedido = $1;
        `;
        const res = await db.query(query, [id_pedido]);
        return res.rows[0] || null;
    },

    /**
     * Obtiene el cliente asociado a un pedido.
     */
    obtenerClienteDelPedido: async (idPedido) => {
        const resultado = await db.query(
            `SELECT c.id_cliente,
                    COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social) as nombre_completo,
                    COALESCE(dcp.telefono, dci.telefono_contacto) as telefono_whatsapp,
                    c.correo_electronico
             FROM pedidos p
             JOIN clientes c ON p.id_cliente = c.id_cliente
             LEFT JOIN datos_cliente_persona dcp ON c.id_cliente = dcp.id_cliente
             LEFT JOIN datos_cliente_institucional dci ON c.id_cliente = dci.id_cliente
             WHERE p.id_pedido = $1`,
            [idPedido]
        );
        return resultado.rows[0] || null;
    },

    /**
     * Métricas financieras y operativas del taller.
     */
    obtenerMetricas: async () => {
        const [pendientes, proximos, ingresos] = await Promise.all([
            db.query(
                `SELECT COUNT(*)::int AS total 
                 FROM pedidos p
                 JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
                 WHERE ep.nombre_estado IN ('Pendiente', 'Corte', 'Armado', 'Prueba')`
            ),
            db.query(
                `SELECT COUNT(*)::int AS total 
                 FROM pedidos p
                 JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
                 WHERE ep.nombre_estado != 'Entregado' AND ep.nombre_estado != 'Cancelado'
                   AND p.fecha_entrega BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '2 days'`
            ),
            db.query(
                `SELECT COALESCE(SUM(monto_pago), 0)::float AS total 
                 FROM pagos
                 WHERE DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_TIMESTAMP)`
            ),
        ]);

        return {
            pedidosPendientes: pendientes.rows[0].total,
            pedidosProximos48h: proximos.rows[0].total,
            ingresosMes: ingresos.rows[0].total,
        };
    },

    /**
     * Actualiza la información básica de un pedido.
     */
    actualizarPedidoBasico: async (id_pedido, datos) => {
        const { fecha_entrega, fecha_prueba, costo_total, adelanto } = datos;
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                `UPDATE pedidos
                 SET fecha_entrega = $1, fecha_prueba = $2, costo_total = $3
                 WHERE id_pedido = $4`,
                [fecha_entrega, fecha_prueba || null, parseFloat(costo_total), id_pedido]
            );

            // Si se suministra nuevo abono/adelanto adicional
            if (parseFloat(adelanto) > 0) {
                await client.query(
                    `INSERT INTO pagos (id_pedido, id_estado_pago, id_metodo_pago, monto_pago)
                     VALUES ($1, 2, 1, $2)`,
                    [id_pedido, parseFloat(adelanto)]
                );
            }

            await client.query('COMMIT');
            return PedidoModel.obtenerPedidoPorId(id_pedido);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Salda cualquier monto restante y marca el pedido como 'Entregado'.
     */
    saldarYEntregar: async (id_pedido) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const pedRes = await client.query('SELECT costo_total FROM pedidos WHERE id_pedido = $1', [id_pedido]);
            if (pedRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }

            const costoTotal = parseFloat(pedRes.rows[0].costo_total);

            // Total ya pagado
            const pagosRes = await client.query('SELECT COALESCE(SUM(monto_pago), 0) as pagado FROM pagos WHERE id_pedido = $1', [id_pedido]);
            const yaPagado = parseFloat(pagosRes.rows[0].pagado);
            const restante = costoTotal - yaPagado;

            // Si hay saldo pendiente, registrar pago de finiquito
            if (restante > 0) {
                await client.query(
                    `INSERT INTO pagos (id_pedido, id_estado_pago, id_metodo_pago, monto_pago)
                     VALUES ($1, 3, 1, $2)`,
                    [id_pedido, restante]
                );
            }

            // Marcar todos los pagos de este pedido como completados
            await client.query('UPDATE pagos SET id_estado_pago = 3 WHERE id_pedido = $1', [id_pedido]);

            // Actualizar estado del pedido a 'Entregado' (id 6)
            let idEstadoEntregado = 6;
            const estRes = await client.query("SELECT id_estado_pedido FROM estados_pedido WHERE nombre_estado = 'Entregado'");
            if (estRes.rows.length > 0) idEstadoEntregado = estRes.rows[0].id_estado_pedido;

            await client.query('UPDATE pedidos SET id_estado_pedido = $1 WHERE id_pedido = $2', [idEstadoEntregado, id_pedido]);

            await client.query('COMMIT');
            return PedidoModel.obtenerPedidoPorId(id_pedido);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = PedidoModel;
