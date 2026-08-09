const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');
const db = require('../config/db');
require('dotenv').config();

// POST /api/auth/login
const login = async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    try {
        const usuario = await UsuarioModel.buscarPorCorreo(correo);

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const passwordValido = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValido) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                correo: usuario.correo,
                rol: usuario.nombre_rol,
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            mensaje: 'Inicio de sesión exitoso.',
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                correo: usuario.correo,
                rol: usuario.nombre_rol,
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/auth/fcm-token — Registrar token FCM del dispositivo (TI-4.4)
const registrarFcmToken = async (req, res) => {
    const { fcm_token } = req.body;
    const id_usuario = req.usuario?.id_usuario;

    if (!id_usuario || !fcm_token) {
        return res.status(400).json({ error: 'Token FCM e ID de usuario requeridos.' });
    }

    try {
        await db.query(
            'UPDATE usuarios SET fcm_token = $1 WHERE id_usuario = $2',
            [fcm_token, id_usuario]
        );
        return res.json({ mensaje: 'Token FCM registrado correctamente.' });
    } catch (error) {
        console.error('Error al registrar token FCM:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { login, registrarFcmToken };
