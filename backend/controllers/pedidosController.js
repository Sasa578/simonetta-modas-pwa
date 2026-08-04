const PedidoModel = require('../models/PedidoModel');

// POST /api/pedidos — Crear un pedido con detalle de material
const crearPedido = async (req, res) => {
    try {
        const {
            id_cliente,
            fecha_entrega,
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
                fecha_entrega,
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

module.exports = { crearPedido };
