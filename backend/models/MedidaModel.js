const db = require('../config/db');

const SEIS_MESES_MS = 6 * 30.44 * 24 * 60 * 60 * 1000; // ~6 meses en ms

const estaCaducada = (fechaToma) => {
    if (!fechaToma) return false;
    return (new Date() - new Date(fechaToma)) > SEIS_MESES_MS;
};

const MedidaModel = {
    /**
     * Inserta o actualiza medidas anatómicas asociadas a un detalle de pedido.
     */
    crear: async (datos) => {
        const {
            id_detalle,
            id_cliente,
            cortas, cintura, frente, alto_cadera, cadera, entre_busto, busto, espalda, hombro,
            talla, equivalencia_europea
        } = datos;

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            let targetDetalleId = id_detalle;

            // Si no se proporcionó id_detalle pero sí id_cliente:
            if (!targetDetalleId && id_cliente) {
                // 1. Buscar si hay algún pedido reciente del cliente con detalle
                const detCheck = await client.query(
                    `SELECT dp.id_detalle 
                     FROM detalle_pedido dp 
                     JOIN pedidos p ON dp.id_pedido = p.id_pedido 
                     WHERE p.id_cliente = $1 
                     ORDER BY p.fecha_inicio DESC LIMIT 1`,
                    [id_cliente]
                );

                if (detCheck.rows.length > 0) {
                    targetDetalleId = detCheck.rows[0].id_detalle;
                } else {
                    // 2. Crear una prenda y pedido base para vincular las medidas del cliente
                    const prenRes = await client.query(
                        `INSERT INTO prendas (tipo_prenda, color) VALUES ('Ficha Base de Medidas', 'Estándar') RETURNING id_prenda`
                    );
                    const idPrenda = prenRes.rows[0].id_prenda;

                    const pedRes = await client.query(
                        `INSERT INTO pedidos (id_cliente, id_estado_pedido, costo_total)
                         VALUES ($1, 1, 0.00) RETURNING id_pedido`,
                        [id_cliente]
                    );
                    const idPedido = pedRes.rows[0].id_pedido;

                    const newDetRes = await client.query(
                        `INSERT INTO detalle_pedido (id_pedido, id_prenda, cantidad, subtotal)
                         VALUES ($1, $2, 1, 0.00) RETURNING id_detalle`,
                        [idPedido, idPrenda]
                    );
                    targetDetalleId = newDetRes.rows[0].id_detalle;
                }
            }

            if (!targetDetalleId) {
                throw new Error('No se pudo determinar el detalle de pedido para asociar las medidas.');
            }

            // Insertar o actualizar medidas anatómicas (1:1 con id_detalle)
            const checkMed = await client.query('SELECT id_medida_anatomica FROM medidas_anatomicas WHERE id_detalle = $1', [targetDetalleId]);
            let resultadoMedida;

            if (checkMed.rows.length > 0) {
                resultadoMedida = await client.query(
                    `UPDATE medidas_anatomicas
                     SET cortas = $1, cintura = $2, frente = $3, alto_cadera = $4, cadera = $5,
                         entre_busto = $6, busto = $7, espalda = $8, hombro = $9
                     WHERE id_detalle = $10
                     RETURNING *`,
                    [cortas || null, cintura || null, frente || null, alto_cadera || null, cadera || null, entre_busto || null, busto || null, espalda || null, hombro || null, targetDetalleId]
                );
            } else {
                resultadoMedida = await client.query(
                    `INSERT INTO medidas_anatomicas (id_detalle, cortas, cintura, frente, alto_cadera, cadera, entre_busto, busto, espalda, hombro)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     RETURNING *`,
                    [targetDetalleId, cortas || null, cintura || null, frente || null, alto_cadera || null, cadera || null, entre_busto || null, busto || null, espalda || null, hombro || null]
                );
            }

            // Si se suministran medidas convencionales (talla)
            if (talla) {
                const checkConv = await client.query('SELECT id_medida_convencional FROM medidas_convencionales WHERE id_detalle = $1', [targetDetalleId]);
                if (checkConv.rows.length > 0) {
                    await client.query(
                        `UPDATE medidas_convencionales SET talla = $1, equivalencia_europea = $2 WHERE id_detalle = $3`,
                        [talla, equivalencia_europea || null, targetDetalleId]
                    );
                } else {
                    await client.query(
                        `INSERT INTO medidas_convencionales (id_detalle, talla, equivalencia_europea)
                         VALUES ($1, $2, $3)`,
                        [targetDetalleId, talla, equivalencia_europea || null]
                    );
                }
            }

            await client.query('COMMIT');
            return resultadoMedida.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Obtiene todas las medidas registradas para un cliente a través de sus pedidos.
     */
    obtenerPorCliente: async (idCliente) => {
        const query = `
            SELECT ma.*, p.fecha_inicio as fecha_toma, p.id_cliente, p.id_pedido, dp.id_detalle,
                   pr.tipo_prenda, mc.talla, mc.equivalencia_europea,
                   COALESCE(NULLIF(TRIM(CONCAT(dcp.nombre, ' ', dcp.apellido)), ''), dci.razon_social) as nombre_completo
            FROM medidas_anatomicas ma
            JOIN detalle_pedido dp ON ma.id_detalle = dp.id_detalle
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            JOIN prendas pr ON dp.id_prenda = pr.id_prenda
            JOIN clientes c ON p.id_cliente = c.id_cliente
            LEFT JOIN datos_cliente_persona dcp ON c.id_cliente = dcp.id_cliente
            LEFT JOIN datos_cliente_institucional dci ON c.id_cliente = dci.id_cliente
            LEFT JOIN medidas_convencionales mc ON dp.id_detalle = mc.id_detalle
            WHERE p.id_cliente = $1
            ORDER BY p.fecha_inicio DESC, ma.id_medida_anatomica DESC;
        `;
        const resultado = await db.query(query, [idCliente]);
        return resultado.rows.map(m => ({
            ...m,
            medidas_caducadas: estaCaducada(m.fecha_toma)
        }));
    },

    clienteExiste: async (idCliente) => {
        const resultado = await db.query('SELECT id_cliente FROM clientes WHERE id_cliente = $1', [idCliente]);
        return resultado.rows.length > 0;
    },

    estaCaducada
};

module.exports = MedidaModel;
