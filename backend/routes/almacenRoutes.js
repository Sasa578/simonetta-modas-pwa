const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const {
    obtenerAlmacen,
    obtenerCatalogosAlmacen,
    obtenerProductoPorId,
    agregarProducto,
    editarProducto,
    eliminarProducto
} = require('../controllers/almacenController');

// Todas las rutas de almacén requieren autenticación
router.use(verificarToken);

// GET /api/almacen
router.get('/', obtenerAlmacen);

// GET /api/almacen/catalogos
router.get('/catalogos', obtenerCatalogosAlmacen);

// GET /api/almacen/:id
router.get('/:id', obtenerProductoPorId);

// POST /api/almacen
router.post('/', agregarProducto);

// PUT /api/almacen/:id
router.put('/:id', editarProducto);

// DELETE /api/almacen/:id
router.delete('/:id', eliminarProducto);

module.exports = router;
