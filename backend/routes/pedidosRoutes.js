const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { crearPedido, obtenerPedidos, actualizarEstado } = require('../controllers/pedidosController');

// Todas las rutas de pedidos requieren autenticación
router.use(verificarToken);

// GET /api/pedidos — Obtener pedidos activos
router.get('/', obtenerPedidos);

// POST /api/pedidos — Crear un nuevo pedido con detalle de material
router.post('/', crearPedido);

// PUT /api/pedidos/:id/estado — Actualizar el estado de un pedido
router.put('/:id/estado', actualizarEstado);

module.exports = router;
