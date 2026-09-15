const ClienteModel = require('../models/ClienteModel');
const UsuarioModel = require('../models/UsuarioModel');
const db = require('../config/db');

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
            // Persona
            nombre,
            apellido,
            nombre_completo,
            telefono,
            telefono_whatsapp,
            carnet_identidad,
            fecha_nacimiento,
            // Institucional
            razon_social,
            nit,
            nombre_contacto,
            telefono_contacto,
            // Atributos y Contrato
            atributos,
            contrato
        } = req.body;

        const isInstitucional = Number(id_tipo_cliente) === 2 || tipo_cliente === 'Institucional';

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
            if (!telefono_whatsapp && !telefono) {
                return res.status(400).json({ error: 'El número de teléfono o WhatsApp es obligatorio.' });
            }
        }

        const cliente = await ClienteModel.crear({
            id_tipo_cliente: isInstitucional ? 2 : 1,
            correo: correo || correo_electronico,
            password: password || '123456',
            nombre,
            apellido,
            nombre_completo,
            telefono: telefono || telefono_whatsapp,
            telefono_whatsapp: telefono_whatsapp || telefono,
            carnet_identidad,
            fecha_nacimiento,
            razon_social,
            nit,
            nombre_contacto,
            telefono_contacto,
            atributos,
            contrato
        });

        return res.status(201).json({
            mensaje: 'Cliente registrado exitosamente.',
            cliente
        });
    } catch (error) {
        if (error.constraint === 'clientes_correo_electronico_key') {
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
        const cliente = await ClienteModel.actualizar(id, req.body);

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        return res.json({
            mensaje: 'Cliente actualizado exitosamente.',
            cliente
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

// GET /api/clientes/mi-perfil — Perfil del usuario o cliente autenticado
const obtenerMiPerfil = async (req, res) => {
    try {
        const esCliente = req.usuario.tipo_cuenta === 'cliente' || req.usuario.rol === 'Cliente';
        const correo = req.usuario.correo;

        if (esCliente) {
            // Buscar por id_cliente o correo
            let cliente = null;
            if (req.usuario.id_cliente) {
                cliente = await ClienteModel.buscarPorId(req.usuario.id_cliente);
            }
            if (!cliente && correo) {
                cliente = await ClienteModel.buscarPorCorreo(correo);
            }

            // Buscar últimas medidas registradas en algún pedido del cliente
            let medidas = null;
            if (cliente) {
                const medidasRes = await db.query(
                    `SELECT ma.*, p.fecha_inicio as fecha_toma, pr.tipo_prenda
                     FROM pedidos p
                     JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
                     JOIN prendas pr ON dp.id_prenda = pr.id_prenda
                     JOIN medidas_anatomicas ma ON dp.id_detalle = ma.id_detalle
                     WHERE p.id_cliente = $1
                     ORDER BY p.fecha_inicio DESC, ma.id_medida_anatomica DESC
                     LIMIT 1`,
                    [cliente.id_cliente]
                );
                medidas = medidasRes.rows[0] || null;
            }

            return res.json({
                cliente,
                medidas
            });
        } else {
            // Personal interno
            const usuario = await UsuarioModel.buscarPorId(req.usuario.id_usuario);
            return res.json({
                cliente: usuario,
                medidas: null
            });
        }
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
    obtenerMiPerfil
};
