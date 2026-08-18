const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');
const db = require('../config/db');
const { sanearTexto, validarCorreo } = require('../middleware/validaciones');
require('dotenv').config();

// POST /api/auth/login
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
                nombre_completo: usuario.nombre_completo,
                telefono: usuario.telefono,
                debe_cambiar_password: Boolean(usuario.debe_cambiar_password),
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
                nombre_completo: usuario.nombre_completo,
                telefono: usuario.telefono,
                debe_cambiar_password: Boolean(usuario.debe_cambiar_password),
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/auth/cambiar-password-inicial — Cambio obligatorio de contraseña genérica inicial
const cambiarPasswordInicial = async (req, res) => {
    const id_usuario = req.usuario?.id_usuario;
    let { passwordActual, nuevaPassword } = req.body;

    if (!id_usuario) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    if (!passwordActual || !nuevaPassword) {
        return res.status(400).json({ error: 'La contraseña actual y la nueva contraseña son obligatorias.' });
    }

    if (nuevaPassword.trim().length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const userRes = await db.query('SELECT id_usuario, password_hash FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        const usuario = userRes.rows[0];

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const valido = await bcrypt.compare(passwordActual, usuario.password_hash);
        if (!valido) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
        }

        await UsuarioModel.actualizarPasswordInicial(id_usuario, nuevaPassword.trim());

        return res.json({ mensaje: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
        console.error('Error al cambiar contraseña inicial:', error);
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
    let { correo, password, nombre_completo, telefono_whatsapp, carnet_identidad } = req.body;

    if (!correo || !password || !nombre_completo || !telefono_whatsapp) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    correo = sanearTexto(correo);
    nombre_completo = sanearTexto(nombre_completo);
    telefono_whatsapp = sanearTexto(telefono_whatsapp);

    if (!validarCorreo(correo)) {
        return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
    }

    try {
        await db.query('BEGIN');
        
        // Verificar si el correo existe
        const usuarioExistente = await UsuarioModel.buscarPorCorreo(correo);
        if (usuarioExistente) {
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
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
            'INSERT INTO usuarios (id_rol, correo, password_hash, nombre_completo, telefono, carnet_identidad, debe_cambiar_password) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING id_usuario',
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

module.exports = { login, cambiarPasswordInicial, registrarFcmToken, listarRoles, registrarCliente };
