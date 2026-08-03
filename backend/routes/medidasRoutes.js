const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const {
    crearMedida,
    obtenerMedidasPorCliente,
} = require('../controllers/medidasController');

// Todas las rutas de medidas requieren autenticación
router.use(verificarToken);

// POST /api/medidas                    — Registrar una nueva medida
// GET  /api/medidas/cliente/:id_cliente — Obtener medidas de un cliente
router.post('/', crearMedida);
router.get('/cliente/:id_cliente', obtenerMedidasPorCliente);

module.exports = router;
