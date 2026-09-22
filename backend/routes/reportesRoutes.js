const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const {
    obtenerReporteTaller,
    descargarReporteTallerPdf,
    descargarNotaVentaPdf,
    enviarReporteTallerEmail,
    enviarNotaVentaEmail,
    verificarEstadoCorreo
} = require('../controllers/reportesController');

router.use(verificarToken);

// GET /api/reportes/taller - Resumen analítico y balance de taller (JSON)
router.get('/taller', obtenerReporteTaller);

// GET /api/reportes/taller/pdf - Descarga de informe general de gestión en PDF
router.get('/taller/pdf', descargarReporteTallerPdf);

// GET /api/reportes/pedido/:id/pdf - Descarga de Nota de Venta / Factura de cliente en PDF
router.get('/pedido/:id/pdf', descargarNotaVentaPdf);

// POST /api/reportes/taller/enviar-correo - Envía el reporte general del taller por correo al Admin
router.post('/taller/enviar-correo', enviarReporteTallerEmail);

// POST /api/reportes/pedido/:id/enviar-correo - Envía la nota de venta por correo al cliente
router.post('/pedido/:id/enviar-correo', enviarNotaVentaEmail);

// GET /api/reportes/verificar-correo - Diagnóstico de conexión SMTP
router.get('/verificar-correo', verificarEstadoCorreo);

module.exports = router;
