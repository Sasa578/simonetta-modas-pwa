const PedidoModel = require('../../models/PedidoModel');
const PagoModel = require('../../models/PagoModel');
const db = require('../../config/db');

describe('PedidoModel & Módulo 2 (Integration)', () => {
    let testPedidoId;
    let testClienteId;

    beforeAll(async () => {
        // Obtener un cliente existente
        const res = await db.query('SELECT id_cliente FROM clientes LIMIT 1');
        testClienteId = res.rows[0].id_cliente;
    });

    afterAll(async () => {
        if (testPedidoId) {
            // Eliminar registros hijos y el pedido creado
            await db.query('DELETE FROM pagos WHERE id_pedido = $1', [testPedidoId]);
            await db.query('DELETE FROM citas WHERE id_pedido = $1', [testPedidoId]);
            const detRes = await db.query('SELECT id_detalle FROM detalle_pedido WHERE id_pedido = $1', [testPedidoId]);
            for (const d of detRes.rows) {
                await db.query('DELETE FROM medidas_anatomicas WHERE id_detalle = $1', [d.id_detalle]);
                await db.query('DELETE FROM medidas_convencionales WHERE id_detalle = $1', [d.id_detalle]);
                await db.query('DELETE FROM notas_diseno_detalle WHERE id_detalle = $1', [d.id_detalle]);
            }
            await db.query('DELETE FROM detalle_pedido WHERE id_pedido = $1', [testPedidoId]);
            await db.query('DELETE FROM pedidos WHERE id_pedido = $1', [testPedidoId]);
        }
    });

    it('debe crear un pedido completo con detalle, medidas y pago inicial', async () => {
        const pedido = await PedidoModel.crearPedido(
            {
                id_cliente: testClienteId,
                fecha_entrega: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
                fecha_prueba: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
                costo_total: 850.00,
                adelanto: 400.00,
                id_metodo_pago: 2
            },
            {
                tipo_prenda: 'Vestido de Prueba Jest',
                color: 'Esmeralda',
                notas_diseno: 'Bordado frontal a mano',
                talla: 'M',
                medidas_anatomicas: {
                    busto: 90.0,
                    cintura: 68.0,
                    cadera: 94.0
                }
            }
        );

        expect(pedido).toHaveProperty('id_pedido');
        testPedidoId = pedido.id_pedido;
        expect(pedido.prenda).toBe('Vestido de Prueba Jest');
        expect(parseFloat(pedido.costo_total)).toBe(850.00);
        expect(parseFloat(pedido.adelanto)).toBe(400.00);
        expect(parseFloat(pedido.saldo)).toBe(450.00);
    });

    it('debe registrar un abono adicional correctamente', async () => {
        const pago = await PagoModel.registrarPago({
            id_pedido: testPedidoId,
            monto_pago: 200.00,
            id_metodo_pago: 1
        });

        expect(pago).toHaveProperty('id_pago');
        expect(parseFloat(pago.monto_pago)).toBe(200.00);

        const pedidoActualizado = await PedidoModel.obtenerPedidoPorId(testPedidoId);
        expect(parseFloat(pedidoActualizado.adelanto)).toBe(600.00);
        expect(parseFloat(pedidoActualizado.saldo)).toBe(250.00);
    });

    it('debe actualizar el estado del pedido a Prueba', async () => {
        const actualizado = await PedidoModel.actualizarEstado(testPedidoId, 'Prueba');
        expect(actualizado.estado).toBe('Prueba');
    });

    it('debe saldar el resto y marcar como Entregado', async () => {
        const saldado = await PedidoModel.saldarYEntregar(testPedidoId);
        expect(saldado.estado).toBe('Entregado');
        expect(parseFloat(saldado.saldo)).toBe(0);
    });
});
