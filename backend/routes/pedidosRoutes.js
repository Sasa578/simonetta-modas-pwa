const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { crearPedido } = require('../controllers/pedidosController');

// Todas las rutas de pedidos requieren autenticación
router.use(verificarToken);

// POST /api/pedidos — Crear un nuevo pedido con detalle de material
router.post('/', crearPedido);

module.exports = router;
