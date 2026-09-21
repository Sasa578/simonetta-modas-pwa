const PedidoModel = require('../models/PedidoModel');
const db = require('../config/db');

// POST /api/pedidos — Crear un pedido con detalle de prenda, medidas, pagos y citas
const crearPedido = async (req, res) => {
    try {
        const {
            id_cliente,
            id_costurera,
            fecha_entrega,
            fecha_prueba,
            costo_total,
            adelanto,
            id_metodo_pago,
            // Prenda y diseño
            tipo_prenda,
            prenda,
            color,
            notas_diseno,
            talla,
            medidas,
            medidas_anatomicas,
            // Material (opcional o compatibilidad HU-05)
            descripcion_tela,
            origen_material,
            id_material,
            cantidad_metros,
            insumos,
        } = req.body;

        // --- Validaciones ---
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

        const nombrePrenda = tipo_prenda || prenda || descripcion_tela || 'Prenda a Medida';
        const colorPrenda = color || 'A elección';
        const origen = origen_material || 'Taller';

        // --- Persistencia (transacción atómica) ---
        const pedidoCreado = await PedidoModel.crearPedido(
            {
                id_cliente: Number(id_cliente),
                id_costurera: id_costurera ? Number(id_costurera) : null,
                fecha_entrega,
                fecha_prueba: fecha_prueba || null,
                costo_total: costo,
                adelanto: adelantoFloat,
                id_metodo_pago: id_metodo_pago ? Number(id_metodo_pago) : 1,
                estado: 'Pendiente',
            },
            {
                tipo_prenda: nombrePrenda,
                color: colorPrenda,
                descripcion_tela: descripcion_tela || nombrePrenda,
                origen_material: origen,
                cantidad_metros: cantidad_metros || null,
                notas_diseno: notas_diseno || null,
                medidas_anatomicas: medidas_anatomicas || medidas || null,
                talla: talla || null,
                cantidad: 1,
                subtotal: costo,
                insumos: Array.isArray(insumos) ? insumos : []
            }
        );

        // Emitir evento en tiempo real
        const io = req.app.get('io');
        if (io) io.emit('actualizacion_datos');

        return res.status(201).json({
            mensaje: 'Pedido creado exitosamente.',
            pedido: pedidoCreado,
            ...pedidoCreado
        });
    } catch (error) {
        console.error('Error al crear pedido:', error);
        return res.status(500).json({ error: 'Error interno del servidor al crear pedido.' });
    }
};

// GET /api/pedidos/catalogos
const obtenerCatalogos = async (req, res) => {
    try {
        const [estados, metodos] = await Promise.all([
            db.query('SELECT id_estado_pedido, nombre_estado FROM estados_pedido ORDER BY id_estado_pedido'),
            db.query('SELECT id_metodo_pago, nombre_metodo FROM metodos_pago ORDER BY id_metodo_pago')
        ]);
        res.json({
            estados: estados.rows,
            metodos_pago: metodos.rows
        });
    } catch (error) {
        console.error('Error al obtener catálogos de pedidos:', error);
        res.status(500).json({ error: 'Error del servidor' });
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
        if (estado === 'Listo para Prueba' || estado === 'Para Entregar' || estado === 'Entregado') {
            const notificacion = require('../config/firebase');
            const cliente = await PedidoModel.obtenerClienteDelPedido(id);
            
            const mensajes = {
                'Listo para Prueba': { titulo: '👗 ¡Tu prenda está lista para prueba!', cuerpo: (nombre) => `Hola ${nombre}, tu pedido #${id} ya está listo para que lo pruebes.` },
                'Para Entregar': { titulo: '✨ ¡Tu prenda está lista!', cuerpo: (nombre) => `Hola ${nombre}, tu pedido #${id} ya está finalizado. Pasa por secretaría para la entrega.` },
                'Entregado': { titulo: '✅ ¡Pedido Entregado!', cuerpo: (nombre) => `Hola ${nombre}, gracias por confiar en Simonetta. ¡Esperamos verte pronto!` },
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


// PUT /api/pedidos/:id/saldar
const saldarYEntregar = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await PedidoModel.saldarYEntregar(id);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        
        // Notificar al cliente
        const notificacion = require('../config/firebase');
        const cliente = await PedidoModel.obtenerClienteDelPedido(id);
        if (cliente && cliente.fcm_token) {
            await notificacion.enviarNotificacion(cliente.fcm_token, {
                titulo: '✅ ¡Pedido Entregado y Saldado!',
                cuerpo: `Hola ${cliente.nombre_completo}, gracias por tu compra. ¡Esperamos verte pronto!`,
                datos: { pedidoId: String(id), accion: 'entregado' },
            });
        }

        return res.json({ mensaje: 'Pedido entregado y saldado correctamente', pedido });
    } catch (error) {
        console.error('Error al saldar pedido:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};

// GET /api/pedidos/catalogo-prendas
const obtenerCatalogoPrendas = async (req, res) => {
    try {
        const catalogo = await PedidoModel.obtenerCatalogoPrendas();
        return res.json(catalogo);
    } catch (error) {
        console.error('Error al obtener catálogo de prendas:', error);
        return res.status(500).json({ error: 'Error del servidor al obtener catálogo.' });
    }
};

module.exports = {
    crearPedido,
    obtenerCatalogos,
    obtenerPedidos,
    actualizarEstado,
    obtenerMetricas,
    obtenerPedidosCosturera,
    obtenerPedido,
    actualizarPedido,
    saldarYEntregar,
    obtenerCatalogoPrendas
};
