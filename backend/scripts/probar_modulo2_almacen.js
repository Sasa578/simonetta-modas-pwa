const AlmacenModel = require('../models/AlmacenModel');
const { pool } = require('../config/db');

async function testAlmacen() {
    try {
        console.log('🧪 Probando Módulo 3 (Almacén e Inventario)...\n');

        // 1. Obtener catálogos
        const catalogos = await AlmacenModel.obtenerCatalogos();
        console.log(`✅ Catálogos obtenidos:`);
        console.log(`   - Categorías (${catalogos.categorias.length}):`, catalogos.categorias.map(c => c.nombre_categoria).join(', '));
        console.log(`   - Tipos de producto (${catalogos.tipos.length}):`, catalogos.tipos.map(t => t.nombre_tipo).join(', '));
        console.log(`   - Unidades (${catalogos.unidades.length}):`, catalogos.unidades.map(u => u.abreviatura).join(', '));
        console.log(`   - Colores (${catalogos.colores.length}):`, catalogos.colores.map(c => c.nombre_color).join(', '));

        // 2. Obtener inventario actual
        const inventario = await AlmacenModel.obtenerInventario();
        console.log(`\n✅ Inventario actual (${inventario.length} artículos):`);
        inventario.forEach(i => {
            console.log(`   - [#${i.id_producto}] ${i.nombre_articulo} | Stock: ${i.cantidad_stock} ${i.unidad_medida} | Mín: ${i.stock_minimo} | Cat: ${i.nombre_categoria} | Color: ${i.nombre_color || 'N/A'}`);
        });

        // 3. Crear nuevo producto con especificación (Ej. Cierre)
        const idCatCierres = catalogos.categorias.find(c => c.nombre_categoria.toLowerCase().includes('cierre'))?.id_categoria;
        const tipoCierre = catalogos.tipos.find(t => t.id_categoria === idCatCierres) || catalogos.tipos[0];
        const unidadU = catalogos.unidades.find(u => u.abreviatura === 'u') || catalogos.unidades[0];
        const colorNegro = catalogos.colores.find(c => c.nombre_color.toLowerCase().includes('negro')) || catalogos.colores[0];

        const nuevoInsumo = await AlmacenModel.crear({
            nombre_articulo: 'Cierre Reforzado Pantalón 20cm',
            cantidad_stock: 45,
            stock_minimo: 10,
            id_tipo_producto: tipoCierre.id_tipo_producto,
            id_unidad_medida: unidadU.id_unidad_medida,
            id_color: colorNegro.id_color,
            especificaciones: {
                tipo_cierre: 'Metálico Dientes de Bronce',
                tamano: '20 cm'
            }
        });
        console.log(`\n✅ Nuevo insumo creado con éxito:`, nuevoInsumo.nombre_articulo, '| Cierre Tipo:', nuevoInsumo.tipo_cierre, '| Tamaño:', nuevoInsumo.cierre_tamano);

        console.log('\n🎉 ¡TODAS LAS PRUEBAS DEL MÓDULO 3 PASARON EXITOSAMENTE!');
    } catch (err) {
        console.error('❌ Error en prueba de Almacén:', err);
    } finally {
        await pool.end();
    }
}

testAlmacen();
