const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { registrarPago, obtenerPagosPorPedido, obtenerCatalogos } = require('../controllers/pagosController');

router.use(verificarToken);

// GET /api/pagos/catalogos - Listar métodos y estados de pago
router.get('/catalogos', obtenerCatalogos);

// GET /api/pagos/pedido/:id_pedido - Historial de abonos de un pedido
router.get('/pedido/:id_pedido', obtenerPagosPorPedido);

// POST /api/pagos - Registrar un nuevo abono
router.post('/', registrarPago);

module.exports = router;
