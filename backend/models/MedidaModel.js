const db = require('../config/db');

const SEIS_MESES_MS = 6 * 30.44 * 24 * 60 * 60 * 1000; // ~6 meses en milisegundos

/**
 * Determina si una fecha de toma de medidas está caducada (> 6 meses).
 * @param {string|Date} fechaToma
 * @returns {boolean}
 */
const estaCaducada = (fechaToma) => {
    return (new Date() - new Date(fechaToma)) > SEIS_MESES_MS;
};

const MedidaModel = {
    /**
     * Inserta una nueva medida anatómica.
     * @param {object} datos — { id_cliente, cortas, cintura, frente, ... }
     * @returns {object} medida creada
     */
    crear: async (datos) => {
        const { id_cliente, cortas, cintura, frente, alto_cadera, cadera, entre_busto, busto, espalda, hombro, fecha_toma } = datos;
        const fecha = fecha_toma || new Date().toISOString().split('T')[0];

        const resultado = await db.query(
            `INSERT INTO medidas (id_cliente, cortas, cintura, frente, alto_cadera, cadera, entre_busto, busto, espalda, hombro, fecha_toma)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [id_cliente, cortas, cintura, frente, alto_cadera, cadera, entre_busto, busto, espalda, hombro, fecha]
        );

        return resultado.rows[0];
    },

    /**
     * Obtiene todas las medidas de un cliente, enriquecidas con el flag de caducidad.
     * @param {number} idCliente
     * @returns {Array} lista de medidas con { ..., medidas_caducadas: boolean }
     */
    obtenerPorCliente: async (idCliente) => {
        const resultado = await db.query(
            `SELECT m.*, c.nombre_completo
             FROM medidas m
             JOIN clientes c ON m.id_cliente = c.id_cliente
             WHERE m.id_cliente = $1
             ORDER BY m.fecha_toma DESC`,
            [idCliente]
        );

        return resultado.rows.map((medida) => ({
            ...medida,
            medidas_caducadas: estaCaducada(medida.fecha_toma),
        }));
    },

    /**
     * Verifica si un cliente existe en la BD.
     * @param {number} idCliente
     * @returns {boolean}
     */
    clienteExiste: async (idCliente) => {
        const resultado = await db.query('SELECT id_cliente FROM clientes WHERE id_cliente = $1', [idCliente]);
        return resultado.rows.length > 0;
    },

    /**
     * Expone la función de caducidad para que el controlador la use tras insertar.
     */
    estaCaducada,
};

module.exports = MedidaModel;
