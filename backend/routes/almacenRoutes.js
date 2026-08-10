const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { obtenerAlmacen, agregarProducto, editarProducto, eliminarProducto } = require('../controllers/almacenController');

// Protegida
router.use(verificarToken);

// GET /api/almacen
router.get('/', obtenerAlmacen);
router.post('/', agregarProducto);
router.put('/:id', editarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
