const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { login, registrarFcmToken, listarRoles, listarTiposCliente, registrarCliente } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register — Registrar cliente
router.post('/register', registrarCliente);

// GET /api/auth/roles — Listar roles
router.get('/roles', listarRoles);

// GET /api/auth/tipos-cliente — Listar tipos de cliente (Persona / Institucional)
router.get('/tipos-cliente', listarTiposCliente);

// PUT /api/auth/fcm-token — Registrar token FCM del dispositivo
router.put('/fcm-token', verificarToken, registrarFcmToken);

module.exports = router;
