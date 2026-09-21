const ReporteModel = require('../models/ReporteModel');
const { generarBufferNotaVenta, generarBufferReporteTaller } = require('../utils/pdfGenerator');

/**
 * Obtiene los datos consolidados del taller en formato JSON para la vista de Reportes
 */
const obtenerReporteTaller = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, mes, anio } = req.query;
        const reporte = await ReporteModel.obtenerReporteTaller({ fechaInicio, fechaFin, mes, anio });
        return res.json(reporte);
    } catch (error) {
        console.error('Error al obtener reporte del taller:', error);
        return res.status(500).json({ error: 'Error interno al generar reporte del taller.' });
    }
};

/**
 * Genera y transmite el PDF de Auditoría y Gestión del Taller
 */
const descargarReporteTallerPdf = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, mes, anio } = req.query;
        const datos = await ReporteModel.obtenerReporteTaller({ fechaInicio, fechaFin, mes, anio });
        const pdfBuffer = await generarBufferReporteTaller(datos);

        const periodoLimpio = (datos.periodo || 'General').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `Reporte_Taller_Simonetta_${periodoLimpio}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        return res.send(pdfBuffer);
    } catch (error) {
        console.error('Error al descargar PDF del taller:', error);
        return res.status(500).json({ error: 'Error al generar el archivo PDF del taller.' });
    }
};

/**
 * Genera y transmite el PDF de la Nota de Venta para un pedido
 * Accesible por Admin, Secretaría, y por el Cliente propietario del pedido
 */
const descargarNotaVentaPdf = async (req, res) => {
    try {
        const { id } = req.params;
        const idPedido = Number(id);
        if (!idPedido || isNaN(idPedido)) {
            return res.status(400).json({ error: 'ID de pedido inválido.' });
        }

        const datos = await ReporteModel.obtenerDatosCompletosNotaVenta(idPedido);
        if (!datos) {
            return res.status(404).json({ error: 'No se encontraron datos para este pedido.' });
        }

        // Validación de permisos de seguridad
        if (req.usuario && req.usuario.rol === 'Cliente') {
            if (req.usuario.id_cliente && Number(datos.id_cliente) !== Number(req.usuario.id_cliente)) {
                return res.status(403).json({ error: 'No tienes autorización para acceder a este comprobante.' });
            }
        }

        const pdfBuffer = await generarBufferNotaVenta(datos);
        const numeroNotaLimpio = (datos.numero_nota || `Pedido_${idPedido}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `Nota_Venta_${numeroNotaLimpio}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        return res.send(pdfBuffer);
    } catch (error) {
        console.error('Error al descargar PDF de nota de venta:', error);
        return res.status(500).json({ error: error.message || 'Error al generar la nota de venta en PDF.' });
    }
};

module.exports = {
    obtenerReporteTaller,
    descargarReporteTallerPdf,
    descargarNotaVentaPdf
};
