const { validarMonto } = require('../middlewares/dataValidator');
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

        // 1. Costurera obligatoria (no se permite nulo ni taller)
        if (!id_costurera) {
            return res.status(400).json({ error: 'Debe asignar obligatoriamente una costurera al pedido.' });
        }
        const costCheck = await db.query(
            'SELECT u.id_usuario, r.nombre_rol FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE u.id_usuario = $1',
            [id_costurera]
        );
        if (costCheck.rows.length === 0 || costCheck.rows[0].nombre_rol !== 'Costurera') {
            return res.status(400).json({ error: 'El usuario asignado debe ser una costurera registrada y activa en el sistema.' });
        }

        // 2. Validación cruzada de fechas: Fecha de prueba <= Fecha de entrega
        if (fecha_prueba && fecha_entrega) {
            const dPrueba = new Date(fecha_prueba);
            const dEntrega = new Date(fecha_entrega);
            if (dPrueba > dEntrega) {
                return res.status(400).json({ error: 'La fecha de prueba no puede ser posterior a la fecha de entrega.' });
            }
        }

        // 3. Validación de Costo (> 0) y Adelanto
        const vCosto = validarMonto(costo_total, 'costo total', true, true);
        if (!vCosto.valido) return res.status(400).json({ error: vCosto.error });

        if (adelanto !== undefined && adelanto !== null && adelanto !== '') {
            const vAdelanto = validarMonto(adelanto, 'adelanto', false, false);
            if (!vAdelanto.valido) return res.status(400).json({ error: vAdelanto.error });
            if (Number(vAdelanto.limpio) > Number(vCosto.limpio)) {
                return res.status(400).json({ error: 'El adelanto no puede ser superior al costo total del pedido.' });
            }
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
        const [estados, metodos, tiposPrenda, colores] = await Promise.all([
            db.query('SELECT id_estado_pedido, nombre_estado FROM estados_pedido ORDER BY id_estado_pedido'),
            db.query('SELECT id_metodo_pago, nombre_metodo FROM metodos_pago WHERE id_metodo_pago IN (1, 2) ORDER BY id_metodo_pago'),
            db.query('SELECT id_tipo_prenda, nombre_tipo FROM tipos_prenda ORDER BY id_tipo_prenda'),
            db.query('SELECT id_color, nombre_color, codigo_hexadecimal FROM colores ORDER BY id_color')
        ]);
        res.json({
            estados: estados.rows,
            metodos_pago: metodos.rows,
            tipos_prenda: tiposPrenda.rows,
            colores: colores.rows
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
        const rolUsuario = req.usuario?.rol || req.usuario?.nombre_rol;

        // Obtener estado actual del pedido y su costurera
        const pedActualRes = await db.query(
            `SELECT p.id_pedido, p.id_costurera, ep.nombre_estado as estado_actual
             FROM pedidos p
             JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
             WHERE p.id_pedido = $1`,
            [id]
        );

        if (pedActualRes.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const estadoActual = pedActualRes.rows[0].estado_actual;
        const nuevoEstadoNorm = (estado || '').trim().toLowerCase();
        const aliasMap = {
            'listo para prueba': 'prueba',
            'para entregar': 'terminado',
            'acabados': 'terminado',
            'corte': 'en confección',
            'armado': 'en confección'
        };
        const estadoFinalNorm = aliasMap[nuevoEstadoNorm] || nuevoEstadoNorm;

        // 1. Control de Rol: Secretaria no puede alterar estado si la costurera aún tiene el pedido en taller
        if (rolUsuario === 'Secretaria') {
            const estadosProduccion = ['pendiente', 'en confección', 'corte', 'armado', 'prueba', 'listo para prueba'];
            const estaEnTaller = estadosProduccion.includes(estadoActual.toLowerCase());

            if (estaEnTaller) {
                // La costurera aún tiene el pedido en taller
                return res.status(403).json({
                    error: `El pedido #${id} se encuentra en fase de producción (${estadoActual}) a cargo de la costurera. La secretaría solo puede marcarlo como 'Entregado' una vez que la costurera lo haya marcado como 'Terminado'.`
                });
            }

            // Si está Terminado, secretaría puede marcarlo como 'Entregado' o 'Cancelado'
            if (estadoActual.toLowerCase() === 'terminado' && estadoFinalNorm !== 'entregado' && estadoFinalNorm !== 'cancelado') {
                return res.status(403).json({
                    error: "Un pedido terminado en secretaría solo puede avanzar a 'Entregado'."
                });
            }
        }

        // 2. Control de Rol: Costurera no puede marcar 'Entregado' (la entrega y cobro final corresponde a Secretaría/Admin)
        if (rolUsuario === 'Costurera' && estadoFinalNorm === 'entregado') {
            return res.status(403).json({
                error: "La entrega final al cliente debe realizarse en recepción por secretaría o administración."
            });
        }
        
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
