const PedidoModel = require('../models/PedidoModel');

// POST /api/pedidos — Crear un pedido con detalle de material
const crearPedido = async (req, res) => {
    try {
        const {
            id_cliente,
            id_costurera,
            fecha_entrega,
            fecha_prueba,
            costo_total,
            adelanto,
            // Material (HU-05)
            descripcion_tela,
            origen_material,
            cantidad_metros,
        } = req.body;

        // --- Validaciones HU-04 ---

        if (!id_cliente) {
            return res.status(400).json({ error: 'El cliente es obligatorio.' });
        }

        if (!fecha_entrega) {
            return res.status(400).json({ error: 'La fecha de entrega es obligatoria.' });
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaEntregaDate = new Date(fecha_entrega);
        fechaEntregaDate.setHours(0, 0, 0, 0);

        if (fechaEntregaDate < hoy) {
            return res.status(400).json({ error: 'La fecha de entrega no puede ser anterior a hoy.' });
        }

        if (costo_total === undefined || costo_total === null || parseFloat(costo_total) < 0) {
            return res.status(400).json({ error: 'El costo total debe ser un número mayor o igual a 0.' });
        }

        const costo = parseFloat(costo_total);
        const adelantoFloat = parseFloat(adelanto || 0);

        if (adelantoFloat < 0) {
            return res.status(400).json({ error: 'El adelanto no puede ser negativo.' });
        }

        // Cálculo del saldo (NUNCA confiado del frontend)
        const saldoCalculado = costo - adelantoFloat;

        // --- Validaciones HU-05 ---

        if (!descripcion_tela) {
            return res.status(400).json({ error: 'La descripción de la tela es obligatoria.' });
        }

        if (!origen_material || !['Taller', 'Cliente'].includes(origen_material)) {
            return res.status(400).json({ error: 'El origen del material debe ser "Taller" o "Cliente".' });
        }

        // --- Persistencia (transacción atómica) ---

        const resultado = await PedidoModel.crearPedido(
            {
                id_cliente,
                id_costurera,
                fecha_entrega,
                fecha_prueba: fecha_prueba || null,
                costo_total: costo,
                adelanto: adelantoFloat,
                saldo: saldoCalculado,
                estado: 'Pendiente',
            },
            {
                descripcion_tela,
                origen_material,
                cantidad_metros: cantidad_metros || null,
            }
        );

        // Emitir evento en tiempo real
        const io = req.app.get('io');
        if (io) io.emit('actualizacion_datos');

        return res.status(201).json({
            mensaje: 'Pedido creado exitosamente.',
            pedido: resultado.pedido,
            detalle_material: resultado.detalle,
        });
    } catch (error) {
        console.error('Error al crear pedido:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// GET /api/pedidos
const obtenerPedidos = async (req, res) => {
    try {
        if (req.usuario && req.usuario.rol === 'Cliente') {
            const { obtenerIdsClienteParaUsuario } = require('../utils/clienteHelper');
            const idsCliente = await obtenerIdsClienteParaUsuario(req.usuario.id_usuario, req.usuario.correo);
            
            if (idsCliente.length === 0) {
                return res.json([]);
            }

            const pedidos = await PedidoModel.obtenerPedidosPorClienteIds(idsCliente);
            return res.json(pedidos);
        }

        const pedidos = await PedidoModel.obtenerPedidosActivos();
        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// PUT /api/pedidos/:id/estado
const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        const pedido = await PedidoModel.actualizarEstado(id, estado);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // TI-4.3: Disparar notificación cuando el pedido está "Listo para Prueba" o "Terminado"
        if (estado === 'Listo para Prueba' || estado === 'Terminado') {
            const notificacion = require('../config/firebase');
            const cliente = await PedidoModel.obtenerClienteDelPedido(id);
            
            const mensajes = {
                'Listo para Prueba': { titulo: '👗 ¡Tu prenda está lista para prueba!', cuerpo: (nombre) => `Hola ${nombre}, tu pedido #${id} ya está listo para que lo pruebes.` },
                'Terminado': { titulo: '✅ ¡Pedido completado!', cuerpo: (nombre) => `Hola ${nombre}, tu pedido #${id} ha sido finalizado. ¡Gracias por confiar en Simonetta!` },
            };
            
            const msg = mensajes[estado];
            if (cliente && cliente.fcm_token && msg) {
                await notificacion.enviarNotificacion(cliente.fcm_token, {
                    titulo: msg.titulo,
                    cuerpo: msg.cuerpo(cliente.nombre_completo),
                    datos: { pedidoId: String(id), accion: estado === 'Terminado' ? 'finalizado' : 'prueba' },
                });
            } else {
                console.log(`📢 [SIMULADO] Notificación "${estado}" para pedido #${id} — cliente sin FCM token`);
            }
        }

        // Emitir evento en tiempo real
        const io = req.app.get('io');
        if (io) io.emit('actualizacion_datos');

        res.json(pedido);
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// GET /api/metricas — KPIs para dashboard gerencial (TI-4.1)
const obtenerMetricas = async (req, res) => {
    try {
        const metricas = await PedidoModel.obtenerMetricas();
        return res.json(metricas);
    } catch (error) {
        console.error('Error al obtener métricas:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// GET /api/pedidos/costurera/:id_costurera
const obtenerPedidosCosturera = async (req, res) => {
    try {
        const { id_costurera } = req.params;
        const pedidos = await PedidoModel.obtenerPedidosPorCosturera(id_costurera);
        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos de costurera:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// GET /api/pedidos/:id
const obtenerPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await PedidoModel.obtenerPedidoPorId(id);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        res.json(pedido);
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// PUT /api/pedidos/:id
const actualizarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_costurera, fecha_entrega, fecha_prueba, costo_total, adelanto } = req.body;

        const pedidoExistente = await PedidoModel.obtenerPedidoPorId(id);
        if (!pedidoExistente) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        if (!fecha_entrega) {
            return res.status(400).json({ error: 'La fecha de entrega es obligatoria.' });
        }

        if (costo_total === undefined || costo_total === null || parseFloat(costo_total) < 0) {
            return res.status(400).json({ error: 'El costo total debe ser un número mayor o igual a 0.' });
        }

        const costo = parseFloat(costo_total);
        const adelantoFloat = parseFloat(adelanto || 0);

        if (adelantoFloat < 0) {
            return res.status(400).json({ error: 'El adelanto no puede ser negativo.' });
        }
        
        if (adelantoFloat > costo) {
            return res.status(400).json({ error: 'El adelanto no puede ser mayor al costo total.' });
        }

        const saldoCalculado = costo - adelantoFloat;

        const pedidoActualizado = await PedidoModel.actualizarPedidoBasico(id, {
            id_costurera,
            fecha_entrega,
            fecha_prueba,
            costo_total: costo,
            adelanto: adelantoFloat,
            saldo: saldoCalculado
        });

        // Emitir evento en tiempo real
        const io = req.app.get('io');
        if (io) io.emit('actualizacion_datos');

        res.json({
            mensaje: 'Pedido actualizado correctamente',
            pedido: pedidoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { crearPedido, obtenerPedidos, actualizarEstado, obtenerMetricas, obtenerPedidosCosturera, obtenerPedido, actualizarPedido };
