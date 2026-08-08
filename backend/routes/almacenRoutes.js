const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { obtenerAlmacen } = require('../controllers/almacenController');

// Protegida
router.use(verificarToken);

// GET /api/almacen
router.get('/', obtenerAlmacen);

module.exports = router;
