const ClienteModel = require('../models/ClienteModel');
const UsuarioModel = require('../models/UsuarioModel');
const db = require('../config/db');
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

// POST /api/clientes — Crear un nuevo cliente (Persona o Institucional)
const crearCliente = async (req, res) => {
    try {
        const {
            id_tipo_cliente = 1,
            tipo_cliente = 'Persona',
            correo_electronico,
            correo,
            password,
            nombre,
            apellido,
            nombre_completo,
            telefono,
            telefono_whatsapp,
            carnet_identidad,
            fecha_nacimiento,
            razon_social,
            nit,
            nombre_contacto,
            telefono_contacto,
            atributos,
            contrato
        } = req.body;

        const isInstitucional = Number(id_tipo_cliente) === 2 || tipo_cliente === 'Institucional';
        const rawPhone = telefono_whatsapp || telefono || telefono_contacto;

        if (isInstitucional) {
            if (!razon_social && !nombre_completo) {
                return res.status(400).json({ error: 'La razón social de la institución es obligatoria.' });
            }
            if (!nit && !carnet_identidad) {
                return res.status(400).json({ error: 'El NIT de la institución es obligatorio.' });
            }
        } else {
            if (!nombre_completo && !nombre) {
                return res.status(400).json({ error: 'El nombre del cliente es obligatorio.' });
            }
            if (!rawPhone) {
                return res.status(400).json({ error: 'El número de WhatsApp o teléfono es obligatorio.' });
            }
            if (rawPhone && !validarTelefono(rawPhone)) {
                return res.status(400).json({ error: 'El número de teléfono sólo debe contener dígitos numéricos (7 a 15 números).' });
            }
        }

        const email = correo || correo_electronico;
        if (email && !validarCorreo(sanearTexto(email))) {
            return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
        }

        const cliente = await ClienteModel.crear({
            id_tipo_cliente: isInstitucional ? 2 : 1,
            correo: email ? sanearTexto(email) : undefined,
            password: password || '123456',
            nombre: nombre ? sanearTexto(nombre) : undefined,
            apellido: apellido ? sanearTexto(apellido) : undefined,
            nombre_completo: nombre_completo ? sanearTexto(nombre_completo) : undefined,
            telefono: rawPhone ? sanearTexto(rawPhone) : undefined,
            telefono_whatsapp: rawPhone ? sanearTexto(rawPhone) : undefined,
            carnet_identidad: carnet_identidad ? sanearTexto(carnet_identidad) : undefined,
            fecha_nacimiento,
            razon_social: razon_social ? sanearTexto(razon_social) : undefined,
            nit: nit ? sanearTexto(nit) : undefined,
            nombre_contacto: nombre_contacto ? sanearTexto(nombre_contacto) : undefined,
            telefono_contacto: telefono_contacto ? sanearTexto(telefono_contacto) : undefined,
            atributos,
            contrato
        });

        return res.status(201).json({
            mensaje: 'Cliente registrado exitosamente.',
            cliente
        });
    } catch (error) {
        if (error.constraint === 'clientes_correo_electronico_key' || error.constraint === 'usuarios_correo_key') {
            return res.status(409).json({ error: 'El correo electrónico ya se encuentra registrado.' });
        }
        console.error('Error al crear cliente:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/clientes/:id — Actualizar un cliente
const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const body = { ...req.body };
        if (body.telefono_whatsapp && !validarTelefono(body.telefono_whatsapp)) {
            return res.status(400).json({ error: 'El número de WhatsApp sólo debe contener dígitos numéricos (7 a 15 números).' });
        }
        const cliente = await ClienteModel.actualizar(id, body);

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        return res.json({
            mensaje: 'Cliente actualizado exitosamente.',
            cliente
        });
    } catch (error) {
        if (error.constraint === 'clientes_correo_electronico_key' || error.constraint === 'usuarios_correo_key') {
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

module.exports = {
    listarClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};
