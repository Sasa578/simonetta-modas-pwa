const AlmacenModel = require('../models/AlmacenModel');
const { pool } = require('../config/db');

async function cargarInsumosDemo() {
    try {
        const catRes = await AlmacenModel.obtenerCatalogos();
        const getCat = (name) => catRes.categorias.find(c => c.nombre_categoria.toLowerCase().includes(name.toLowerCase()))?.id_categoria;
        const getTipo = (name) => catRes.tipos.find(t => t.nombre_tipo.toLowerCase().includes(name.toLowerCase()))?.id_tipo_producto || catRes.tipos[0].id_tipo_producto;
        const getUnidad = (abrv) => catRes.unidades.find(u => u.abreviatura === abrv)?.id_unidad_medida || catRes.unidades[0].id_unidad_medida;
        const getColor = (name) => catRes.colores.find(c => c.nombre_color.toLowerCase().includes(name.toLowerCase()))?.id_color;
        const getMat = (name) => catRes.materiales.find(m => m.nombre_material.toLowerCase().includes(name.toLowerCase()))?.id_material_base;

        const demoItems = [
            {
                nombre_articulo: 'Lino Suizo Blanco Puro',
                cantidad_stock: 15.5,
                stock_minimo: 5.0,
                id_tipo_producto: getTipo('Lino'),
                id_unidad_medida: getUnidad('m'),
                id_color: getColor('Blanco'),
                id_material_base: getMat('Lino'),
                especificaciones: { grupo: 'Verano', subgrupo: 'Camisería / Sastrería', textura: 'Fresca y suave', calidad: 'Suiza Exportación' }
            },
            {
                nombre_articulo: 'Hilo Coselotodo Negro Ébano',
                cantidad_stock: 28,
                stock_minimo: 8,
                id_tipo_producto: getTipo('Hilo'),
                id_unidad_medida: getUnidad('carrete'),
                id_color: getColor('Negro'),
                id_material_base: getMat('Poliéster'),
                especificaciones: { tipo_hilo: 'Poliéster 100%', grosor: 'No. 120' }
            },
            {
                nombre_articulo: 'Botón Nácar Blanco Perla 18L',
                cantidad_stock: 95,
                stock_minimo: 20,
                id_tipo_producto: getTipo('Botón'),
                id_unidad_medida: getUnidad('u'),
                id_color: getColor('Blanco'),
                id_material_base: getMat('Metal'),
                especificaciones: { tipo_boton: '2 Ojales Nácar', tamano: '18L (11.5mm)' }
            },
            {
                nombre_articulo: 'Cierre Invisible Negro 50cm',
                cantidad_stock: 35,
                stock_minimo: 10,
                id_tipo_producto: getTipo('Cierre'),
                id_unidad_medida: getUnidad('u'),
                id_color: getColor('Negro'),
                id_material_base: getMat('Nylon'),
                especificaciones: { tipo_cierre: 'Invisible Gota de Agua', tamano: '50 cm' }
            }
        ];

        for (const item of demoItems) {
            await AlmacenModel.crear(item);
        }

        console.log('✅ Insumos de prueba demo cargados exitosamente para todas las categorías.');
    } catch (err) {
        console.error('Error cargando demo de insumos:', err);
    } finally {
        await pool.end();
    }
}

cargarInsumosDemo();
