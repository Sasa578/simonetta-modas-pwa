const PedidoModel = require('../models/PedidoModel');
const MedidaModel = require('../models/MedidaModel');
const CitaModel = require('../models/CitaModel');
const PagoModel = require('../models/PagoModel');
const { pool } = require('../config/db');

async function testModulo2() {
    try {
        console.log('🧪 Probando Módulo 2 (Pedidos, Medidas, Citas y Pagos)...\n');

        // 1. Obtener pedidos activos
        const pedidos = await PedidoModel.obtenerPedidosActivos();
        console.log(`✅ Pedidos activos listados (${pedidos.length}):`);
        pedidos.forEach(p => {
            console.log(`   - [#${p.id_pedido}] Cliente: ${p.cliente} | Prenda: ${p.prenda} | Estado: ${p.estado} | Total: Bs ${p.costo_total} | Pagado: Bs ${p.adelanto} | Saldo: Bs ${p.saldo}`);
        });

        // 2. Crear un nuevo pedido completo para un cliente existente
        const clienteRes = await pool.query('SELECT id_cliente FROM clientes LIMIT 1');
        const idCliente = clienteRes.rows[0].id_cliente;

        const nuevoPedido = await PedidoModel.crearPedido(
            {
                id_cliente: idCliente,
                fecha_entrega: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
                fecha_prueba: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                costo_total: 950.00,
                adelanto: 450.00,
                id_metodo_pago: 2 // QR
            },
            {
                tipo_prenda: 'Traje de Coctel Elegante',
                color: 'Vino Tinto',
                descripcion_tela: 'Seda satinada con forro de tafetán',
                notas_diseno: 'Escote en espalda, falda corte sirena',
                cantidad: 1,
                subtotal: 950.00,
                medidas_anatomicas: {
                    busto: 92.0,
                    cintura: 70.0,
                    cadera: 96.0,
                    espalda: 37.0,
                    hombro: 14.0
                },
                talla: 'M'
            }
        );

        console.log('\n✅ Nuevo Pedido Creado con Éxito:');
        console.log('   ID Pedido:', nuevoPedido.id_pedido);
        console.log('   Cliente:', nuevoPedido.cliente);
        console.log('   Prenda:', nuevoPedido.prenda, `(${nuevoPedido.color})`);
        console.log('   Medidas registradas:', `Busto: ${nuevoPedido.busto} cm, Cintura: ${nuevoPedido.cintura} cm`);
        console.log('   Adelanto pagado:', `Bs ${nuevoPedido.adelanto}, Saldo: Bs ${nuevoPedido.saldo}`);

        // 3. Probar registro de pagos adicionales
        const pagoExtra = await PagoModel.registrarPago({
            id_pedido: nuevoPedido.id_pedido,
            monto_pago: 200.00,
            id_metodo_pago: 1 // Efectivo
        });
        console.log('\n✅ Pago adicional registrado en tabla pagos:', `Bs ${pagoExtra.monto_pago}`);

        const pagosHistorial = await PagoModel.obtenerPagosPorPedido(nuevoPedido.id_pedido);
        console.log(`   Historial de pagos del pedido (${pagosHistorial.length} pagos):`, pagosHistorial.map(p => `Bs ${p.monto_pago} (${p.metodo_pago})`).join(', '));

        // 4. Probar cambio de estado
        const pedidoEnCorte = await PedidoModel.actualizarEstado(nuevoPedido.id_pedido, 'Corte');
        console.log('\n✅ Estado de pedido actualizado:', pedidoEnCorte.estado);

        // 5. Probar saldar y entregar
        const pedidoEntregado = await PedidoModel.saldarYEntregar(nuevoPedido.id_pedido);
        console.log('\n✅ Pedido saldado y entregado:');
        console.log('   Estado final:', pedidoEntregado.estado);
        console.log('   Saldo pendiente:', `Bs ${pedidoEntregado.saldo}`);

        // 6. Probar citas pendientes
        const citas = await CitaModel.obtenerPendientes();
        console.log(`\n✅ Citas programadas en agenda (${citas.length}):`);
        citas.forEach(c => console.log(`   - [#${c.id_cita}] ${new Date(c.fecha_cita).toLocaleDateString()}: ${c.motivo_cita} (Cliente: ${c.cliente})`));

        console.log('\n🎉 ¡TODAS LAS PRUEBAS DEL MÓDULO 2 PASARON EXITOSAMENTE!');
    } catch (err) {
        console.error('❌ Error probando Módulo 2:', err);
    } finally {
        await pool.end();
    }
}

testModulo2();
