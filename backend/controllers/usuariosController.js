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
        const { correo, password, id_rol } = req.body;
        if (!correo || !password || !id_rol) {
            return res.status(400).json({ error: 'Correo, contraseña y rol son obligatorios.' });
        }
        const usuario = await UsuarioModel.crear({ correo, password, id_rol });
        return res.status(201).json({ mensaje: 'Usuario creado.', usuario });
    } catch (error) {
        if (error.constraint === 'usuarios_correo_key') {
            return res.status(409).json({ error: 'El correo ya está registrado.' });
        }
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/usuarios/:id — Actualizar usuario
const actualizarUsuario = async (req, res) => {
    try {
        const usuario = await UsuarioModel.actualizar(req.params.id, req.body);
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

// GET /api/usuarios/costureras — Listar solo costureras (acceso para Secretaria/Admin)
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
