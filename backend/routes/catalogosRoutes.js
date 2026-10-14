const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/catalogos/medidas-convencionales
 * Devuelve los rangos de edad, géneros, tallas estándar y la matriz completa de medidas industriales.
 * Permite que el frontend y los reportes obtengan todas las combinaciones directamente de la base de datos.
 */
router.get('/medidas-convencionales', async (req, res) => {
    try {
        const [rangosRes, generosRes, tallasRes, matrizRes] = await Promise.all([
            db.query('SELECT id_rango_edad, nombre_rango, descripcion FROM rangos_edad ORDER BY id_rango_edad ASC'),
            db.query('SELECT id_genero, nombre_genero FROM generos ORDER BY id_genero ASC'),
            db.query('SELECT id_talla_estandar, nombre_talla, equivalencia_europea, orden FROM tallas_estandar ORDER BY orden ASC'),
            db.query(`
                SELECT tm.id_tabla_medida, tm.id_rango_edad, tm.id_genero, tm.id_talla_estandar,
                       re.nombre_rango, g.nombre_genero, te.nombre_talla, te.equivalencia_europea,
                       tm.busto, tm.cintura, tm.cadera, tm.espalda, tm.hombro,
                       tm.cortas, tm.frente, tm.alto_cadera, tm.entre_busto
                FROM tabla_medidas_convencionales tm
                JOIN rangos_edad re ON tm.id_rango_edad = re.id_rango_edad
                JOIN generos g ON tm.id_genero = g.id_genero
                JOIN tallas_estandar te ON tm.id_talla_estandar = te.id_talla_estandar
                ORDER BY tm.id_rango_edad, tm.id_genero, te.orden ASC
            `)
        ]);

        // Construir también un mapa estructurado para acceso rápido: [rango][genero][talla] -> medidas
        const mapa = {};
        for (const row of matrizRes.rows) {
            if (!mapa[row.nombre_rango]) mapa[row.nombre_rango] = {};
            if (!mapa[row.nombre_rango][row.nombre_genero]) mapa[row.nombre_rango][row.nombre_genero] = {};
            mapa[row.nombre_rango][row.nombre_genero][row.nombre_talla] = {
                id_tabla_medida: row.id_tabla_medida,
                id_rango_edad: row.id_rango_edad,
                id_genero: row.id_genero,
                id_talla_estandar: row.id_talla_estandar,
                equivalencia_europea: row.equivalencia_europea,
                busto: parseFloat(row.busto),
                cintura: parseFloat(row.cintura),
                cadera: parseFloat(row.cadera),
                espalda: parseFloat(row.espalda),
                hombro: parseFloat(row.hombro),
                cortas: parseFloat(row.cortas),
                frente: parseFloat(row.frente),
                alto_cadera: parseFloat(row.alto_cadera),
                entre_busto: parseFloat(row.entre_busto)
            };
        }

        res.json({
            rangos_edad: rangosRes.rows,
            generos: generosRes.rows,
            tallas_estandar: tallasRes.rows,
            tabla_medidas: matrizRes.rows,
            mapa_medidas: mapa
        });
    } catch (error) {
        console.error('Error al obtener catálogo de medidas convencionales:', error);
        res.status(500).json({ error: 'Error al consultar catálogo de medidas.' });
    }
});

/**
 * GET /api/catalogos/motivos-cita
 * Devuelve el catálogo formal de motivos de cita.
 */
router.get('/motivos-cita', async (req, res) => {
    try {
        const resultado = await db.query('SELECT id_motivo_cita, nombre_motivo, descripcion FROM motivos_cita ORDER BY id_motivo_cita ASC');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener motivos de cita:', error);
        res.status(500).json({ error: 'Error al consultar motivos de cita.' });
    }
});

/**
 * GET /api/catalogos/insumos-opciones
 * Devuelve las opciones normalizadas de materiales base, tipos de producto, unidades de medida y colores.
 */
router.get('/insumos-opciones', async (req, res) => {
    try {
        const [materialesRes, tiposRes, unidadesRes, coloresRes, origenesRes] = await Promise.all([
            db.query('SELECT id_material_base, nombre_material FROM materiales_base ORDER BY nombre_material ASC'),
            db.query(`
                SELECT tp.id_tipo_producto, tp.nombre_tipo, tp.id_categoria, ca.nombre_categoria
                FROM tipos_producto tp
                LEFT JOIN categorias_almacen ca ON tp.id_categoria = ca.id_categoria
                ORDER BY tp.nombre_tipo ASC
            `),
            db.query('SELECT id_unidad_medida, abreviatura, descripcion FROM unidades_medida ORDER BY id_unidad_medida ASC'),
            db.query('SELECT id_color, nombre_color, codigo_hexadecimal FROM colores ORDER BY nombre_color ASC'),
            db.query('SELECT id_origen, nombre_origen FROM origenes_material ORDER BY id_origen ASC')
        ]);

        res.json({
            materiales_base: materialesRes.rows,
            tipos_producto: tiposRes.rows,
            unidades_medida: unidadesRes.rows,
            colores: coloresRes.rows,
            origenes_material: origenesRes.rows
        });
    } catch (error) {
        console.error('Error al obtener opciones de insumos:', error);
        res.status(500).json({ error: 'Error al consultar opciones de insumos.' });
    }
});

/**
 * GET /api/catalogos/roles
 * Devuelve los roles del sistema con sus descripciones funcionales.
 */
router.get('/roles', async (req, res) => {
    try {
        const resultado = await db.query(`
            SELECT r.id_rol, r.nombre_rol, dr.descripcion
            FROM roles r
            LEFT JOIN descripciones_rol dr ON r.id_rol = dr.id_rol
            ORDER BY r.id_rol ASC
        `);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener catálogo de roles:', error);
        res.status(500).json({ error: 'Error al consultar roles.' });
    }
});

module.exports = router;
