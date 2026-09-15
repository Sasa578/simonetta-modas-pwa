const KardexModel = require('../../models/KardexModel');
const NotaVentaModel = require('../../models/NotaVentaModel');
const db = require('../../config/db');

describe('Kardex & Notas de Venta - Módulo 4 (Integration)', () => {
    let testProductoId;
    let testPedidoId;
    let testMovimientoId;

    beforeAll(async () => {
        // Obtener un producto existente
        const pRes = await db.query('SELECT id_producto FROM productos_almacen LIMIT 1');
        testProductoId = pRes.rows[0].id_producto;

        // Obtener un pedido existente
        const pedRes = await db.query('SELECT id_pedido FROM pedidos LIMIT 1');
        testPedidoId = pedRes.rows[0].id_pedido;
    });

    afterAll(async () => {
        // Limpiar movimientos de prueba si se crearon
        if (testMovimientoId) {
            await db.query('DELETE FROM observaciones_movimiento WHERE id_movimiento = $1', [testMovimientoId]);
            await db.query('DELETE FROM movimientos_almacen WHERE id_movimiento = $1', [testMovimientoId]);
        }
    });

    it('debe registrar una entrada por compra en Kardex e incrementar el stock', async () => {
        const prodAntes = await db.query('SELECT cantidad_stock FROM productos_almacen WHERE id_producto = $1', [testProductoId]);
        const stockAntes = parseFloat(prodAntes.rows[0].cantidad_stock);

        const mov = await KardexModel.registrarMovimiento({
            id_producto: testProductoId,
            id_tipo_movimiento: 1, // Entrada
            cantidad: 12.0,
            id_origen: 1, // Taller
            observacion: 'Prueba Jest Entrada'
        });

        testMovimientoId = mov.id_movimiento;
        expect(mov).toHaveProperty('id_movimiento');
        expect(parseFloat(mov.cantidad)).toBe(12.0);
        expect(parseFloat(mov.stock_resultante)).toBe(stockAntes + 12.0);
    });

    it('debe registrar un movimiento con material de cliente sin alterar el stock del taller', async () => {
        const prodAntes = await db.query('SELECT cantidad_stock FROM productos_almacen WHERE id_producto = $1', [testProductoId]);
        const stockAntes = parseFloat(prodAntes.rows[0].cantidad_stock);

        const mov = await KardexModel.registrarMovimiento({
            id_producto: testProductoId,
            id_tipo_movimiento: 2, // Salida
            cantidad: 5.0,
            id_origen: 2, // Cliente -> Protección de stock general
            observacion: 'Prueba Jest Material Cliente'
        });

        expect(parseFloat(mov.stock_resultante)).toBe(stockAntes);
    });

    it('debe rechazar una salida que supere el stock disponible', async () => {
        await expect(
            KardexModel.registrarMovimiento({
                id_producto: testProductoId,
                id_tipo_movimiento: 2,
                cantidad: 999999.0,
                id_origen: 1
            })
        ).rejects.toThrow(/Stock insuficiente/);
    });

    it('debe generar una nota de venta inmutable con descuento', async () => {
        const nota = await NotaVentaModel.generarNotaVenta({
            id_pedido: testPedidoId,
            id_descuento: 1
        });

        expect(nota).toHaveProperty('id_nota_venta');
        expect(nota).toHaveProperty('numero_nota');
        expect(parseFloat(nota.subtotal)).toBeGreaterThan(0);
        expect(parseFloat(nota.total_final)).toBeLessThanOrEqual(parseFloat(nota.subtotal));
    });
});
