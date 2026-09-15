const db = require('../config/db');

const AlmacenModel = {
    /**
     * Obtiene todos los catálogos auxiliares para el módulo de almacén.
     */
    obtenerCatalogos: async () => {
        const [categorias, tipos, unidades, colores, materiales] = await Promise.all([
            db.query('SELECT id_categoria, nombre_categoria FROM categorias_almacen ORDER BY id_categoria'),
            db.query('SELECT id_tipo_producto, id_categoria, nombre_tipo FROM tipos_producto ORDER BY id_tipo_producto'),
            db.query('SELECT id_unidad_medida, abreviatura, descripcion FROM unidades_medida ORDER BY id_unidad_medida'),
            db.query('SELECT id_color, nombre_color, codigo_hexadecimal FROM colores ORDER BY nombre_color'),
            db.query('SELECT id_material_base, nombre_material FROM materiales_base ORDER BY nombre_material')
        ]);

        return {
            categorias: categorias.rows,
            tipos: tipos.rows,
            unidades: unidades.rows,
            colores: colores.rows,
            materiales: materiales.rows
        };
    },

    /**
     * Obtiene todo el inventario uniendo catálogos y especificaciones.
     */
    obtenerInventario: async () => {
        const query = `
            SELECT pa.id_producto, pa.id_producto as id_material,
                   pa.nombre_articulo, pa.nombre_articulo as nombre_material, pa.nombre_articulo as producto,
                   pa.cantidad_stock, pa.cantidad_stock as cantidad_actual, pa.cantidad_stock as stock,
                   pa.stock_minimo, pa.stock_minimo as minimo,
                   -- Catálogos
                   tp.id_tipo_producto, tp.nombre_tipo,
                   ca.id_categoria, ca.nombre_categoria,
                   um.id_unidad_medida, um.abreviatura as unidad_medida, um.descripcion as unidad_descripcion,
                   col.id_color, col.nombre_color, col.codigo_hexadecimal,
                   mb.id_material_base, mb.nombre_material as material_base,
                   -- Especificaciones
                   et.grupo as tela_grupo, et.subgrupo as tela_subgrupo, et.textura as tela_textura, et.calidad as tela_calidad,
                   eb.tipo_boton, eb.tamano as boton_tamano,
                   eh.tipo_hilo, eh.grosor as hilo_grosor,
                   ec.tipo_cierre, ec.tamano as cierre_tamano
            FROM productos_almacen pa
            JOIN tipos_producto tp ON pa.id_tipo_producto = tp.id_tipo_producto
            JOIN categorias_almacen ca ON tp.id_categoria = ca.id_categoria
            JOIN unidades_medida um ON pa.id_unidad_medida = um.id_unidad_medida
            LEFT JOIN colores col ON pa.id_color = col.id_color
            LEFT JOIN materiales_base mb ON pa.id_material_base = mb.id_material_base
            LEFT JOIN esp_telas et ON pa.id_producto = et.id_producto
            LEFT JOIN esp_botones eb ON pa.id_producto = eb.id_producto
            LEFT JOIN esp_hilos eh ON pa.id_producto = eh.id_producto
            LEFT JOIN esp_cierres ec ON pa.id_producto = ec.id_producto
            ORDER BY pa.nombre_articulo ASC;
        `;
        const resultado = await db.query(query);
        return resultado.rows;
    },

    /**
     * Busca un producto por ID con sus especificaciones.
     */
    buscarPorId: async (id) => {
        const query = `
            SELECT pa.id_producto, pa.nombre_articulo, pa.cantidad_stock, pa.stock_minimo,
                   tp.id_tipo_producto, tp.nombre_tipo, ca.id_categoria, ca.nombre_categoria,
                   um.id_unidad_medida, um.abreviatura as unidad_medida,
                   col.id_color, col.nombre_color, col.codigo_hexadecimal,
                   mb.id_material_base, mb.nombre_material as material_base,
                   et.grupo as tela_grupo, et.subgrupo as tela_subgrupo, et.textura as tela_textura, et.calidad as tela_calidad,
                   eb.tipo_boton, eb.tamano as boton_tamano,
                   eh.tipo_hilo, eh.grosor as hilo_grosor,
                   ec.tipo_cierre, ec.tamano as cierre_tamano
            FROM productos_almacen pa
            JOIN tipos_producto tp ON pa.id_tipo_producto = tp.id_tipo_producto
            JOIN categorias_almacen ca ON tp.id_categoria = ca.id_categoria
            JOIN unidades_medida um ON pa.id_unidad_medida = um.id_unidad_medida
            LEFT JOIN colores col ON pa.id_color = col.id_color
            LEFT JOIN materiales_base mb ON pa.id_material_base = mb.id_material_base
            LEFT JOIN esp_telas et ON pa.id_producto = et.id_producto
            LEFT JOIN esp_botones eb ON pa.id_producto = eb.id_producto
            LEFT JOIN esp_hilos eh ON pa.id_producto = eh.id_producto
            LEFT JOIN esp_cierres ec ON pa.id_producto = ec.id_producto
            WHERE pa.id_producto = $1;
        `;
        const res = await db.query(query, [id]);
        return res.rows[0] || null;
    },

    /**
     * Crea un insumo en productos_almacen y su tabla de especificaciones.
     */
    crear: async ({
        nombre_articulo,
        nombre_material,
        cantidad_stock,
        cantidad_actual,
        stock_minimo,
        id_tipo_producto,
        id_unidad_medida,
        id_color,
        id_material_base,
        // Especificaciones
        especificaciones = {}
    }) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const nombre = nombre_articulo || nombre_material;
            const stock = parseFloat(cantidad_stock !== undefined ? cantidad_stock : cantidad_actual) || 0;
            const min = parseFloat(stock_minimo) || 0;

            // Determinar id_tipo_producto por defecto si no viene
            let resolvedTipoId = id_tipo_producto;
            if (!resolvedTipoId) {
                const tipoDefault = await client.query('SELECT id_tipo_producto FROM tipos_producto LIMIT 1');
                resolvedTipoId = tipoDefault.rows[0]?.id_tipo_producto || 1;
            }

            // Determinar id_unidad_medida por defecto si no viene
            let resolvedUnidadId = id_unidad_medida;
            if (!resolvedUnidadId) {
                const unidadDefault = await client.query("SELECT id_unidad_medida FROM unidades_medida WHERE abreviatura = 'm' OR abreviatura = 'u' LIMIT 1");
                resolvedUnidadId = unidadDefault.rows[0]?.id_unidad_medida || 1;
            }

            const prodRes = await client.query(
                `INSERT INTO productos_almacen 
                 (id_tipo_producto, id_unidad_medida, id_color, id_material_base, nombre_articulo, cantidad_stock, stock_minimo)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id_producto`,
                [resolvedTipoId, resolvedUnidadId, id_color || null, id_material_base || null, nombre, stock, min]
            );

            const idProducto = prodRes.rows[0].id_producto;

            // Identificar categoría del tipo_producto
            const catRes = await client.query(
                `SELECT ca.nombre_categoria 
                 FROM tipos_producto tp 
                 JOIN categorias_almacen ca ON tp.id_categoria = ca.id_categoria 
                 WHERE tp.id_tipo_producto = $1`,
                [resolvedTipoId]
            );
            const nombreCategoria = (catRes.rows[0]?.nombre_categoria || '').toLowerCase();

            // Insertar en tabla de especificación según categoría
            if (nombreCategoria.includes('tela')) {
                await client.query(
                    `INSERT INTO esp_telas (id_producto, grupo, subgrupo, textura, calidad)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [idProducto, especificaciones.grupo || 'General', especificaciones.subgrupo || null, especificaciones.textura || null, especificaciones.calidad || null]
                );
            } else if (nombreCategoria.includes('botón') || nombreCategoria.includes('boton')) {
                await client.query(
                    `INSERT INTO esp_botones (id_producto, tipo_boton, tamano)
                     VALUES ($1, $2, $3)`,
                    [idProducto, especificaciones.tipo_boton || 'Estándar', especificaciones.tamano || null]
                );
            } else if (nombreCategoria.includes('hilo')) {
                await client.query(
                    `INSERT INTO esp_hilos (id_producto, tipo_hilo, grosor)
                     VALUES ($1, $2, $3)`,
                    [idProducto, especificaciones.tipo_hilo || 'Poliéster', especificaciones.grosor || null]
                );
            } else if (nombreCategoria.includes('cierre')) {
                await client.query(
                    `INSERT INTO esp_cierres (id_producto, tipo_cierre, tamano)
                     VALUES ($1, $2, $3)`,
                    [idProducto, especificaciones.tipo_cierre || 'Invisible', especificaciones.tamano || null]
                );
            }

            await client.query('COMMIT');
            return AlmacenModel.buscarPorId(idProducto);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Actualiza un insumo y sus especificaciones.
     */
    actualizar: async (id, datos) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const sets = [];
            const vals = [];
            let idx = 1;

            const nombre = datos.nombre_articulo || datos.nombre_material;
            const stock = datos.cantidad_stock !== undefined ? datos.cantidad_stock : datos.cantidad_actual;

            if (nombre !== undefined) { sets.push(`nombre_articulo = $${idx++}`); vals.push(nombre); }
            if (stock !== undefined) { sets.push(`cantidad_stock = $${idx++}`); vals.push(stock); }
            if (datos.stock_minimo !== undefined) { sets.push(`stock_minimo = $${idx++}`); vals.push(datos.stock_minimo); }
            if (datos.id_tipo_producto !== undefined) { sets.push(`id_tipo_producto = $${idx++}`); vals.push(datos.id_tipo_producto); }
            if (datos.id_unidad_medida !== undefined) { sets.push(`id_unidad_medida = $${idx++}`); vals.push(datos.id_unidad_medida); }
            if (datos.id_color !== undefined) { sets.push(`id_color = $${idx++}`); vals.push(datos.id_color); }
            if (datos.id_material_base !== undefined) { sets.push(`id_material_base = $${idx++}`); vals.push(datos.id_material_base); }

            if (sets.length > 0) {
                vals.push(id);
                await client.query(
                    `UPDATE productos_almacen SET ${sets.join(', ')} WHERE id_producto = $${idx}`,
                    vals
                );
            }

            // Actualizar especificaciones si se proporcionan
            if (datos.especificaciones) {
                const esp = datos.especificaciones;
                if (esp.textura !== undefined || esp.calidad !== undefined) {
                    await client.query(
                        `UPDATE esp_telas SET textura = COALESCE($1, textura), calidad = COALESCE($2, calidad) WHERE id_producto = $3`,
                        [esp.textura || null, esp.calidad || null, id]
                    );
                }
                if (esp.tipo_boton !== undefined || esp.tamano !== undefined) {
                    await client.query(
                        `UPDATE esp_botones SET tipo_boton = COALESCE($1, tipo_boton), tamano = COALESCE($2, tamano) WHERE id_producto = $3`,
                        [esp.tipo_boton || null, esp.tamano || null, id]
                    );
                }
                if (esp.tipo_hilo !== undefined || esp.grosor !== undefined) {
                    await client.query(
                        `UPDATE esp_hilos SET tipo_hilo = COALESCE($1, tipo_hilo), grosor = COALESCE($2, grosor) WHERE id_producto = $3`,
                        [esp.tipo_hilo || null, esp.grosor || null, id]
                    );
                }
            }

            await client.query('COMMIT');
            return AlmacenModel.buscarPorId(id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Elimina un producto. La cascada elimina sus especificaciones en esp_*.
     */
    eliminar: async (id) => {
        const resultado = await db.query('DELETE FROM productos_almacen WHERE id_producto = $1 RETURNING id_producto', [id]);
        return resultado.rows.length > 0;
    }
};

module.exports = AlmacenModel;
