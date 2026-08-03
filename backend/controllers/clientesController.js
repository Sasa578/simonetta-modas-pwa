const ClienteModel = require('../models/ClienteModel');

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
    const { nombre_completo, telefono_whatsapp, id_usuario } = req.body;

    if (!nombre_completo) {
        return res.status(400).json({ error: 'El nombre completo es obligatorio.' });
    }

    if (!telefono_whatsapp || telefono_whatsapp.trim() === '') {
        return res.status(400).json({ error: 'El número de WhatsApp es obligatorio.' });
    }

    try {
        const cliente = await ClienteModel.crear({
            nombre_completo,
            telefono_whatsapp: telefono_whatsapp.trim(),
            id_usuario,
        });

        return res.status(201).json({
            mensaje: 'Cliente creado exitosamente.',
            cliente,
        });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/clientes/:id — Actualizar un cliente
const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, telefono_whatsapp, id_usuario } = req.body;

    // Si se envía telefono_whatsapp, no puede ser vacío
    if (telefono_whatsapp !== undefined && telefono_whatsapp.trim() === '') {
        return res.status(400).json({ error: 'El número de WhatsApp no puede estar vacío.' });
    }

    try {
        const cliente = await ClienteModel.actualizar(id, {
            nombre_completo,
            telefono_whatsapp: telefono_whatsapp?.trim() || undefined,
            id_usuario,
        });

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        return res.json({
            mensaje: 'Cliente actualizado exitosamente.',
            cliente,
        });
    } catch (error) {
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

module.exports = {
    listarClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
};
