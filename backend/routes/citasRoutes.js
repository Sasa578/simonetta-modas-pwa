const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { crearCita, obtenerCitasPendientes, obtenerMisCitas, actualizarEstado } = require('../controllers/citasController');

router.use(verificarToken);

// GET /api/citas/pendientes — Para Secretaría/Admin
router.get('/pendientes', obtenerCitasPendientes);

// GET /api/citas/mis-citas — Para el cliente
router.get('/mis-citas', obtenerMisCitas);

// POST /api/citas — Cliente crea una cita
router.post('/', crearCita);

// PUT /api/citas/:id/estado — Secretaría marca como Atendida/Cancelada
router.put('/:id/estado', actualizarEstado);

module.exports = router;
