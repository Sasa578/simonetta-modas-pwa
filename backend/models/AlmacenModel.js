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
            db.query('SELECT id_color, nombre_color, codigo_hexadecimal FROM colores ORDER BY id_color'),
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
     * Obtiene todo el inventario uniendo catálogos y especificaciones técnicas unificadas (detalles_tecnicos_producto).
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
                   -- Especificaciones Técnicas Unificadas (V2)
                   COALESCE(dt.caracteristica_principal, '') as caracteristica_principal,
                   COALESCE(dt.caracteristica_secundaria, '') as caracteristica_secundaria,
                   COALESCE(dt.observaciones_tecnicas, '') as observaciones_tecnicas,
                   -- Compatibilidad con vistas previas
                   COALESCE(dt.caracteristica_principal, '') as tela_textura,
                   COALESCE(dt.caracteristica_secundaria, '') as tela_calidad,
                   COALESCE(dt.caracteristica_principal, '') as tipo_boton,
                   COALESCE(dt.caracteristica_secundaria, '') as boton_tamano,
                   COALESCE(dt.caracteristica_principal, '') as tipo_hilo,
                   COALESCE(dt.caracteristica_secundaria, '') as hilo_grosor,
                   COALESCE(dt.caracteristica_principal, '') as tipo_cierre,
                   COALESCE(dt.caracteristica_secundaria, '') as cierre_tamano
            FROM productos_almacen pa
            JOIN tipos_producto tp ON pa.id_tipo_producto = tp.id_tipo_producto
            JOIN categorias_almacen ca ON tp.id_categoria = ca.id_categoria
            JOIN unidades_medida um ON pa.id_unidad_medida = um.id_unidad_medida
            LEFT JOIN colores col ON pa.id_color = col.id_color
            LEFT JOIN materiales_base mb ON pa.id_material_base = mb.id_material_base
            LEFT JOIN detalles_tecnicos_producto dt ON pa.id_producto = dt.id_producto
            ORDER BY pa.nombre_articulo ASC;
        `;
        const resultado = await db.query(query);
        return resultado.rows;
    },

    /**
     * Busca un producto por ID con sus especificaciones técnicas unificadas.
     */
    buscarPorId: async (id) => {
        const query = `
            SELECT pa.id_producto, pa.nombre_articulo, pa.cantidad_stock, pa.stock_minimo,
                   tp.id_tipo_producto, tp.nombre_tipo,
                   ca.id_categoria, ca.nombre_categoria,
                   um.id_unidad_medida, um.abreviatura as unidad_medida,
                   col.id_color, col.nombre_color, col.codigo_hexadecimal,
                   mb.id_material_base, mb.nombre_material as material_base,
                   COALESCE(dt.caracteristica_principal, '') as caracteristica_principal,
                   COALESCE(dt.caracteristica_secundaria, '') as caracteristica_secundaria,
                   COALESCE(dt.observaciones_tecnicas, '') as observaciones_tecnicas,
                   COALESCE(dt.caracteristica_principal, '') as tela_textura,
                   COALESCE(dt.caracteristica_secundaria, '') as tela_calidad
            FROM productos_almacen pa
            JOIN tipos_producto tp ON pa.id_tipo_producto = tp.id_tipo_producto
            JOIN categorias_almacen ca ON tp.id_categoria = ca.id_categoria
            JOIN unidades_medida um ON pa.id_unidad_medida = um.id_unidad_medida
            LEFT JOIN colores col ON pa.id_color = col.id_color
            LEFT JOIN materiales_base mb ON pa.id_material_base = mb.id_material_base
            LEFT JOIN detalles_tecnicos_producto dt ON pa.id_producto = dt.id_producto
            WHERE pa.id_producto = $1;
        `;
        const res = await db.query(query, [id]);
        return res.rows[0] || null;
    },

    /**
     * Crea un insumo en productos_almacen y sus detalles técnicos en detalles_tecnicos_producto.
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
        caracteristica_principal,
        caracteristica_secundaria,
        observaciones_tecnicas,
        especificaciones = {}
    }) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const nombre = (nombre_articulo || nombre_material || '').trim();
            const stock = parseFloat(cantidad_stock !== undefined ? cantidad_stock : cantidad_actual) || 0;
            const min = parseFloat(stock_minimo) || 0;

            let resolvedTipoId = id_tipo_producto;
            if (!resolvedTipoId) {
                const tipoDefault = await client.query('SELECT id_tipo_producto FROM tipos_producto LIMIT 1');
                resolvedTipoId = tipoDefault.rows[0]?.id_tipo_producto || 1;
            }

            let resolvedUnidadId = id_unidad_medida;
            if (!resolvedUnidadId) {
                const unidadDefault = await client.query("SELECT id_unidad_medida FROM unidades_medida WHERE abreviatura = 'm' OR abreviatura = 'uds' LIMIT 1");
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

            // Extraer características unificadas
            const cPrincipal = caracteristica_principal || 
                               especificaciones.textura || 
                               especificaciones.tipo_boton || 
                               especificaciones.tipo_hilo || 
                               especificaciones.tipo_cierre || 
                               'Estándar';

            const cSecundaria = caracteristica_secundaria || 
                                especificaciones.calidad || 
                                especificaciones.tamano || 
                                especificaciones.grosor || 
                                '';

            const obsTecnicas = observaciones_tecnicas || 
                                especificaciones.observaciones || 
                                '';

            await client.query(
                `INSERT INTO detalles_tecnicos_producto (id_producto, caracteristica_principal, caracteristica_secundaria, observaciones_tecnicas)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id_producto) DO UPDATE SET
                    caracteristica_principal = EXCLUDED.caracteristica_principal,
                    caracteristica_secundaria = EXCLUDED.caracteristica_secundaria,
                    observaciones_tecnicas = EXCLUDED.observaciones_tecnicas`,
                [idProducto, cPrincipal, cSecundaria, obsTecnicas]
            );

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
     * Actualiza un insumo y sus detalles técnicos en detalles_tecnicos_producto.
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

            // Actualizar detalles técnicos unificados
            const esp = datos.especificaciones || {};
            const cPrincipal = datos.caracteristica_principal || esp.textura || esp.tipo_boton || esp.tipo_hilo || esp.tipo_cierre;
            const cSecundaria = datos.caracteristica_secundaria || esp.calidad || esp.tamano || esp.grosor;
            const obsTecnicas = datos.observaciones_tecnicas || esp.observaciones;

            if (cPrincipal !== undefined || cSecundaria !== undefined || obsTecnicas !== undefined) {
                await client.query(
                    `INSERT INTO detalles_tecnicos_producto (id_producto, caracteristica_principal, caracteristica_secundaria, observaciones_tecnicas)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (id_producto) DO UPDATE SET
                        caracteristica_principal = COALESCE(EXCLUDED.caracteristica_principal, detalles_tecnicos_producto.caracteristica_principal),
                        caracteristica_secundaria = COALESCE(EXCLUDED.caracteristica_secundaria, detalles_tecnicos_producto.caracteristica_secundaria),
                        observaciones_tecnicas = COALESCE(EXCLUDED.observaciones_tecnicas, detalles_tecnicos_producto.observaciones_tecnicas)`,
                    [id, cPrincipal || null, cSecundaria || null, obsTecnicas || null]
                );
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
     * Elimina un producto y sus detalles técnicos.
     */
    eliminar: async (id) => {
        await db.query('DELETE FROM detalles_tecnicos_producto WHERE id_producto = $1', [id]);
        const resultado = await db.query('DELETE FROM productos_almacen WHERE id_producto = $1 RETURNING id_producto', [id]);
        return resultado.rows.length > 0;
    }
};

module.exports = AlmacenModel;
