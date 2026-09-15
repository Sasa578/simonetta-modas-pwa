const UsuarioModel = require('../models/UsuarioModel');
const { sanearTexto, validarCorreo, validarTelefono } = require('../middleware/validaciones');

// GET /api/usuarios — Listar todos los usuarios
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
        let { correo, correo_electronico, password, id_rol, nombre, apellido, nombre_completo, carnet_identidad, telefono, fecha_nacimiento, debe_cambiar_password } = req.body;
        const email = correo_electronico || correo;

        if (!email || !id_rol) {
            return res.status(400).json({ error: 'El correo electrónico y el rol son obligatorios.' });
        }

        const cleanEmail = sanearTexto(email);
        if (!validarCorreo(cleanEmail)) {
            return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
        }

        if (telefono && !validarTelefono(telefono)) {
            return res.status(400).json({ error: 'El número de teléfono sólo debe contener dígitos numéricos (7 a 15 números).' });
        }

        // Si no se asigna contraseña explícita, usar la clave genérica 12345678 y exigir cambio en primer inicio
        const passwordFinal = (password && password.trim().length > 0) ? password.trim() : '12345678';
        const requiereCambioKey = (debe_cambiar_password !== undefined) ? Boolean(debe_cambiar_password) : (password ? false : true);

        const usuario = await UsuarioModel.crear({
            correo: cleanEmail,
            password: passwordFinal,
            id_rol,
            nombre: nombre ? sanearTexto(nombre) : undefined,
            apellido: apellido ? sanearTexto(apellido) : undefined,
            nombre_completo: nombre_completo ? sanearTexto(nombre_completo) : undefined,
            carnet_identidad: carnet_identidad ? sanearTexto(carnet_identidad) : undefined,
            telefono: telefono ? sanearTexto(telefono) : undefined,
            fecha_nacimiento,
            debe_cambiar_password: requiereCambioKey
        });

        return res.status(201).json({
            mensaje: 'Usuario creado exitosamente. Se ha asignado clave genérica inicial.',
            usuario
        });
    } catch (error) {
        if (error.constraint === 'usuarios_correo_electronico_key' || error.constraint === 'usuarios_correo_key') {
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
        let { correo, correo_electronico, password, id_rol, nombre, apellido, nombre_completo, carnet_identidad, telefono, fecha_nacimiento, debe_cambiar_password } = req.body;
        const email = correo_electronico || correo;

        if (email && !validarCorreo(sanearTexto(email))) {
            return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
        }

        if (telefono && !validarTelefono(telefono)) {
            return res.status(400).json({ error: 'El número de teléfono sólo debe contener dígitos numéricos (7 a 15 números).' });
        }

        const usuario = await UsuarioModel.actualizar(req.params.id, {
            correo: email ? sanearTexto(email) : undefined,
            password: password ? password.trim() : undefined,
            id_rol,
            nombre: nombre ? sanearTexto(nombre) : undefined,
            apellido: apellido ? sanearTexto(apellido) : undefined,
            nombre_completo: nombre_completo ? sanearTexto(nombre_completo) : undefined,
            carnet_identidad: carnet_identidad ? sanearTexto(carnet_identidad) : undefined,
            telefono: telefono ? sanearTexto(telefono) : undefined,
            fecha_nacimiento,
            debe_cambiar_password
        });

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
        const eliminado = await UsuarioModel.eliminar(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado.' });
        return res.json({ mensaje: 'Usuario eliminado exitosamente.' });
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
