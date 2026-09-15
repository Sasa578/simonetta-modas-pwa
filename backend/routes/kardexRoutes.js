const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const {
    obtenerMovimientos,
    registrarMovimiento,
    obtenerCatalogos,
    obtenerProveedores,
    crearProveedor
} = require('../controllers/kardexController');

router.use(verificarToken);

// GET /api/kardex - Listado de auditoría de movimientos
router.get('/', obtenerMovimientos);

// GET /api/kardex/catalogos - Catálogos de tipos de movimiento, orígenes, proveedores e insumos
router.get('/catalogos', obtenerCatalogos);

// GET /api/kardex/proveedores - Listado de proveedores
router.get('/proveedores', obtenerProveedores);

// POST /api/kardex/proveedores - Registrar nuevo proveedor
router.post('/proveedores', crearProveedor);

// POST /api/kardex - Registrar movimiento (entrada, salida o ajuste)
router.post('/', registrarMovimiento);

module.exports = router;
