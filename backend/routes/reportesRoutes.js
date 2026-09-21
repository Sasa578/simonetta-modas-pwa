const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const {
    obtenerReporteTaller,
    descargarReporteTallerPdf,
    descargarNotaVentaPdf
} = require('../controllers/reportesController');

router.use(verificarToken);

// GET /api/reportes/taller - Resumen analítico y balance de taller (JSON)
router.get('/taller', obtenerReporteTaller);

// GET /api/reportes/taller/pdf - Descarga de informe general de gestión en PDF
router.get('/taller/pdf', descargarReporteTallerPdf);

// GET /api/reportes/pedido/:id/pdf - Descarga de Nota de Venta / Factura de cliente en PDF
router.get('/pedido/:id/pdf', descargarNotaVentaPdf);

module.exports = router;
