const ClienteModel = require('../models/ClienteModel');
const { sanearTexto, validarCorreo, validarTelefono } = require('../middleware/validaciones');

// GET /api/clientes — Listar todos los clientes
const listarClientes = async (req, res) => {
    try {
        const clientes = await ClienteModel.listarTodos();
        return res.json(clientes);
    } catch (error) {
        console.error('Error al listar clientes:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// GET /api/clientes/:id — Obtener un cliente por ID
const obtenerCliente = async (req, res) => {
    try {
        const cliente = await ClienteModel.buscarPorId(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        return res.json(cliente);
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// POST /api/clientes — Crear un nuevo cliente
const crearCliente = async (req, res) => {
    let { nombre_completo, telefono_whatsapp, id_usuario, carnet_identidad, correo, password } = req.body;

    if (!nombre_completo) {
        return res.status(400).json({ error: 'El nombre completo es obligatorio.' });
    }

    if (!telefono_whatsapp || telefono_whatsapp.trim() === '') {
        return res.status(400).json({ error: 'El número de WhatsApp es obligatorio.' });
    }

    nombre_completo = sanearTexto(nombre_completo);
    telefono_whatsapp = sanearTexto(telefono_whatsapp);
    if (correo) correo = sanearTexto(correo);

    if (!validarTelefono(telefono_whatsapp)) {
        return res.status(400).json({ error: 'El número de WhatsApp sólo debe contener dígitos numéricos (7 a 15 números).' });
    }

    if (correo && !validarCorreo(correo)) {
        return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
    }

    try {
        const cliente = await ClienteModel.crear({
            nombre_completo,
            telefono_whatsapp: telefono_whatsapp.trim(),
            id_usuario,
            correo,
            password,
        });

        return res.status(201).json({
            mensaje: 'Cliente creado exitosamente.',
            cliente,
        });
    } catch (error) {
        if (error.constraint === 'usuarios_correo_key') {
            return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
        }
        console.error('Error al crear cliente:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/clientes/:id — Actualizar un cliente
const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    let { nombre_completo, telefono_whatsapp, id_usuario, carnet_identidad, correo, password } = req.body;

    if (nombre_completo) nombre_completo = sanearTexto(nombre_completo);
    if (telefono_whatsapp) telefono_whatsapp = sanearTexto(telefono_whatsapp);
    if (correo) correo = sanearTexto(correo);

    if (telefono_whatsapp !== undefined && !validarTelefono(telefono_whatsapp)) {
        return res.status(400).json({ error: 'El número de WhatsApp sólo debe contener dígitos numéricos (7 a 15 números).' });
    }

    if (correo && !validarCorreo(correo)) {
        return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
    }

    try {
        const cliente = await ClienteModel.actualizar(id, {
            nombre_completo,
            telefono_whatsapp: telefono_whatsapp?.trim() || undefined,
            id_usuario,
            correo,
            password,
        });

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        return res.json({
            mensaje: 'Cliente actualizado exitosamente.',
            cliente,
        });
    } catch (error) {
        if (error.constraint === 'usuarios_correo_key') {
            return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
        }
        console.error('Error al actualizar cliente:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// DELETE /api/clientes/:id — Eliminar un cliente
const eliminarCliente = async (req, res) => {
    try {
        const eliminado = await ClienteModel.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        return res.json({ mensaje: 'Cliente eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// GET /api/clientes/mi-perfil — Obtener perfil y medidas del cliente logueado
const obtenerMiPerfil = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const correo = req.usuario.correo;
        const db = require('../config/db');
        const { obtenerIdsClienteParaUsuario } = require('../utils/clienteHelper');

        const idsCliente = await obtenerIdsClienteParaUsuario(id_usuario, correo);

        if (idsCliente.length === 0) {
            const userRes = await db.pool.query('SELECT id_usuario, correo, id_rol as rol, nombre_completo, telefono, carnet_identidad, fecha_registro FROM usuarios WHERE id_usuario = $1', [id_usuario]);
            return res.json({ cliente: userRes.rows[0] || null, medidas: null });
        }

        const clienteRes = await db.pool.query(
            `SELECT c.id_cliente, COALESCE(u.nombre_completo, c.nombre_completo) as nombre_completo, COALESCE(u.telefono, c.telefono_whatsapp) as telefono_whatsapp, u.correo, u.id_rol as rol, u.carnet_identidad, u.fecha_registro
             FROM clientes c
             LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
             WHERE c.id_cliente = ANY($1::int[])
             ORDER BY c.id_cliente DESC LIMIT 1`,
            [idsCliente]
        );

        const cliente = clienteRes.rows[0];
        const medidasRes = await db.pool.query(
            `SELECT * FROM medidas WHERE id_cliente = ANY($1::int[]) ORDER BY fecha_toma DESC, id_medida DESC LIMIT 1`,
            [idsCliente]
        );

        return res.json({
            cliente,
            medidas: medidasRes.rows[0] || null
        });
    } catch (error) {
        console.error('Error al obtener mi perfil:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    listarClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    obtenerMiPerfil,
};
