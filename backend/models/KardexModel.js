const db = require('../config/db');

const KardexModel = {
    /**
     * Registra un movimiento transaccional en el Kardex y actualiza el stock del almacén
     * respetando el origen de la materia prima (Taller vs Cliente).
     */
    registrarMovimiento: async ({
        id_producto,
        id_tipo_movimiento,
        cantidad,
        id_origen = 1, // 1: Taller, 2: Cliente
        id_proveedor = null,
        id_detalle_pedido = null,
        observacion = null
    }) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const cant = parseFloat(cantidad);
            if (isNaN(cant) || cant <= 0) {
                throw new Error('La cantidad del movimiento debe ser un número positivo.');
            }

            // 1. Obtener producto para verificar existencia
            const prodRes = await client.query('SELECT * FROM productos_almacen WHERE id_producto = $1', [id_producto]);
            if (prodRes.rows.length === 0) {
                throw new Error(`Producto #${id_producto} no encontrado en el almacén.`);
            }
            const producto = prodRes.rows[0];
            const stockActual = parseFloat(producto.cantidad_stock);

            // 2. Resolver tipo de movimiento
            let idTipo = Number(id_tipo_movimiento);
            if (isNaN(idTipo)) {
                const tipoRes = await client.query('SELECT id_tipo_movimiento FROM tipos_movimiento WHERE LOWER(nombre_movimiento) = LOWER($1)', [id_tipo_movimiento]);
                if (tipoRes.rows.length > 0) idTipo = tipoRes.rows[0].id_tipo_movimiento;
            }

            // 3. Si el material pertenece al TALLER (id_origen = 1), afecta el stock
            if (Number(id_origen) === 1) {
                if (idTipo === 1 || idTipo === 4) {
                    // Entrada por Compra (1) o Devolución de Sobrante (4) -> Aumenta stock
                    await client.query(
                        `UPDATE productos_almacen 
                         SET cantidad_stock = cantidad_stock + $1 
                         WHERE id_producto = $2`,
                        [cant, id_producto]
                    );
                } else if (idTipo === 2) {
                    // Salida por Confección (2) -> Reduce stock con validación de suficiencia
                    if (stockActual < cant) {
                        throw new Error(`Stock insuficiente para el insumo. Stock disponible: ${stockActual}, solicitado: ${cant}`);
                    }
                    await client.query(
                        `UPDATE productos_almacen 
                         SET cantidad_stock = cantidad_stock - $1 
                         WHERE id_producto = $2`,
                        [cant, id_producto]
                    );
                } else if (idTipo === 3) {
                    // Ajuste de Inventario (3) -> Sobrescribe con la nueva cantidad física inventariada
                    await client.query(
                        `UPDATE productos_almacen 
                         SET cantidad_stock = $1 
                         WHERE id_producto = $2`,
                        [cant, id_producto]
                    );
                }
            } else {
                // id_origen = 2 (Cliente): Se protege el inventario general del taller,
                // solo se audita el consumo físico de la tela entregada por el cliente.
            }

            // 4. Registrar en movimientos_almacen
            const movRes = await client.query(
                `INSERT INTO movimientos_almacen (
                    id_producto, id_proveedor, id_detalle_pedido, id_tipo_movimiento, id_origen, cantidad, fecha_movimiento
                 ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [id_producto, id_proveedor || null, id_detalle_pedido || null, idTipo, Number(id_origen), cant]
            );
            const movimiento = movRes.rows[0];

            // 5. Registrar observaciones si existen
            if (observacion && observacion.trim()) {
                await client.query(
                    `INSERT INTO observaciones_movimiento (id_movimiento, observacion)
                     VALUES ($1, $2)`,
                    [movimiento.id_movimiento, observacion.trim()]
                );
            }

            await client.query('COMMIT');

            return KardexModel.obtenerMovimientoPorId(movimiento.id_movimiento);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Obtiene el detalle de un movimiento por su ID con todos los JOINs.
     */
    obtenerMovimientoPorId: async (id_movimiento) => {
        const query = `
            SELECT m.id_movimiento, m.id_producto, m.cantidad, m.fecha_movimiento,
                   p.nombre_articulo, p.nombre_articulo as nombre_material,
                   p.cantidad_stock as stock_resultante,
                   tp.nombre_tipo as tipo_producto,
                   ca.nombre_categoria as categoria,
                   um.abreviatura as unidad_medida,
                   col.nombre_color as color, col.codigo_hexadecimal,
                   tm.id_tipo_movimiento, tm.nombre_movimiento as tipo_movimiento,
                   om.id_origen, om.nombre_origen as origen_material,
                   pr.id_proveedor, pr.nombre_empresa as proveedor,
                   m.id_detalle_pedido,
                   dp.id_pedido,
                   obs.observacion
            FROM movimientos_almacen m
            JOIN productos_almacen p ON m.id_producto = p.id_producto
            JOIN tipos_producto tp ON p.id_tipo_producto = tp.id_tipo_producto
            JOIN categorias_almacen ca ON tp.id_categoria = ca.id_categoria
            JOIN unidades_medida um ON p.id_unidad_medida = um.id_unidad_medida
            LEFT JOIN colores col ON p.id_color = col.id_color
            JOIN tipos_movimiento tm ON m.id_tipo_movimiento = tm.id_tipo_movimiento
            JOIN origenes_material om ON m.id_origen = om.id_origen
            LEFT JOIN proveedores pr ON m.id_proveedor = pr.id_proveedor
            LEFT JOIN detalle_pedido dp ON m.id_detalle_pedido = dp.id_detalle
            LEFT JOIN observaciones_movimiento obs ON m.id_movimiento = obs.id_movimiento
            WHERE m.id_movimiento = $1;
        `;
        const res = await db.query(query, [id_movimiento]);
        return res.rows[0] || null;
    },

    /**
     * Obtiene el listado de movimientos para auditoría Kardex con filtros opcionales.
     */
    obtenerMovimientos: async ({ id_producto, id_tipo_movimiento, id_origen, limite = 100 } = {}) => {
        let whereClauses = [];
        let params = [];

        if (id_producto) {
            params.push(id_producto);
            whereClauses.push(`m.id_producto = $${params.length}`);
        }

        if (id_tipo_movimiento) {
            params.push(id_tipo_movimiento);
            whereClauses.push(`m.id_tipo_movimiento = $${params.length}`);
        }

        if (id_origen) {
            params.push(id_origen);
            whereClauses.push(`m.id_origen = $${params.length}`);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        params.push(limite);

        const query = `
            SELECT m.id_movimiento, m.id_producto, m.cantidad, m.fecha_movimiento,
                   p.nombre_articulo, p.nombre_articulo as nombre_material,
                   p.cantidad_stock as stock_actual,
                   tp.nombre_tipo as tipo_producto,
                   ca.nombre_categoria as categoria,
                   um.abreviatura as unidad_medida,
                   col.nombre_color as color, col.codigo_hexadecimal,
                   tm.id_tipo_movimiento, tm.nombre_movimiento as tipo_movimiento,
                   om.id_origen, om.nombre_origen as origen_material,
                   pr.id_proveedor, pr.nombre_empresa as proveedor,
                   m.id_detalle_pedido,
                   dp.id_pedido,
                   obs.observacion
            FROM movimientos_almacen m
            JOIN productos_almacen p ON m.id_producto = p.id_producto
            JOIN tipos_producto tp ON p.id_tipo_producto = tp.id_tipo_producto
            JOIN categorias_almacen ca ON tp.id_categoria = ca.id_categoria
            JOIN unidades_medida um ON p.id_unidad_medida = um.id_unidad_medida
            LEFT JOIN colores col ON p.id_color = col.id_color
            JOIN tipos_movimiento tm ON m.id_tipo_movimiento = tm.id_tipo_movimiento
            JOIN origenes_material om ON m.id_origen = om.id_origen
            LEFT JOIN proveedores pr ON m.id_proveedor = pr.id_proveedor
            LEFT JOIN detalle_pedido dp ON m.id_detalle_pedido = dp.id_detalle
            LEFT JOIN observaciones_movimiento obs ON m.id_movimiento = obs.id_movimiento
            ${whereSql}
            ORDER BY m.fecha_movimiento DESC, m.id_movimiento DESC
            LIMIT $${params.length};
        `;

        const res = await db.query(query, params);
        return res.rows;
    },

    /**
     * Catálogos requeridos para registrar movimientos de Kardex.
     */
    obtenerCatalogos: async () => {
        const [tiposMov, origenes, proveedores, insumos] = await Promise.all([
            db.query('SELECT * FROM tipos_movimiento ORDER BY id_tipo_movimiento'),
            db.query('SELECT * FROM origenes_material ORDER BY id_origen'),
            db.query('SELECT * FROM proveedores ORDER BY nombre_empresa'),
            db.query(`
                SELECT p.id_producto, p.nombre_articulo, p.nombre_articulo as nombre_material,
                       p.cantidad_stock, p.cantidad_stock as cantidad_actual,
                       um.abreviatura as unidad_medida,
                       ca.nombre_categoria as categoria
                FROM productos_almacen p
                JOIN tipos_producto tp ON p.id_tipo_producto = tp.id_tipo_producto
                JOIN categorias_almacen ca ON tp.id_categoria = ca.id_categoria
                JOIN unidades_medida um ON p.id_unidad_medida = um.id_unidad_medida
                ORDER BY p.nombre_articulo
            `)
        ]);

        return {
            tipos_movimiento: tiposMov.rows,
            origenes_material: origenes.rows,
            proveedores: proveedores.rows,
            insumos: insumos.rows
        };
    },

    /**
     * Gestión de Proveedores
     */
    obtenerProveedores: async () => {
        const res = await db.query('SELECT * FROM proveedores ORDER BY id_proveedor ASC');
        return res.rows;
    },

    crearProveedor: async ({ nombre_empresa, nombre_contacto, telefono_contacto, direccion }) => {
        const res = await db.query(
            `INSERT INTO proveedores (nombre_empresa, nombre_contacto, telefono_contacto, direccion)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nombre_empresa, nombre_contacto || null, telefono_contacto || null, direccion || null]
        );
        return res.rows[0];
    }
};

module.exports = KardexModel;
