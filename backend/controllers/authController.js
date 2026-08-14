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

// GET /api/auth/roles — Listar roles disponibles
const listarRoles = async (req, res) => {
    try {
        const resultado = await db.query('SELECT id_rol, nombre_rol FROM roles ORDER BY id_rol');
        return res.json(resultado.rows);
    } catch (error) {
        return res.status(500).json({ error: 'Error al listar roles.' });
    }
};

// POST /api/auth/register — Registro de clientes
const registrarCliente = async (req, res) => {
    const { correo, password, nombre_completo, telefono_whatsapp, carnet_identidad } = req.body;

    if (!correo || !password || !nombre_completo || !telefono_whatsapp) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        await db.query('BEGIN');
        
        // Verificar si el correo existe
        const usuarioExistente = await UsuarioModel.buscarPorCorreo(correo);
        if (usuarioExistente) {
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }

        // Obtener ID del rol Cliente
        const rolQuery = await db.query("SELECT id_rol FROM roles WHERE nombre_rol = 'Cliente'");
        if (rolQuery.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(500).json({ error: 'El rol Cliente no existe en el sistema.' });
        }
        const id_rol = rolQuery.rows[0].id_rol;

        // Hashear password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Insertar usuario
        const usuarioRes = await db.query(
            'INSERT INTO usuarios (id_rol, correo, password_hash, nombre_completo, telefono, carnet_identidad) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_usuario',
            [id_rol, correo, hash, nombre_completo, telefono_whatsapp, carnet_identidad || null]
        );
        const id_usuario = usuarioRes.rows[0].id_usuario;

        // Insertar cliente
        await db.query(
            'INSERT INTO clientes (id_usuario, nombre_completo, telefono_whatsapp) VALUES ($1, $2, $3)',
            [id_usuario, nombre_completo, telefono_whatsapp]
        );

        await db.query('COMMIT');
        return res.status(201).json({ mensaje: 'Cliente registrado exitosamente.' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error en registro:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { login, registrarFcmToken, listarRoles, registrarCliente };
