const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const {
    listarClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
} = require('../controllers/clientesController');

// Todas las rutas de clientes requieren autenticación
router.use(verificarToken);

// GET    /api/clientes        — Listar todos los clientes
// POST   /api/clientes        — Crear un nuevo cliente
router.route('/')
    .get(listarClientes)
    .post(crearCliente);

// GET    /api/clientes/:id    — Obtener un cliente
// PUT    /api/clientes/:id    — Actualizar un cliente
// DELETE /api/clientes/:id    — Eliminar un cliente
router.route('/:id')
    .get(obtenerCliente)
    .put(actualizarCliente)
    .delete(eliminarCliente);

module.exports = router;
