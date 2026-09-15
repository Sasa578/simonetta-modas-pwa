const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { login, cambiarPasswordInicial, registrarFcmToken, listarRoles, listarTiposCliente, registrarCliente } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register — Registro de clientes
router.post('/register', registrarCliente);

// GET /api/auth/roles — Listar roles
router.get('/roles', listarRoles);

// GET /api/auth/tipos-cliente — Listar tipos de cliente (Persona / Institucional)
router.get('/tipos-cliente', listarTiposCliente);

// PUT /api/auth/cambiar-password-inicial — Cambio obligatorio de clave genérica inicial
router.put('/cambiar-password-inicial', verificarToken, cambiarPasswordInicial);

// PUT /api/auth/fcm-token — Registrar token FCM del dispositivo
router.put('/fcm-token', verificarToken, registrarFcmToken);

module.exports = router;
