const UsuarioModel = require('../models/UsuarioModel');

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
        const { correo, correo_electronico, password, id_rol, nombre, apellido, nombre_completo, carnet_identidad, telefono, fecha_nacimiento } = req.body;
        const email = correo_electronico || correo;
        
        if (!email || !id_rol) {
            return res.status(400).json({ error: 'Correo electrónico y rol son obligatorios.' });
        }

        // Exclusión estricta de rol Cliente para usuarios del personal
        if (Number(id_rol) === 4) {
            return res.status(400).json({ error: 'No se puede asignar el rol de Cliente a un usuario del personal. Los clientes se gestionan en el módulo de clientes.' });
        }

        if (!nombre && !nombre_completo) {
            return res.status(400).json({ error: 'El nombre del usuario es obligatorio.' });
        }

        // Contraseña por defecto si no se ingresa manualmente
        const passFinal = (password && password.trim()) ? password.trim() : '123456';

        const usuario = await UsuarioModel.crear({
            correo: email,
            password: passFinal,
            id_rol: Number(id_rol),
            nombre,
            apellido,
            nombre_completo,
            carnet_identidad,
            telefono,
            fecha_nacimiento,
            debe_cambiar_password: true
        });
        return res.status(201).json({ mensaje: 'Usuario creado exitosamente.', usuario });
    } catch (error) {
        if (error.constraint === 'usuarios_correo_electronico_key') {
            return res.status(409).json({ error: 'El correo ya está registrado.' });
        }
        if (error.constraint === 'datos_usuario_carnet_identidad_key') {
            return res.status(409).json({ error: 'El número de carnet ya está registrado.' });
        }
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/usuarios/:id — Actualizar usuario
const actualizarUsuario = async (req, res) => {
    try {
        if (req.body.id_rol && Number(req.body.id_rol) === 4) {
            return res.status(400).json({ error: 'No se puede asignar el rol de Cliente a un usuario del personal.' });
        }

        const usuario = await UsuarioModel.actualizar(req.params.id, req.body);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
        return res.json({ mensaje: 'Usuario actualizado exitosamente.', usuario });
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
