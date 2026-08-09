const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { login, registrarFcmToken } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// PUT /api/auth/fcm-token — Registrar token FCM del dispositivo
router.put('/fcm-token', verificarToken, registrarFcmToken);

module.exports = router;
