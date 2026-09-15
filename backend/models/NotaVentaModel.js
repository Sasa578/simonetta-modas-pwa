const db = require('../config/db');

const NotaVentaModel = {
    /**
     * Genera una fotografía inmutable (Nota de Venta) para un pedido finalizado o entregado.
     * Si la nota ya fue emitida con anterioridad, se devuelve el registro existente sin alterar montos.
     */
    generarNotaVenta: async ({ id_pedido, id_descuento = null }) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Verificar si ya existe una nota de venta para este pedido
            const existente = await client.query('SELECT id_nota_venta FROM notas_venta WHERE id_pedido = $1', [id_pedido]);
            if (existente.rows.length > 0) {
                await client.query('COMMIT');
                return NotaVentaModel.obtenerNotaPorId(existente.rows[0].id_nota_venta);
            }

            // 2. Obtener el pedido y su costo total
            const pedRes = await client.query(
                `SELECT p.id_pedido, p.costo_total, p.id_cliente,
                        cl.id_tipo_cliente, tc.nombre_tipo as tipo_cliente
                 FROM pedidos p
                 JOIN clientes cl ON p.id_cliente = cl.id_cliente
                 JOIN tipo_cliente tc ON cl.id_tipo_cliente = tc.id_tipo_cliente
                 WHERE p.id_pedido = $1`,
                [id_pedido]
            );

            if (pedRes.rows.length === 0) {
                throw new Error(`Pedido #${id_pedido} no encontrado.`);
            }

            const pedido = pedRes.rows[0];
            const subtotal = parseFloat(pedido.costo_total || 0);

            // 3. Aplicar descuento si corresponde
            let porcentajeDescuento = 0;
            let idDescFinal = id_descuento ? Number(id_descuento) : null;

            // Si no se pasó id_descuento explícito pero el cliente es Institucional, buscar si hay descuento corporativo
            if (!idDescFinal && pedido.id_tipo_cliente === 2) {
                const descCorp = await client.query('SELECT id_descuento, porcentaje FROM descuentos WHERE id_tipo_cliente = 2 LIMIT 1');
                if (descCorp.rows.length > 0) {
                    idDescFinal = descCorp.rows[0].id_descuento;
                    porcentajeDescuento = parseFloat(descCorp.rows[0].porcentaje);
                }
            } else if (idDescFinal) {
                const descRes = await client.query('SELECT porcentaje FROM descuentos WHERE id_descuento = $1', [idDescFinal]);
                if (descRes.rows.length > 0) {
                    porcentajeDescuento = parseFloat(descRes.rows[0].porcentaje);
                }
            }

            const montoDescuento = subtotal * (porcentajeDescuento / 100);
            const totalFinal = Math.max(0, subtotal - montoDescuento);

            // 4. Generar número de nota correlativo inmutable
            const countRes = await client.query('SELECT COUNT(*)::int as total FROM notas_venta');
            const total = countRes.rows[0].total + 1;
            const año = new Date().getFullYear();
            const numeroNota = `NV-${año}-${String(total).padStart(5, '0')}`;

            // 5. Insertar nota de venta inmutable
            const insertRes = await client.query(
                `INSERT INTO notas_venta (
                    id_pedido, id_descuento, numero_nota, fecha_emision, subtotal, total_final, estado_envio_correo
                 ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, 'Generada')
                 RETURNING id_nota_venta`,
                [id_pedido, idDescFinal, numeroNota, subtotal, totalFinal]
            );
            const idNotaVenta = insertRes.rows[0].id_nota_venta;

            await client.query('COMMIT');

            return NotaVentaModel.obtenerNotaPorId(idNotaVenta);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Obtiene una Nota de Venta por su ID con datos del cliente, prendas y desglose financiero.
     */
    obtenerNotaPorId: async (id_nota_venta) => {
        const query = `
            SELECT nv.id_nota_venta, nv.numero_nota, nv.fecha_emision, nv.subtotal, nv.total_final,
                   nv.estado_envio_correo,
                   d.id_descuento, d.nombre_descuento, d.porcentaje as porcentaje_descuento,
                   -- Datos del Pedido
                   p.id_pedido, p.fecha_inicio as fecha_pedido, p.fecha_entrega,
                   ep.nombre_estado as estado_pedido,
                   -- Cliente
                   cl.id_cliente, cl.correo_electronico as cliente_correo,
                   tc.id_tipo_cliente, tc.nombre_tipo as tipo_cliente,
                   COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social) as cliente,
                   dcp.telefono as cliente_telefono,
                   dci.nit, dci.nombre_contacto, dci.telefono_contacto,
                   -- Prenda
                   pr.tipo_prenda, pr.color,
                   dp.cantidad, dp.subtotal as subtotal_prenda,
                   nd.notas_diseno,
                   -- Pagos acumulados
                   COALESCE(pagos_res.total_pagado, 0) as total_pagado
            FROM notas_venta nv
            JOIN pedidos p ON nv.id_pedido = p.id_pedido
            JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
            JOIN clientes cl ON p.id_cliente = cl.id_cliente
            JOIN tipo_cliente tc ON cl.id_tipo_cliente = tc.id_tipo_cliente
            LEFT JOIN datos_cliente_persona dcp ON cl.id_cliente = dcp.id_cliente
            LEFT JOIN datos_cliente_institucional dci ON cl.id_cliente = dci.id_cliente
            LEFT JOIN descuentos d ON nv.id_descuento = d.id_descuento
            LEFT JOIN LATERAL (
                SELECT id_detalle, id_prenda, cantidad, subtotal
                FROM detalle_pedido WHERE id_pedido = p.id_pedido LIMIT 1
            ) dp ON true
            LEFT JOIN prendas pr ON dp.id_prenda = pr.id_prenda
            LEFT JOIN notas_diseno_detalle nd ON dp.id_detalle = nd.id_detalle
            LEFT JOIN (
                SELECT id_pedido, SUM(monto_pago) as total_pagado FROM pagos GROUP BY id_pedido
            ) pagos_res ON p.id_pedido = pagos_res.id_pedido
            WHERE nv.id_nota_venta = $1;
        `;
        const res = await db.query(query, [id_nota_venta]);
        return res.rows[0] || null;
    },

    /**
     * Obtiene una Nota de Venta por ID de Pedido.
     */
    obtenerNotaPorPedido: async (id_pedido) => {
        const check = await db.query('SELECT id_nota_venta FROM notas_venta WHERE id_pedido = $1', [id_pedido]);
        if (check.rows.length === 0) return null;
        return NotaVentaModel.obtenerNotaPorId(check.rows[0].id_nota_venta);
    },

    /**
     * Lista todas las notas de venta emitidas en el taller.
     */
    obtenerNotasVenta: async () => {
        const query = `
            SELECT nv.id_nota_venta, nv.numero_nota, nv.fecha_emision, nv.subtotal, nv.total_final,
                   nv.estado_envio_correo,
                   nv.id_pedido,
                   COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social) as cliente,
                   cl.correo_electronico as cliente_correo,
                   tc.nombre_tipo as tipo_cliente,
                   d.nombre_descuento, d.porcentaje as porcentaje_descuento,
                   pr.tipo_prenda as prenda,
                   ep.nombre_estado as estado_pedido
            FROM notas_venta nv
            JOIN pedidos p ON nv.id_pedido = p.id_pedido
            JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
            JOIN clientes cl ON p.id_cliente = cl.id_cliente
            JOIN tipo_cliente tc ON cl.id_tipo_cliente = tc.id_tipo_cliente
            LEFT JOIN datos_cliente_persona dcp ON cl.id_cliente = dcp.id_cliente
            LEFT JOIN datos_cliente_institucional dci ON cl.id_cliente = dci.id_cliente
            LEFT JOIN descuentos d ON nv.id_descuento = d.id_descuento
            LEFT JOIN LATERAL (
                SELECT id_prenda FROM detalle_pedido WHERE id_pedido = p.id_pedido LIMIT 1
            ) dp ON true
            LEFT JOIN prendas pr ON dp.id_prenda = pr.id_prenda
            ORDER BY nv.fecha_emision DESC, nv.id_nota_venta DESC;
        `;
        const res = await db.query(query);
        return res.rows;
    },

    /**
     * Catálogo de descuentos parametrizados.
     */
    obtenerDescuentos: async () => {
        const res = await db.query(`
            SELECT d.*, tc.nombre_tipo as tipo_cliente
            FROM descuentos d
            LEFT JOIN tipo_cliente tc ON d.id_tipo_cliente = tc.id_tipo_cliente
            ORDER BY d.id_descuento ASC
        `);
        return res.rows;
    }
};

module.exports = NotaVentaModel;
