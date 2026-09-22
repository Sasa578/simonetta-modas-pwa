const nodemailer = require('nodemailer');
const db = require('../config/db');

/**
 * Crea y retorna el transportador de correo según la configuración en las variables de entorno.
 */
const obtenerTransporter = () => {
    const service = process.env.EMAIL_SERVICE;
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '465', 10);
    const secure = process.env.EMAIL_SECURE !== 'false'; // true para puerto 465, false para 587
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        return null;
    }

    if (service && service.toLowerCase() === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass }
        });
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
    });
};

/**
 * Verifica el estado de la conexión SMTP con el servidor de correo.
 * @returns {Promise<{ ok: boolean, mensaje?: string, error?: string }>}
 */
const verificarConexionTransporter = async () => {
    const transporter = obtenerTransporter();
    if (!transporter) {
        return {
            ok: false,
            error: 'Las credenciales de correo (EMAIL_USER o EMAIL_PASS) no están configuradas en el archivo .env.'
        };
    }

    try {
        await transporter.verify();
        return {
            ok: true,
            mensaje: 'Conexión SMTP establecida y verificada exitosamente.'
        };
    } catch (error) {
        return {
            ok: false,
            error: `Fallo de autenticación o conexión SMTP: ${error.message}`
        };
    }
};

