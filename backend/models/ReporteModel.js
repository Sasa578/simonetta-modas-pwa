const db = require('../config/db');

const ReporteModel = {
    /**
     * Obtiene los datos consolidados del taller para un rango de fechas o periodo específico:
     * - Balance financiero (recaudación desglosada por Efectivo y QR).
     * - Cartera de deudas / saldos por cobrar de clientes.
     * - Lista y resumen de pedidos del periodo.
     * - Auditoría de movimientos de almacén y alertas de stock mínimo.
     */
    obtenerReporteTaller: async ({ fechaInicio, fechaFin, mes, anio }) => {
        let fInicio, fFin, periodoTexto;

        const hoy = new Date();
        const añoActual = anio ? parseInt(anio, 10) : hoy.getFullYear();

        if (mes) {
            const mesNum = parseInt(mes, 10);
            fInicio = new Date(añoActual, mesNum - 1, 1, 0, 0, 0);
            fFin = new Date(añoActual, mesNum, 0, 23, 59, 59);
            const nombreMes = fInicio.toLocaleString('es-BO', { month: 'long' });
            periodoTexto = `${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} ${añoActual}`;
        } else if (fechaInicio && fechaFin) {
            fInicio = new Date(`${fechaInicio}T00:00:00`);
            fFin = new Date(`${fechaFin}T23:59:59`);
            periodoTexto = `${fInicio.toLocaleDateString('es-BO')} al ${fFin.toLocaleDateString('es-BO')}`;
        } else {
            // Por defecto: Primer día del mes actual hasta el momento actual
            fInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1, 0, 0, 0);
            fFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
            const nombreMes = hoy.toLocaleString('es-BO', { month: 'long' });
            periodoTexto = `${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} ${hoy.getFullYear()}`;
        }

        // 1. Consulta de Pedidos en el Periodo
        const pedidosQuery = `
            SELECT p.id_pedido, p.fecha_inicio as fecha_pedido, p.fecha_prueba, p.fecha_entrega,
                   p.costo_total,
                   ep.id_estado_pedido, ep.nombre_estado as estado,
                   COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social, 'Cliente Particular') as cliente,
                   COALESCE(dcp.telefono, dci.telefono_contacto, '') as telefono_cliente,
                   cl.correo_electronico as correo_cliente,
                   pr.tipo_prenda as prenda, pr.color,
                   COALESCE(NULLIF(TRIM(CONCAT(du_cost.nombre, ' ', du_cost.apellido)), ''), u_cost.correo_electronico, 'Taller Simonetta') as costurera,
                   COALESCE(pagos_res.total_pagado, 0) as total_pagado,
                   GREATEST(0, p.costo_total - COALESCE(pagos_res.total_pagado, 0)) as saldo
            FROM pedidos p
            JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
            LEFT JOIN clientes cl ON p.id_cliente = cl.id_cliente
            LEFT JOIN datos_cliente_persona dcp ON cl.id_cliente = dcp.id_cliente
            LEFT JOIN datos_cliente_institucional dci ON cl.id_cliente = dci.id_cliente
            LEFT JOIN usuarios u_cost ON p.id_costurera = u_cost.id_usuario
            LEFT JOIN datos_usuario du_cost ON u_cost.id_usuario = du_cost.id_usuario
            LEFT JOIN LATERAL (
                SELECT dp.id_prenda FROM detalle_pedido dp WHERE dp.id_pedido = p.id_pedido ORDER BY dp.id_detalle ASC LIMIT 1
            ) det ON true
            LEFT JOIN prendas pr ON det.id_prenda = pr.id_prenda
            LEFT JOIN (
                SELECT id_pedido, SUM(monto_pago) as total_pagado FROM pagos GROUP BY id_pedido
            ) pagos_res ON p.id_pedido = pagos_res.id_pedido
            WHERE p.fecha_inicio BETWEEN $1 AND $2
            ORDER BY p.id_pedido DESC;
        `;
        const resPedidos = await db.query(pedidosQuery, [fInicio, fFin]);
        const pedidos = resPedidos.rows;

        // 2. Consulta de Ingresos Recaudados agrupados por Método de Pago (Efectivo vs QR)
        const pagosQuery = `
            SELECT mp.id_metodo_pago,
                   mp.nombre_metodo,
                   COALESCE(SUM(pg.monto_pago), 0) as total_recaudado,
                   COUNT(pg.id_pago)::int as cantidad_transacciones
            FROM metodos_pago mp
            LEFT JOIN pagos pg ON mp.id_metodo_pago = pg.id_metodo_pago 
                 AND pg.fecha_pago BETWEEN $1 AND $2
            GROUP BY mp.id_metodo_pago, mp.nombre_metodo
            ORDER BY mp.id_metodo_pago ASC;
        `;
        const resPagos = await db.query(pagosQuery, [fInicio, fFin]);
        const metodos = resPagos.rows;

        let totalEfectivo = 0;
        let totalQr = 0;
        let totalRecaudado = 0;

        metodos.forEach(m => {
            const monto = parseFloat(m.total_recaudado || 0);
            totalRecaudado += monto;
            const nombre = (m.nombre_metodo || '').toLowerCase();
            if (nombre.includes('efectivo')) {
                totalEfectivo += monto;
            } else {
                totalQr += monto;
            }
        });

        // 3. Consulta de Cuentas por Cobrar (Deudas activas de pedidos en cualquier fecha que tengan saldo pendiente)
        const deudasQuery = `
            SELECT p.id_pedido, p.fecha_inicio as fecha_pedido, p.fecha_entrega,
                   p.costo_total,
                   COALESCE(pagos_res.total_pagado, 0) as total_pagado,
                   (p.costo_total - COALESCE(pagos_res.total_pagado, 0)) as saldo,
                   COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social, 'Cliente') as cliente,
                   COALESCE(dcp.telefono, dci.telefono_contacto, 'Sin teléfono') as telefono,
                   cl.correo_electronico as correo,
                   pr.tipo_prenda as prenda,
                   ep.nombre_estado as estado
            FROM pedidos p
            JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
            LEFT JOIN clientes cl ON p.id_cliente = cl.id_cliente
            LEFT JOIN datos_cliente_persona dcp ON cl.id_cliente = dcp.id_cliente
            LEFT JOIN datos_cliente_institucional dci ON cl.id_cliente = dci.id_cliente
            LEFT JOIN LATERAL (
                SELECT id_prenda FROM detalle_pedido WHERE id_pedido = p.id_pedido LIMIT 1
            ) dp ON true
            LEFT JOIN prendas pr ON dp.id_prenda = pr.id_prenda
            LEFT JOIN (
                SELECT id_pedido, SUM(monto_pago) as total_pagado FROM pagos GROUP BY id_pedido
            ) pagos_res ON p.id_pedido = pagos_res.id_pedido
            WHERE (p.costo_total - COALESCE(pagos_res.total_pagado, 0)) > 0
              AND ep.nombre_estado != 'Cancelado'
            ORDER BY saldo DESC;
        `;
        const resDeudas = await db.query(deudasQuery);
        const deudas = resDeudas.rows;
        const totalSaldosPendientes = deudas.reduce((acc, d) => acc + parseFloat(d.saldo || 0), 0);

        // 4. Consulta de Almacén: Insumos con alerta de Stock Mínimo
        const stockBajoQuery = `
            SELECT pa.id_producto, pa.nombre_articulo as nombre_material, pa.cantidad_stock, pa.stock_minimo,
                   ca.nombre_categoria as categoria, um.abreviatura as unidad
            FROM productos_almacen pa
            JOIN tipos_producto tp ON pa.id_tipo_producto = tp.id_tipo_producto
            JOIN categorias_almacen ca ON tp.id_categoria = ca.id_categoria
            JOIN unidades_medida um ON pa.id_unidad_medida = um.id_unidad_medida
            WHERE pa.cantidad_stock <= pa.stock_minimo
            ORDER BY (pa.cantidad_stock - pa.stock_minimo) ASC;
        `;
        const resStockBajo = await db.query(stockBajoQuery);
        const bajoStock = resStockBajo.rows;

        // 5. Consulta de Almacén: Movimientos ocurridos en el Periodo
        const movsQuery = `
            SELECT m.id_movimiento, m.fecha_movimiento, m.cantidad,
                   obs.observacion,
                   tm.id_tipo_movimiento, tm.nombre_movimiento as tipo_movimiento,
                   pa.nombre_articulo as nombre_material,
                   pr.nombre_empresa as proveedor
            FROM movimientos_almacen m
            JOIN tipos_movimiento tm ON m.id_tipo_movimiento = tm.id_tipo_movimiento
            JOIN productos_almacen pa ON m.id_producto = pa.id_producto
            LEFT JOIN proveedores pr ON m.id_proveedor = pr.id_proveedor
            LEFT JOIN observaciones_movimiento obs ON m.id_movimiento = obs.id_movimiento
            WHERE m.fecha_movimiento BETWEEN $1 AND $2
            ORDER BY m.fecha_movimiento DESC;
        `;
        const resMovs = await db.query(movsQuery, [fInicio, fFin]);
        const movimientos = resMovs.rows;

        // Cálculos de KPIs consolidados
        const totalPedidos = pedidos.length;
        const pedidosEntregados = pedidos.filter(p => p.estado === 'Terminado' || p.estado === 'Entregado').length;
        const pedidosEnProceso = pedidos.filter(p => p.estado !== 'Terminado' && p.estado !== 'Entregado' && p.estado !== 'Cancelado').length;
        const totalFacturado = pedidos.reduce((acc, p) => acc + parseFloat(p.costo_total || 0), 0);

        return {
            periodo: periodoTexto,
            fecha_inicio: fInicio.toISOString(),
            fecha_fin: fFin.toISOString(),
            kpis: {
                total_pedidos: totalPedidos,
                pedidos_entregados: pedidosEntregados,
                pedidos_en_proceso: pedidosEnProceso,
                total_facturado: totalFacturado,
                total_recaudado: totalRecaudado,
                total_efectivo: totalEfectivo,
                total_qr: totalQr,
                total_saldos_pendientes: totalSaldosPendientes,
                pedidos_con_deuda: deudas.length,
                items_bajo_stock: bajoStock.length,
                movimientos_almacen: movimientos.length
            },
            metodos_pago: metodos,
            pedidos,
            deudas,
            bajo_stock: bajoStock,
            movimientos
        };
    },

    /**
     * Obtiene todos los datos requeridos para emitir y renderizar la Nota de Venta (PDF) de un pedido:
     * - Datos del cliente, CI/NIT, teléfono, correo.
     * - Prenda, costurera, especificaciones y notas de diseño.
     * - Medidas (anatómicas o talla convencional).
     * - Cronograma de fechas tipo factura (recepción, prueba, entrega).
     * - Desglose financiero: costo, abonos detallados con fecha y método (Efectivo/QR), saldo.
     * - Garantiza la existencia del registro en notas_venta y retorna el número correlativo.
     */
    obtenerDatosCompletosNotaVenta: async (id_pedido) => {
        // 1. Obtener pedido base y cliente
        const pedQuery = `
            SELECT p.id_pedido, p.fecha_inicio as fecha_pedido, p.fecha_prueba, p.fecha_entrega,
                   p.costo_total, p.id_cliente, p.id_costurera,
                   ep.nombre_estado as estado,
                   -- Cliente
                   cl.correo_electronico as cliente_correo,
                   COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social, 'Cliente Particular') as cliente,
                   COALESCE(
                       (SELECT valor_atributo FROM atributos_cliente WHERE id_cliente = cl.id_cliente AND (LOWER(nombre_atributo) = 'carnet_identidad' OR LOWER(nombre_atributo) = 'ci') LIMIT 1),
                       dci.nit,
                       'S/N'
                   ) as ci_nit,
                   COALESCE(dcp.telefono, dci.telefono_contacto, '') as telefono,
                   -- Costurera
                   COALESCE(NULLIF(TRIM(CONCAT(du_cost.nombre, ' ', du_cost.apellido)), ''), u_cost.correo_electronico, 'Taller Simonetta Modas') as costurera,
                   -- Prenda principal
                   pr.id_prenda, pr.tipo_prenda as prenda, pr.color,
                   dp.id_detalle,
                   nd.notas_diseno,
                   -- Medidas Convencionales
                   mc.talla,
                   -- Medidas Anatómicas
                   ma.busto, ma.cintura, ma.cadera, ma.espalda, ma.hombro, ma.cortas
            FROM pedidos p
            JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
            JOIN clientes cl ON p.id_cliente = cl.id_cliente
            LEFT JOIN datos_cliente_persona dcp ON cl.id_cliente = dcp.id_cliente
            LEFT JOIN datos_cliente_institucional dci ON cl.id_cliente = dci.id_cliente
            LEFT JOIN usuarios u_cost ON p.id_costurera = u_cost.id_usuario
            LEFT JOIN datos_usuario du_cost ON u_cost.id_usuario = du_cost.id_usuario
            LEFT JOIN LATERAL (
                SELECT dp.id_detalle, dp.id_prenda FROM detalle_pedido dp WHERE dp.id_pedido = p.id_pedido ORDER BY dp.id_detalle ASC LIMIT 1
            ) dp ON true
            LEFT JOIN prendas pr ON dp.id_prenda = pr.id_prenda
            LEFT JOIN notas_diseno_detalle nd ON dp.id_detalle = nd.id_detalle
            LEFT JOIN medidas_convencionales mc ON dp.id_detalle = mc.id_detalle
            LEFT JOIN medidas_anatomicas ma ON dp.id_detalle = ma.id_detalle
            WHERE p.id_pedido = $1;
        `;
        const resPed = await db.query(pedQuery, [id_pedido]);
        if (resPed.rows.length === 0) {
            throw new Error(`Pedido #${id_pedido} no encontrado.`);
        }
        const pedido = resPed.rows[0];

        // 2. Obtener lista detallada de pagos con método
        const pagosQuery = `
            SELECT pg.id_pago, pg.monto_pago, pg.fecha_pago,
                   mp.nombre_metodo as metodo
            FROM pagos pg
            JOIN metodos_pago mp ON pg.id_metodo_pago = mp.id_metodo_pago
            WHERE pg.id_pedido = $1
            ORDER BY pg.fecha_pago ASC, pg.id_pago ASC;
        `;
        const resPagos = await db.query(pagosQuery, [id_pedido]);
        const pagos = resPagos.rows;

        const totalPagado = pagos.reduce((acc, p) => acc + parseFloat(p.monto_pago || 0), 0);
        const subtotal = parseFloat(pedido.costo_total || 0);
        const saldo = Math.max(0, subtotal - totalPagado);

        // 3. Garantizar registro en notas_venta
        let numeroNota;
        let fechaEmision = new Date();

        const checkNota = await db.query('SELECT id_nota_venta, numero_nota, fecha_emision FROM notas_venta WHERE id_pedido = $1', [id_pedido]);
        if (checkNota.rows.length > 0) {
            numeroNota = checkNota.rows[0].numero_nota;
            fechaEmision = checkNota.rows[0].fecha_emision;
        } else {
            const countRes = await db.query('SELECT COUNT(*)::int as total FROM notas_venta');
            const total = (countRes.rows[0]?.total || 0) + 1;
            const año = new Date().getFullYear();
            numeroNota = `NV-${año}-${String(total).padStart(5, '0')}`;

            await db.query(
                `INSERT INTO notas_venta (
                    id_pedido, numero_nota, fecha_emision, subtotal, total_final, estado_envio_correo
                 ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, 'Generada')
                 ON CONFLICT (id_pedido) DO NOTHING`,
                [id_pedido, numeroNota, subtotal, subtotal]
            );
        }

        return {
            ...pedido,
            numero_nota: numeroNota,
            fecha_emision: fechaEmision,
            total_pagado: totalPagado,
            saldo: saldo,
            pagos: pagos
        };
    }
};

module.exports = ReporteModel;
