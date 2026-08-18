const UsuarioModel = require('../models/UsuarioModel');
const { sanearTexto, validarCorreo, validarTelefono } = require('../middleware/validaciones');

// GET /api/usuarios — Listar todos (solo Admin)
const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await UsuarioModel.listarTodos();
        return res.json(usuarios);
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// POST /api/usuarios — Crear usuario
const crearUsuario = async (req, res) => {
    try {
        let { correo, password, id_rol, nombre_completo, carnet_identidad, telefono, debe_cambiar_password } = req.body;

        correo = sanearTexto(correo);
        nombre_completo = sanearTexto(nombre_completo);
        carnet_identidad = sanearTexto(carnet_identidad);
        telefono = sanearTexto(telefono);

        if (!correo || !id_rol) {
            return res.status(400).json({ error: 'El correo electrónico y el rol son obligatorios.' });
        }

        if (!validarCorreo(correo)) {
            return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
        }

        if (telefono && !validarTelefono(telefono)) {
            return res.status(400).json({ error: 'El número de teléfono sólo debe contener dígitos numéricos (7 a 15 números).' });
        }

        // Si no se asigna contraseña explícita, usar la clave genérica 12345678 y exigir cambio en primer inicio
        const passwordFinal = (password && password.trim().length > 0) ? password.trim() : '12345678';
        const requiereCambioKey = (debe_cambiar_password !== undefined) ? Boolean(debe_cambiar_password) : true;

        const usuario = await UsuarioModel.crear({
            correo,
            password: passwordFinal,
            id_rol,
            nombre_completo,
            carnet_identidad,
            telefono,
            debe_cambiar_password: requiereCambioKey,
        });

        return res.status(201).json({
            mensaje: 'Usuario creado exitosamente. Se ha asignado clave genérica inicial.',
            usuario
        });
    } catch (error) {
        if (error.constraint === 'usuarios_correo_key') {
            return res.status(409).json({ error: 'El correo electrónico ya se encuentra registrado.' });
        }
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/usuarios/:id — Actualizar usuario
const actualizarUsuario = async (req, res) => {
    try {
        let { correo, password, id_rol, nombre_completo, carnet_identidad, telefono, debe_cambiar_password } = req.body;

        if (correo) correo = sanearTexto(correo);
        if (nombre_completo) nombre_completo = sanearTexto(nombre_completo);
        if (carnet_identidad) carnet_identidad = sanearTexto(carnet_identidad);
        if (telefono) telefono = sanearTexto(telefono);

        if (correo && !validarCorreo(correo)) {
            return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
        }

        if (telefono && !validarTelefono(telefono)) {
            return res.status(400).json({ error: 'El número de teléfono sólo debe contener dígitos numéricos (7 a 15 números).' });
        }

        const usuario = await UsuarioModel.actualizar(req.params.id, {
            correo,
            password: password ? password.trim() : undefined,
            id_rol,
            nombre_completo,
            carnet_identidad,
            telefono,
            debe_cambiar_password,
        });

        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
        return res.json({ mensaje: 'Usuario actualizado.', usuario });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// DELETE /api/usuarios/:id — Eliminar usuario
const eliminarUsuario = async (req, res) => {
    try {
        const ok = await UsuarioModel.eliminar(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Usuario no encontrado.' });
        return res.json({ mensaje: 'Usuario eliminado.' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// GET /api/usuarios/costureras — Listar solo costureras
const listarCostureras = async (req, res) => {
    try {
        const usuarios = await UsuarioModel.listarTodos();
        const costureras = usuarios.filter(u => u.nombre_rol === 'Costurera');
        return res.json(costureras);
    } catch (error) {
        console.error('Error al listar costureras:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, listarCostureras };
