const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { 
    crearPedido, 
    obtenerCatalogos, 
    obtenerPedidos, 
    actualizarEstado, 
    obtenerMetricas, 
    obtenerPedidosCosturera, 
    obtenerPedido, 
    actualizarPedido, 
    saldarYEntregar,
    obtenerCatalogoPrendas
} = require('../controllers/pedidosController');

// Todas las rutas de pedidos requieren autenticación
router.use(verificarToken);

// GET /api/pedidos/catalogos — Obtener estados de pedido y métodos de pago
router.get('/catalogos', obtenerCatalogos);

// GET /api/pedidos/catalogo-prendas — Catálogo de prendas de alta costura
router.get('/catalogo-prendas', obtenerCatalogoPrendas);

// GET /api/pedidos — Obtener pedidos activos
router.get('/', obtenerPedidos);

// POST /api/pedidos — Crear un nuevo pedido con detalle de material
router.post('/', crearPedido);

// GET /api/pedidos/metricas — KPIs del dashboard (TI-4.1)
router.get('/metricas', obtenerMetricas);

// GET /api/pedidos/:id — Obtener un pedido específico
router.get('/:id', obtenerPedido);

// PUT /api/pedidos/:id — Actualizar información básica de un pedido
router.put('/:id', actualizarPedido);

// PUT /api/pedidos/:id/estado — Actualizar el estado de un pedido
router.put('/:id/estado', actualizarEstado);

// PUT /api/pedidos/:id/saldar — Saldar y entregar pedido
router.put('/:id/saldar', saldarYEntregar);

// GET /api/pedidos/costurera/:id_costurera
router.get('/costurera/:id_costurera', obtenerPedidosCosturera);

module.exports = router;