/**
 * Envía la Nota de Venta / Factura de Confección en PDF al correo del cliente.
 * @param {Object} params
 * @param {number} params.id_pedido
 * @param {string} params.correo_destino
 * @param {Buffer} params.bufferPdf
 * @param {Object} params.datosPedido
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
const enviarNotaVentaCliente = async ({ id_pedido, correo_destino, bufferPdf, datosPedido }) => {
    const transporter = obtenerTransporter();
    if (!transporter) {
        throw new Error('Servicio de correo no configurado. Configure EMAIL_USER y EMAIL_PASS en el archivo .env.');
    }

    const destinatario = correo_destino || datosPedido.correo || datosPedido.cliente_correo;
    if (!destinatario) {
        throw new Error('El cliente no cuenta con una dirección de correo electrónico registrada.');
    }

    const remitente = process.env.EMAIL_FROM || `"Simonetta Modas" <${process.env.EMAIL_USER}>`;
    const numeroNota = datosPedido.numero_nota || `NV-${new Date().getFullYear()}-${String(id_pedido).padStart(5, '0')}`;
    const nombreCliente = datosPedido.cliente || 'Estimada/o Cliente';
    const prenda = datosPedido.prenda || 'Prenda de Alta Costura';
    const costurera = datosPedido.costurera || 'Taller Simonetta Modas';
    const total = parseFloat(datosPedido.costo_total || 0).toFixed(2);
    const pagado = parseFloat(datosPedido.total_pagado !== undefined ? datosPedido.total_pagado : (datosPedido.adelanto || 0)).toFixed(2);
    const saldo = parseFloat(datosPedido.saldo !== undefined ? datosPedido.saldo : (total - pagado)).toFixed(2);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background-color: #0f172a; padding: 28px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 22px; letter-spacing: 1.5px; font-weight: 700; color: #f8fafc; }
            .header p { margin: 6px 0 0 0; font-size: 11px; color: #cbd5e1; letter-spacing: 1px; text-transform: uppercase; }
            .content { padding: 28px 24px; }
            .saludo { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
            .texto { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
            .resumen-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
            .resumen-titulo { font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
            .fila { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
            .fila span { color: #64748b; }
            .fila strong { color: #0f172a; }
            .fila-destacada { display: flex; justify-content: space-between; font-size: 14px; padding-top: 8px; border-top: 1px dashed #cbd5e1; margin-top: 8px; font-weight: 700; }
            .adjunto-aviso { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 4px; font-size: 13px; color: #1e40af; margin-bottom: 20px; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SIMONETTA MODAS</h1>
                <p>Taller de Alta Costura & Confección a Medida</p>
            </div>
            <div class="content">
                <div class="saludo">Hola, ${nombreCliente} 👋</div>
                <p class="texto">
                    Te hacemos llegar el comprobante oficial y la nota de confección correspondiente a tu <strong>Pedido #${id_pedido} (${prenda})</strong>.
                </p>

                <div class="resumen-card">
                    <div class="resumen-titulo">Detalles de tu Confección</div>
                    <div class="fila"><span>N° Comprobante:</span><strong>${numeroNota}</strong></div>
                    <div class="fila"><span>Prenda / Diseño:</span><strong>${prenda}</strong></div>
                    <div class="fila"><span>Costurera Asignada:</span><strong>${costurera}</strong></div>
                    <div class="fila"><span>Costo Total:</span><strong>Bs. ${total}</strong></div>
                    <div class="fila"><span>Total Abonado:</span><strong style="color: #166534;">Bs. ${pagado}</strong></div>
                    <div class="fila-destacada">
                        <span>Saldo Pendiente:</span>
                        <span style="color: ${parseFloat(saldo) > 0 ? '#b91c1c' : '#15803d'};">
                            ${parseFloat(saldo) > 0 ? `Bs. ${saldo}` : 'PAGADO TOTALMENTE'}
                        </span>
                    </div>
                </div>

                <div class="adjunto-aviso">
                    📎 <strong>Archivo Adjunto:</strong> Hemos adjuntado el archivo <strong>${numeroNota}.pdf</strong> con tus medidas de patronaje, fechas de prueba, entrega y desglose financiero.
                </div>

                <p class="texto" style="font-size: 12px; color: #94a3b8; font-style: italic;">
                    Si requieres coordinar tu fecha de prueba o realizar alguna consulta sobre tu confección, no dudes en responder a este mensaje o escribirnos por WhatsApp.
                </p>
            </div>
            <div class="footer">
                Simonetta Modas | Alta Costura a Medida<br>
                La Paz, Bolivia | WhatsApp: (+591) 76543210<br>
                Este correo fue generado automáticamente por el Sistema de Gestión Simonetta Modas.
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: remitente,
        to: destinatario,
        subject: `Comprobante y Nota de Venta - Pedido #${id_pedido} | Simonetta Modas`,
        html: htmlContent,
        attachments: [
            {
                filename: `Nota_Venta_${numeroNota}.pdf`,
                content: bufferPdf,
                contentType: 'application/pdf'
            }
        ]
    };

    const info = await transporter.sendMail(mailOptions);

    // Actualizar estado de envío en base de datos si existe el registro
    try {
        await db.query(
            "UPDATE notas_venta SET estado_envio_correo = 'Enviado' WHERE id_pedido = $1",
            [id_pedido]
        );
    } catch (e) {
        console.warn('No se pudo actualizar estado_envio_correo en notas_venta:', e.message);
    }

    return {
        success: true,
        messageId: info.messageId,
        destinatario
    };
};

/**
 * Envía el Reporte General del Taller en PDF al correo del Administrador.
 * @param {Object} params
 * @param {Buffer} params.bufferPdf
 * @param {Object} params.datosReporte
 * @param {string} [params.correo_admin]
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
const enviarReporteTallerAdmin = async ({ bufferPdf, datosReporte, correo_admin }) => {
    const transporter = obtenerTransporter();
    if (!transporter) {
        throw new Error('Servicio de correo no configurado. Configure EMAIL_USER y EMAIL_PASS en el archivo .env.');
    }

    const destinatario = correo_admin || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!destinatario) {
        throw new Error('No se definió el correo destinatario del administrador (ADMIN_EMAIL).');
    }

    const remitente = process.env.EMAIL_FROM || `"Simonetta Modas" <${process.env.EMAIL_USER}>`;
    const periodo = datosReporte.periodo || 'Mensual';
    const kpis = datosReporte.kpis || {};

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
            .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background-color: #0f172a; padding: 28px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 20px; letter-spacing: 1px; color: #f8fafc; }
            .header p { margin: 6px 0 0 0; font-size: 12px; color: #fbbf24; font-weight: 600; text-transform: uppercase; }
            .content { padding: 24px; }
            .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
            .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
            .kpi-title { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; }
            .kpi-value { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
            .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SIMONETTA MODAS</h1>
                <p>INFORME DE GESTIÓN Y AUDITORÍA DEL TALLER (${periodo})</p>
            </div>
            <div class="content">
                <p style="font-size: 14px; line-height: 1.5; color: #334155;">
                    Estimada Administración, se ha emitido el reporte integral de actividades correspondiente al periodo <strong>${periodo}</strong>.
                </p>

                <div class="kpi-grid">
                    <div class="kpi-card" style="border-left: 4px solid #3b82f6;">
                        <div class="kpi-title">Pedidos del Periodo</div>
                        <div class="kpi-value">${kpis.total_pedidos || 0} (${kpis.pedidos_entregados || 0} entregados)</div>
                    </div>
                    <div class="kpi-card" style="border-left: 4px solid #10b981;">
                        <div class="kpi-title">Total Recaudado</div>
                        <div class="kpi-value" style="color: #166534;">Bs. ${parseFloat(kpis.total_recaudado || 0).toFixed(2)}</div>
                    </div>
                    <div class="kpi-card" style="border-left: 4px solid #f59e0b;">
                        <div class="kpi-title">Saldos por Cobrar</div>
                        <div class="kpi-value" style="color: #b45309;">Bs. ${parseFloat(kpis.total_saldos_pendientes || 0).toFixed(2)}</div>
                    </div>
                    <div class="kpi-card" style="border-left: 4px solid #ef4444;">
                        <div class="kpi-title">Insumos Bajo Stock</div>
                        <div class="kpi-value" style="color: #b91c1c;">${kpis.items_bajo_stock || 0} ítems</div>
                    </div>
                </div>

                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; font-size: 13px; color: #166534; margin-bottom: 20px;">
                    📎 <strong>Documento PDF Adjunto:</strong> Se incluye el documento oficial completo con la auditoría de movimientos de almacén, desglose financiero (Efectivo vs QR) y el listado de pedidos.
                </div>
            </div>
            <div class="footer">
                Sistema Automatizado de Reportes Simonetta Modas | Confidencial Administración
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: remitente,
        to: destinatario,
        subject: `Informe de Gestión del Taller - ${periodo} | Simonetta Modas`,
        html: htmlContent,
        attachments: [
            {
                filename: `Reporte_Taller_Simonetta_${periodo.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
                content: bufferPdf,
                contentType: 'application/pdf'
            }
        ]
    };

    const info = await transporter.sendMail(mailOptions);
    return {
        success: true,
        messageId: info.messageId,
        destinatario
    };
};

module.exports = {
    obtenerTransporter,
    verificarConexionTransporter,
    enviarNotaVentaCliente,
    enviarReporteTallerAdmin
};
