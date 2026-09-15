const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UsuarioModel = require('../models/UsuarioModel');
const ClienteModel = require('../models/ClienteModel');
const db = require('../config/db');
const { sanearTexto, validarCorreo } = require('../middleware/validaciones');

const JWT_SECRET = process.env.JWT_SECRET || 'simonetta_modas_jwt_secret_key_2026_safe';

// POST /api/auth/login — Inicio de sesión unificado (Personal o Clientes)
const login = async (req, res) => {
    let { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    correo = sanearTexto(correo);

    if (!validarCorreo(correo)) {
        return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
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

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const tokenPayload = {
            id_usuario: esCliente ? null : usuario.id_usuario,
            id_cliente: esCliente ? usuario.id_cliente : null,
            correo: usuario.correo_electronico || usuario.correo,
            rol: usuario.nombre_rol,
            nombre_completo: usuario.nombre_completo,
            telefono: usuario.telefono || usuario.telefono_whatsapp || null,
            debe_cambiar_password: Boolean(usuario.debe_cambiar_password),
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
                debe_cambiar_password: tokenPayload.debe_cambiar_password,
                tipo_cuenta: tokenPayload.tipo_cuenta
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/auth/cambiar-password-inicial
const cambiarPasswordInicial = async (req, res) => {
    try {
        const { nuevaPassword } = req.body;
        const id_usuario = req.usuario.id_usuario;

        if (!id_usuario) {
            return res.status(400).json({ error: 'Solo usuarios internos pueden cambiar contraseña con este método.' });
        }

        if (!nuevaPassword || nuevaPassword.trim().length < 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }

        const usuarioActualizado = await UsuarioModel.actualizarPasswordInicial(id_usuario, nuevaPassword.trim());
        if (!usuarioActualizado) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        return res.json({
            mensaje: 'Contraseña actualizada con éxito. Ya puedes usar tu nueva clave.',
            usuario: usuarioActualizado
        });
    } catch (error) {
        console.error('Error al cambiar contraseña inicial:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/auth/fcm-token
const registrarFcmToken = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token FCM requerido.' });
    }
    return res.json({ mensaje: 'Token FCM registrado exitosamente.' });
};

// GET /api/auth/roles
const listarRoles = async (req, res) => {
    try {
        const resultado = await db.query('SELECT id_rol, nombre_rol FROM roles ORDER BY id_rol');
        return res.json(resultado.rows);
    } catch (error) {
        console.error('Error al listar roles:', error);
        return res.status(500).json({ error: 'Error al obtener roles.' });
    }
};

// GET /api/auth/tipos-cliente
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
    let { correo, password, nombre_completo, telefono_whatsapp, carnet_identidad } = req.body;

    if (!correo || !password || !nombre_completo || !telefono_whatsapp) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
    }

    correo = sanearTexto(correo);
    nombre_completo = sanearTexto(nombre_completo);
    telefono_whatsapp = sanearTexto(telefono_whatsapp);

    if (!validarCorreo(correo)) {
        return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
    }

    try {
        const cleanCorreo = correo.trim().toLowerCase();

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

module.exports = { login, cambiarPasswordInicial, registrarFcmToken, listarRoles, listarTiposCliente, registrarCliente };
