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
            tipo_cuenta: esCliente ? 'cliente' : 'usuario',
            debe_cambiar_password: esCliente ? false : Boolean(usuario.debe_cambiar_password)
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
                tipo_cuenta: tokenPayload.tipo_cuenta,
                debe_cambiar_password: tokenPayload.debe_cambiar_password
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
    const { correo, password, nombre, apellido, nombre_completo, telefono_whatsapp, telefono, carnet_identidad } = req.body;
    const finalTelefono = (telefono_whatsapp || telefono || '').toString().trim();

    let finalNombre = nombre ? nombre.trim() : '';
    let finalApellido = apellido ? apellido.trim() : '';
    if (!finalNombre && nombre_completo) {
        const parts = nombre_completo.trim().split(' ');
        finalNombre = parts[0] || '';
        finalApellido = parts.slice(1).join(' ') || '';
    }

    if (!correo || !password || !finalNombre || !finalTelefono) {
        return res.status(400).json({ error: 'Nombre, teléfono/WhatsApp, correo y contraseña son obligatorios.' });
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
            nombre: finalNombre,
            apellido: finalApellido,
            nombre_completo: `${finalNombre} ${finalApellido}`.trim(),
            telefono_whatsapp: finalTelefono,
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

// PUT /api/auth/cambiar-password — Cambiar contraseña (primer login obligatorio o perfil)
const cambiarPassword = async (req, res) => {
    const { nueva_password, password_actual } = req.body;
    const id_usuario = req.usuario?.id_usuario;

    if (!id_usuario) {
        return res.status(403).json({ error: 'Solo los usuarios del sistema pueden cambiar su contraseña por esta vía.' });
    }

    if (!nueva_password || nueva_password.trim().length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    if (nueva_password.trim() === '123456') {
        return res.status(400).json({ error: 'Por seguridad, la nueva contraseña no puede ser la contraseña temporal por defecto.' });
    }

    try {
        const user = await UsuarioModel.buscarPorId(id_usuario);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Si no es primer inicio de sesión y envió password_actual, validarla
        if (!user.debe_cambiar_password && password_actual) {
            const valida = await bcrypt.compare(password_actual, user.password_hash);
            if (!valida) {
                return res.status(400).json({ error: 'La contraseña actual no es correcta.' });
            }
        }

        const actualizado = await UsuarioModel.cambiarPassword(id_usuario, nueva_password.trim());
        return res.json({
            mensaje: 'Contraseña actualizada exitosamente.',
            usuario: {
                id_usuario: actualizado.id_usuario,
                correo: actualizado.correo_electronico,
                debe_cambiar_password: false
            }
        });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return res.status(500).json({ error: 'Error interno del servidor al cambiar contraseña.' });
    }
};

module.exports = { login, registrarFcmToken, listarRoles, listarTiposCliente, registrarCliente, cambiarPassword };
