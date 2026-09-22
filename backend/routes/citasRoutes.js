const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { crearCita, obtenerCitasPendientes, obtenerMisCitas, actualizarEstado, obtenerDisponibilidadCitas } = require('../controllers/citasController');

router.use(verificarToken);

// GET /api/citas/disponibilidad — Consultar citas activas para verificar días disponibles
router.get('/disponibilidad', obtenerDisponibilidadCitas);

// GET /api/citas/pendientes — Para Secretaría/Admin
router.get('/pendientes', obtenerCitasPendientes);

// GET /api/citas/mis-citas — Para el cliente
router.get('/mis-citas', obtenerMisCitas);

// POST /api/citas — Cliente crea una cita
router.post('/', crearCita);

// PUT /api/citas/:id/estado — Secretaría marca como Atendida/Cancelada
router.put('/:id/estado', actualizarEstado);

module.exports = router;
