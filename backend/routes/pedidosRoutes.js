const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { crearPedido, obtenerPedidos, actualizarEstado, obtenerMetricas, obtenerPedidosCosturera } = require('../controllers/pedidosController');

// Todas las rutas de pedidos requieren autenticación
router.use(verificarToken);

// GET /api/pedidos — Obtener pedidos activos
router.get('/', obtenerPedidos);

// POST /api/pedidos — Crear un nuevo pedido con detalle de material
router.post('/', crearPedido);

// PUT /api/pedidos/:id/estado — Actualizar el estado de un pedido
router.put('/:id/estado', actualizarEstado);

// GET /api/pedidos/metricas — KPIs del dashboard (TI-4.1)
router.get('/metricas', obtenerMetricas);

// GET /api/pedidos/costurera/:id_costurera
router.get('/costurera/:id_costurera', obtenerPedidosCosturera);

module.exports = router;
