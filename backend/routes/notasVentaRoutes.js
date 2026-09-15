const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const {
    obtenerNotasVenta,
    obtenerNotaPorId,
    obtenerNotaPorPedido,
    generarNotaVenta,
    obtenerDescuentos
} = require('../controllers/notasVentaController');

router.use(verificarToken);

// GET /api/notas-venta - Listar todas las notas de venta emitidas
router.get('/', obtenerNotasVenta);

// GET /api/notas-venta/descuentos - Catálogo de descuentos parametrizados
router.get('/descuentos', obtenerDescuentos);

// GET /api/notas-venta/pedido/:id_pedido - Obtener nota por ID de pedido
router.get('/pedido/:id_pedido', obtenerNotaPorPedido);

// GET /api/notas-venta/:id - Detalle de nota de venta por ID
router.get('/:id', obtenerNotaPorId);

// POST /api/notas-venta - Generar / emitir nueva nota de venta inmutable
router.post('/', generarNotaVenta);

module.exports = router;
