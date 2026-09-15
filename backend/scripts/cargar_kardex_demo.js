const { pool } = require('../config/db');
const KardexModel = require('../models/KardexModel');
const NotaVentaModel = require('../models/NotaVentaModel');

async function cargarKardexDemo() {
    try {
        console.log('🚀 Cargando datos demo para Módulo 4 (Kardex, Reportes y Notas de Venta)...');

        // 1. Proveedores adicionales
        const proveedoresDemo = [
            {
                nombre_empresa: 'Bordados e Hilados Santa Cruz S.A.',
                nombre_contacto: 'Ing. Fernando Roca',
                telefono_contacto: '+591 3 3451122',
                direccion: 'Parque Industrial Mz. 12, Santa Cruz'
            },
            {
                nombre_empresa: 'Importadora Mercería y Botones Colonial',
                nombre_contacto: 'Sra. Elena Vaca',
                telefono_contacto: '+591 4 4567890',
                direccion: 'Calle San Martín #450, Cochabamba'
            }
        ];

        for (const prov of proveedoresDemo) {
            const check = await pool.query('SELECT id_proveedor FROM proveedores WHERE nombre_empresa = $1', [prov.nombre_empresa]);
            if (check.rows.length === 0) {
                await KardexModel.crearProveedor(prov);
                console.log(`   🏢 Proveedor registrado: ${prov.nombre_empresa}`);
            }
        }

        // 2. Descuento adicional si falta
        const checkDesc = await pool.query("SELECT id_descuento FROM descuentos WHERE nombre_descuento = 'Descuento Cliente Frecuente'");
        if (checkDesc.rows.length === 0) {
            await pool.query(
                `INSERT INTO descuentos (id_tipo_cliente, nombre_descuento, porcentaje)
                 VALUES (1, 'Descuento Cliente Frecuente', 15.00)`
            );
            console.log('   🏷️ Descuento Cliente Frecuente (15%) registrado.');
        }

        // 3. Obtener insumos para registrar movimientos
        const insumosRes = await pool.query('SELECT id_producto, nombre_articulo, cantidad_stock FROM productos_almacen ORDER BY id_producto ASC LIMIT 4');
        const insumos = insumosRes.rows;

        const provRes = await pool.query('SELECT id_proveedor FROM proveedores ORDER BY id_proveedor ASC');
        const proveedores = provRes.rows;

        const detRes = await pool.query('SELECT id_detalle, id_pedido FROM detalle_pedido ORDER BY id_detalle ASC LIMIT 2');
        const detalles = detRes.rows;

        if (insumos.length > 0 && proveedores.length > 0) {
            // Entrada 1: Compra a proveedor
            const entrada1 = await KardexModel.registrarMovimiento({
                id_producto: insumos[0].id_producto,
                id_tipo_movimiento: 1, // Entrada por Compra
                cantidad: 20.0,
                id_origen: 1, // Taller
                id_proveedor: proveedores[0].id_proveedor,
                observacion: 'Factura F-89402: Abastecimiento mensual de tejido primario.'
            });
            console.log(`   📥 Entrada Kardex: 20 un. de ${entrada1.nombre_material} (Stock: ${entrada1.stock_resultante})`);

            // Entrada 2: Compra a segundo proveedor
            if (insumos.length > 1 && proveedores.length > 1) {
                const entrada2 = await KardexModel.registrarMovimiento({
                    id_producto: insumos[1].id_producto,
                    id_tipo_movimiento: 1,
                    cantidad: 15.0,
                    id_origen: 1,
                    id_proveedor: proveedores[1].id_proveedor,
                    observacion: 'Pedido #4501: Reposición de insumo de confección.'
                });
                console.log(`   📥 Entrada Kardex: 15 un. de ${entrada2.nombre_material} (Stock: ${entrada2.stock_resultante})`);
            }

            // Salida 1: Salida por Confección vinculada a detalle de pedido (Taller)
            if (detalles.length > 0) {
                const salida1 = await KardexModel.registrarMovimiento({
                    id_producto: insumos[0].id_producto,
                    id_tipo_movimiento: 2, // Salida por Confección
                    cantidad: 3.5,
                    id_origen: 1, // Taller (reduce stock)
                    id_detalle_pedido: detalles[0].id_detalle,
                    observacion: `Corte de piezas para Pedido #${detalles[0].id_pedido}.`
                });
                console.log(`   📤 Salida Kardex: 3.5 un. de ${salida1.nombre_material} (Stock: ${salida1.stock_resultante})`);
            }

            // Salida 2: Salida con origen CLIENTE (tela provista por cliente -> NO descuenta stock general)
            if (insumos.length > 2 && detalles.length > 1) {
                const stockAntes = parseFloat(insumos[2].cantidad_actual);
                const salidaCliente = await KardexModel.registrarMovimiento({
                    id_producto: insumos[2].id_producto,
                    id_tipo_movimiento: 2,
                    cantidad: 4.0,
                    id_origen: 2, // Cliente -> Protección de inventario
                    id_detalle_pedido: detalles[1].id_detalle,
                    observacion: `Material entregado por el cliente para confección del Pedido #${detalles[1].id_pedido}. No afecta stock taller.`
                });
                console.log(`   🛡️ Movimiento Cliente: 4.0 un. de ${salidaCliente.nombre_material} (Stock preservado intacto: ${salidaCliente.stock_resultante})`);
            }
        }

        // 4. Generar Notas de Venta inmutables para pedidos terminados o entregados
        const pedidosParaNota = await pool.query(`
            SELECT p.id_pedido, p.costo_total, cl.id_tipo_cliente
            FROM pedidos p
            JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
            JOIN clientes cl ON p.id_cliente = cl.id_cliente
            WHERE ep.nombre_estado IN ('Terminado', 'Entregado')
            LIMIT 3
        `);

        console.log(`\n📌 Generando Notas de Venta inmutables para ${pedidosParaNota.rows.length} pedidos concluidos...`);

        for (const ped of pedidosParaNota.rows) {
            // Asignar descuento según tipo de cliente
            const idDesc = ped.id_tipo_cliente === 2 ? 2 : 1; // 2: Institucional (10%), 1: Promocional (5%)
            const nota = await NotaVentaModel.generarNotaVenta({
                id_pedido: ped.id_pedido,
                id_descuento: idDesc
            });
            console.log(`   🧾 Nota de Venta emitida [${nota.numero_nota}] para Pedido #${ped.id_pedido}: Subtotal: Bs. ${nota.subtotal}, Descuento: ${nota.porcentaje_descuento || 0}%, Total Final: Bs. ${nota.total_final} (Cliente: ${nota.cliente})`);
        }

        console.log('\n✅ ¡Semilla de Módulo 4 cargada exitosamente con proveedores, movimientos y notas de venta!');
    } catch (error) {
        console.error('❌ Error cargando Kardex demo:', error);
    } finally {
        await pool.end();
    }
}

cargarKardexDemo();
