const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { obtenerReporte, ejecutarPruebas, ejecutarPeticionPostman } = require('../controllers/pruebasController');

// GET /api/pruebas/reporte — Obtener último reporte Jest
router.get('/reporte', verificarToken, obtenerReporte);

// POST /api/pruebas/ejecutar — Disparar ejecución de pruebas Jest
router.post('/ejecutar', verificarToken, ejecutarPruebas);

// POST /api/pruebas/ejecutar-peticion — Proxy para Mini Postman
router.post('/ejecutar-peticion', verificarToken, ejecutarPeticionPostman);

module.exports = router;
