const KardexModel = require('../models/KardexModel');
const NotaVentaModel = require('../models/NotaVentaModel');
const { pool } = require('../config/db');

async function testModulo4() {
    try {
        console.log('🧪 Probando Módulo 4 (Kardex, Reportes y Notas de Venta)...\n');

        // 1. Obtener catálogos de Kardex
        const catalogos = await KardexModel.obtenerCatalogos();
        console.log('✅ Catálogos de Kardex cargados:');
        console.log(`   - Tipos de Movimiento (${catalogos.tipos_movimiento.length}):`, catalogos.tipos_movimiento.map(t => t.nombre_movimiento).join(', '));
        console.log(`   - Orígenes de Material (${catalogos.origenes_material.length}):`, catalogos.origenes_material.map(o => o.nombre_origen).join(', '));
        console.log(`   - Proveedores registrados (${catalogos.proveedores.length})`);
        console.log(`   - Insumos disponibles (${catalogos.insumos.length})`);

        if (catalogos.insumos.length === 0) {
            throw new Error('No hay insumos en almacén para probar Kardex.');
        }

        const insumoPrueba = catalogos.insumos[0];
        const stockInicial = parseFloat(insumoPrueba.cantidad_actual);
        console.log(`\n📦 Insumo seleccionado para prueba: [${insumoPrueba.nombre_material}] (Stock inicial: ${stockInicial} ${insumoPrueba.unidad_medida})`);

        // 2. Probar Entrada por Compra (Aumenta Stock Taller)
        const entrada = await KardexModel.registrarMovimiento({
            id_producto: insumoPrueba.id_producto,
            id_tipo_movimiento: 1, // Entrada por Compra
            cantidad: 10.0,
            id_origen: 1, // Taller
            id_proveedor: catalogos.proveedores[0]?.id_proveedor || null,
            observacion: 'Prueba Automatizada: Ingreso de 10 unidades.'
        });
        const stockTrasEntrada = parseFloat(entrada.stock_resultante);
        console.log(`\n✅ Entrada por Compra registrada:`);
        console.log(`   - Cantidad añadida: +10.0 ${insumoPrueba.unidad_medida}`);
        console.log(`   - Stock tras entrada: ${stockTrasEntrada} (Esperado: ${stockInicial + 10})`);
        if (stockTrasEntrada !== stockInicial + 10) throw new Error('Cálculo de stock erróneo tras entrada');

        // 3. Probar Salida por Confección (Reduce Stock Taller)
        const salida = await KardexModel.registrarMovimiento({
            id_producto: insumoPrueba.id_producto,
            id_tipo_movimiento: 2, // Salida por Confección
            cantidad: 5.0,
            id_origen: 1, // Taller
            observacion: 'Prueba Automatizada: Consumo de 5 unidades.'
        });
        const stockTrasSalida = parseFloat(salida.stock_resultante);
        console.log(`\n✅ Salida por Confección registrada:`);
        console.log(`   - Cantidad retirada: -5.0 ${insumoPrueba.unidad_medida}`);
        console.log(`   - Stock tras salida: ${stockTrasSalida} (Esperado: ${stockTrasEntrada - 5})`);
        if (stockTrasSalida !== stockTrasEntrada - 5) throw new Error('Cálculo de stock erróneo tras salida');

        // 4. Probar Protección de Inventario con Material de Cliente (id_origen = 2)
        const movCliente = await KardexModel.registrarMovimiento({
            id_producto: insumoPrueba.id_producto,
            id_tipo_movimiento: 2,
            cantidad: 8.0,
            id_origen: 2, // Cliente
            observacion: 'Prueba Automatizada: Material de cliente, no afecta inventario.'
        });
        const stockTrasCliente = parseFloat(movCliente.stock_resultante);
        console.log(`\n✅ Movimiento con Origen "Cliente" verificado:`);
        console.log(`   - Cantidad auditada: 8.0 ${insumoPrueba.unidad_medida}`);
        console.log(`   - Stock de almacén: ${stockTrasCliente} (Esperado idéntico: ${stockTrasSalida})`);
        if (stockTrasCliente !== stockTrasSalida) throw new Error('El material del cliente no debió alterar el inventario');

        // 5. Probar Validación de Stock Insuficiente
        try {
            await KardexModel.registrarMovimiento({
                id_producto: insumoPrueba.id_producto,
                id_tipo_movimiento: 2,
                cantidad: 999999.0, // Muy superior al stock
                id_origen: 1
            });
            throw new Error('Fallo: Debería haber rechazado la salida por stock insuficiente.');
        } catch (e) {
            if (e.message.includes('Stock insuficiente')) {
                console.log('\n✅ Validación de Stock Insuficiente: Funcionó correctamente (Rechazó sobregiro de inventario).');
            } else {
                throw e;
            }
        }

        // 6. Probar Notas de Venta Inmutables
        const pedRes = await pool.query('SELECT id_pedido, costo_total FROM pedidos LIMIT 1');
        if (pedRes.rows.length > 0) {
            const pedido = pedRes.rows[0];
            const notaVenta = await NotaVentaModel.generarNotaVenta({
                id_pedido: pedido.id_pedido,
                id_descuento: 1 // 5%
            });

            console.log(`\n✅ Nota de Venta Inmutable generada/recuperada:`);
            console.log(`   - Número de Nota: ${notaVenta.numero_nota}`);
            console.log(`   - Pedido ID: #${notaVenta.id_pedido}`);
            console.log(`   - Subtotal: Bs. ${notaVenta.subtotal}`);
            console.log(`   - Descuento Aplicado: ${notaVenta.porcentaje_descuento || 0}% (${notaVenta.nombre_descuento || 'Sin descuento'})`);
            console.log(`   - Total Final: Bs. ${notaVenta.total_final}`);
            console.log(`   - Cliente: ${notaVenta.cliente}`);
        }

        // 7. Listado de Notas de Venta
        const todasNotas = await NotaVentaModel.obtenerNotasVenta();
        console.log(`\n✅ Notas de venta registradas en el sistema (${todasNotas.length}):`);
        todasNotas.slice(0, 3).forEach(n => {
            console.log(`   - [${n.numero_nota}] Pedido #${n.id_pedido} | Total: Bs. ${n.total_final} | Cliente: ${n.cliente}`);
        });

        console.log('\n🎉 ¡TODAS LAS PRUEBAS DEL MÓDULO 4 PASARON EXITOSAMENTE!');
    } catch (err) {
        console.error('❌ Error probando Módulo 4:', err);
    } finally {
        await pool.end();
    }
}

testModulo4();
