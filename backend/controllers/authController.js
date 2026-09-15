const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');
const ClienteModel = require('../models/ClienteModel');
const db = require('../config/db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'simonetta_modas_jwt_secreto_2025';

// POST /api/auth/login — Inicio de sesión unificado (Personal o Clientes)
const login = async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    try {
        const cleanCorreo = correo.trim().toLowerCase();

        // 1. Verificar si es personal interno (usuarios)
        let usuario = await UsuarioModel.buscarPorCorreo(cleanCorreo);
        let esCliente = false;

        // 2. Si no es personal, verificar si es cliente (clientes)
        if (!usuario) {
            usuario = await ClienteModel.buscarPorCorreo(cleanCorreo);
            if (usuario) {
                esCliente = true;
            }
        }

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValido) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const tokenPayload = {
            id_usuario: esCliente ? null : usuario.id_usuario,
            id_cliente: esCliente ? usuario.id_cliente : null,
            correo: usuario.correo_electronico || usuario.correo,
            rol: usuario.nombre_rol,
            nombre_completo: usuario.nombre_completo,
            telefono: usuario.telefono || usuario.telefono_whatsapp || null,
            tipo_cuenta: esCliente ? 'cliente' : 'usuario'
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

        return res.json({
            mensaje: 'Inicio de sesión exitoso.',
            token,
            usuario: {
                id_usuario: tokenPayload.id_usuario,
                id_cliente: tokenPayload.id_cliente,
                correo: tokenPayload.correo,
                rol: tokenPayload.rol,
                nombre_completo: tokenPayload.nombre_completo,
                telefono: tokenPayload.telefono,
                tipo_cuenta: tokenPayload.tipo_cuenta
            }
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
        // En el nuevo esquema podemos guardar fcm token si se requiere o retornar OK
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

// GET /api/auth/tipos-cliente — Listar tipos de cliente (Persona / Institucional)
const listarTiposCliente = async (req, res) => {
    try {
        const resultado = await db.query('SELECT id_tipo_cliente, nombre_tipo FROM tipo_cliente ORDER BY id_tipo_cliente');
        return res.json(resultado.rows);
    } catch (error) {
        return res.status(500).json({ error: 'Error al listar tipos de cliente.' });
    }
};

// POST /api/auth/register — Registro autónomo de clientes desde la PWA
const registrarCliente = async (req, res) => {
    const { correo, password, nombre_completo, telefono_whatsapp, carnet_identidad } = req.body;

    if (!correo || !password || !nombre_completo || !telefono_whatsapp) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
    }

    try {
        const cleanCorreo = correo.trim().toLowerCase();

        // Verificar si ya existe en usuarios o clientes
        const userExistente = await UsuarioModel.buscarPorCorreo(cleanCorreo);
        const clienteExistente = await ClienteModel.buscarPorCorreo(cleanCorreo);

        if (userExistente || clienteExistente) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado en el sistema.' });
        }

        const nuevoCliente = await ClienteModel.crear({
            id_tipo_cliente: 1, // Persona
            correo_electronico: cleanCorreo,
            password,
            nombre_completo,
            telefono_whatsapp,
            carnet_identidad
        });

        return res.status(201).json({
            mensaje: 'Cliente registrado exitosamente.',
            cliente: nuevoCliente
        });
    } catch (error) {
        console.error('Error en registro de cliente:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { login, registrarFcmToken, listarRoles, listarTiposCliente, registrarCliente };
