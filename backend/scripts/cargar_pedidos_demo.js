const { pool } = require('../config/db');
const PedidoModel = require('../models/PedidoModel');
const PagoModel = require('../models/PagoModel');
const CitaModel = require('../models/CitaModel');

async function cargarPedidosDemo() {
    try {
        console.log('🚀 Cargando datos demo para Módulo 2 (Pedidos, Medidas, Citas y Pagos)...');

        // Obtener clientes existentes
        const resClientes = await pool.query(`
            SELECT c.id_cliente, tc.nombre_tipo,
                   COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social) as nombre
            FROM clientes c
            JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
            LEFT JOIN datos_cliente_persona dcp ON c.id_cliente = dcp.id_cliente
            LEFT JOIN datos_cliente_institucional dci ON c.id_cliente = dci.id_cliente
            ORDER BY c.id_cliente ASC
        `);

        if (resClientes.rows.length === 0) {
            console.log('⚠️ No se encontraron clientes. Ejecute la semilla primero.');
            return;
        }

        const clientes = resClientes.rows;
        console.log(`📌 Se encontraron ${clientes.length} clientes en la base de datos.`);

        // Limpiar pedidos anteriores de prueba si se desea, o añadir pedidos adicionales
        const pedidosDemo = [
            {
                clienteIdx: 0,
                costo_total: 1200.00,
                adelanto: 600.00,
                id_metodo_pago: 1, // Efectivo
                estado: 'Pendiente',
                diasEntrega: 14,
                diasPrueba: 7,
                prenda: 'Vestido de Fiesta en Seda con Encaje',
                color: 'Esmeralda',
                notas_diseno: 'Escote en V profundo, espalda descubierta con apliques de encaje chantilly francés.',
                talla: 'M',
                medidas: {
                    busto: 94.0, cintura: 72.0, cadera: 98.0, espalda: 38.0, hombro: 14.5, frente: 43.0, alto_cadera: 20.0, cortas: 58.0
                },
                motivoCita: 'Primera toma de medidas y elección de forro',
                diasCita: 2
            },
            {
                clienteIdx: 1 % clientes.length,
                costo_total: 1850.00,
                adelanto: 1000.00,
                id_metodo_pago: 2, // QR / Transferencia
                estado: 'Corte',
                diasEntrega: 10,
                diasPrueba: 4,
                prenda: 'Traje Sastre Dos Piezas Slim Fit',
                color: 'Azul Marino Oxford',
                notas_diseno: 'Saco con solapa de muesca delgada, forro de tafetán bordó y pantalón sin pinzas con botamanga italiana.',
                talla: 'L',
                medidas: {
                    busto: 102.0, cintura: 86.0, cadera: 104.0, espalda: 44.0, hombro: 16.5, frente: 47.0, alto_cadera: 22.0, cortas: 74.0
                },
                motivoCita: 'Prueba de hombreras y talle de saco',
                diasCita: 4
            },
            {
                clienteIdx: 2 % clientes.length,
                costo_total: 800.00,
                adelanto: 400.00,
                id_metodo_pago: 2, // QR
                estado: 'Prueba',
                diasEntrega: 6,
                diasPrueba: 1,
                prenda: 'Enterizo Elegante con Cinturón Forrado',
                color: 'Negro Azabache',
                notas_diseno: 'Pantalón palazzo ancho, pretina alta con broche oculto y cierre invisible posterior.',
                talla: 'S',
                medidas: {
                    busto: 88.0, cintura: 66.0, cadera: 92.0, espalda: 36.0, hombro: 13.5, frente: 41.0, alto_cadera: 19.0, cortas: 140.0
                },
                motivoCita: 'Prueba general de calce y caída de botamanga',
                diasCita: 1
            },
            {
                clienteIdx: 3 % clientes.length,
                costo_total: 2400.00,
                adelanto: 1500.00,
                id_metodo_pago: 3, // Tarjeta
                estado: 'Terminado',
                diasEntrega: 2,
                diasPrueba: -2,
                prenda: 'Vestido de Graduación con Pedrería',
                color: 'Azul Real',
                notas_diseno: 'Corset estructurado con varillas reforzadas y bordado manual en cristales.',
                talla: 'M',
                medidas: {
                    busto: 90.0, cintura: 68.0, cadera: 96.0, espalda: 37.5, hombro: 14.0, frente: 42.0, alto_cadera: 20.0, cortas: 145.0
                },
                motivoCita: 'Cita de entrega y revisión final',
                diasCita: 2
            },
            {
                clienteIdx: 0,
                costo_total: 650.00,
                adelanto: 650.00,
                id_metodo_pago: 1, // Efectivo
                estado: 'Entregado',
                diasEntrega: -3,
                diasPrueba: -6,
                prenda: 'Blusa Ejecutiva de Seda con Lazada',
                color: 'Blanco Perla',
                notas_diseno: 'Puños con botones de nácar y cuello camisero con lazo desmontable.',
                talla: 'M',
                medidas: {
                    busto: 92.0, cintura: 70.0, cadera: 94.0, espalda: 37.0, hombro: 14.0, frente: 42.0, alto_cadera: 19.5, cortas: 62.0
                },
                motivoCita: 'Entrega completada a satisfacción',
                diasCita: -3
            }
        ];

        for (const item of pedidosDemo) {
            const cliente = clientes[item.clienteIdx];
            const hoy = Date.now();
            const fechaEntrega = new Date(hoy + item.diasEntrega * 86400000).toISOString().split('T')[0];
            const fechaPrueba = item.diasPrueba ? new Date(hoy + item.diasPrueba * 86400000).toISOString().split('T')[0] : null;
            const fechaCita = item.diasCita ? new Date(hoy + item.diasCita * 86400000).toISOString() : null;

            // 1. Crear Pedido
            const pedido = await PedidoModel.crearPedido(
                {
                    id_cliente: cliente.id_cliente,
                    fecha_entrega: fechaEntrega,
                    fecha_prueba: fechaPrueba,
                    costo_total: item.costo_total,
                    adelanto: item.adelanto,
                    id_metodo_pago: item.id_metodo_pago,
                    estado: item.estado
                },
                {
                    tipo_prenda: item.prenda,
                    color: item.color,
                    descripcion_tela: `${item.prenda} confeccionado a medida`,
                    notas_diseno: item.notas_diseno,
                    medidas_anatomicas: item.medidas,
                    talla: item.talla,
                    subtotal: item.costo_total
                }
            );

            // Si el estado debe ser distinto a Pendiente, actualizarlo
            if (item.estado !== 'Pendiente') {
                await PedidoModel.actualizarEstado(pedido.id_pedido, item.estado);
            }

            // Si está entregado, saldar
            if (item.estado === 'Entregado') {
                await PedidoModel.saldarYEntregar(pedido.id_pedido);
            } else if (item.costo_total > item.adelanto && item.estado === 'Terminado') {
                // Registrar un pago intermedio (abono parcial)
                await PagoModel.registrarPago({
                    id_pedido: pedido.id_pedido,
                    monto_pago: 500.00,
                    id_metodo_pago: 2, // QR
                    id_estado_pago: 2
                });
            }

            // Si tiene fecha de cita programada
            if (fechaCita && item.estado !== 'Entregado') {
                await CitaModel.crearCita({
                    id_cliente: cliente.id_cliente,
                    id_pedido: pedido.id_pedido,
                    fecha_cita: fechaCita,
                    motivo_cita: item.motivoCita,
                    id_estado_cita: 1 // Programada
                });
            }

            console.log(`   ✨ Pedido #${pedido.id_pedido} creado para [${cliente.nombre}] — ${item.prenda} (${item.estado})`);
        }

        console.log('\n✅ ¡Semilla de Módulo 2 cargada exitosamente con pedidos, medidas, citas y pagos variados!');
    } catch (err) {
        console.error('❌ Error cargando pedidos demo:', err);
    } finally {
        await pool.end();
    }
}

cargarPedidosDemo();
