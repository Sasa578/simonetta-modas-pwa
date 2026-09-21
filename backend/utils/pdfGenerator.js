const PDFDocument = require('pdfkit');

/**
 * Limpia cadenas para asegurar compatibilidad con fuentes estándar de PDF (Helvetica)
 * removiendo emojis pero preservando caracteres en español (tildes, ñ, etc.)
 */
const sanitizar = (texto) => {
    if (!texto) return '';
    return String(texto)
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim();
};

/**
 * Formatea fechas a formato legible DD/MM/YYYY
 */
const formatearFecha = (fecha) => {
    if (!fecha) return 'Pendiente / No asignada';
    try {
        const d = new Date(fecha);
        if (isNaN(d.getTime())) return String(fecha);
        return d.toLocaleDateString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return String(fecha);
    }
};

/**
 * Formatea números a moneda boliviana Bs. XX.XX
 */
const formatearBs = (monto) => {
    const val = parseFloat(monto) || 0;
    return `Bs. ${val.toFixed(2)}`;
};

/**
 * Genera el Buffer binario de la Nota de Venta / Factura de Pedido para un cliente
 * @param {Object} datos - Objeto con datos del pedido, cliente, prenda, costurera, medidas y pagos
 * @returns {Promise<Buffer>}
 */
const generarBufferNotaVenta = (datos) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'LETTER',
                margin: 36,
                info: {
                    Title: `Nota de Venta ${datos.numero_nota || `Pedido #${datos.id_pedido}`}`,
                    Author: 'Simonetta Modas - Alta Costura',
                    Subject: 'Comprobante y Especificaciones de Confección'
                }
            });

            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            const marginLeft = 36;
            const contentWidth = 540;

            // ==========================================
            // 1. ENCABEZADO DE MARCA & ATELIER
            // ==========================================
            doc.rect(marginLeft, 36, contentWidth, 75).fill('#0f172a');

            doc.fillColor('#f8fafc')
                .font('Helvetica-Bold')
                .fontSize(20)
                .text('SIMONETTA MODAS', marginLeft + 16, 48);

            doc.font('Helvetica')
                .fontSize(9)
                .fillColor('#cbd5e1')
                .text('TALLER DE ALTA COSTURA & CONFECCION A MEDIDA', marginLeft + 16, 72)
                .text('La Paz, Bolivia  |  WhatsApp: (+591) 76543210  |  info@simonettamodas.com', marginLeft + 16, 85);

            // Caja derecha de Comprobante / Nota de Venta
            doc.rect(marginLeft + contentWidth - 180, 44, 168, 59)
                .fillAndStroke('#1e293b', '#334155');

            doc.fillColor('#fbbf24')
                .font('Helvetica-Bold')
                .fontSize(10)
                .text('NOTA DE VENTA / PEDIDO', marginLeft + contentWidth - 174, 52, { width: 156, align: 'center' });

            doc.fillColor('#ffffff')
                .fontSize(12)
                .text(datos.numero_nota || `NV-${new Date().getFullYear()}-${String(datos.id_pedido).padStart(5, '0')}`, marginLeft + contentWidth - 174, 67, { width: 156, align: 'center' });

            doc.fillColor('#94a3b8')
                .font('Helvetica')
                .fontSize(8)
                .text(`Emisión: ${formatearFecha(datos.fecha_emision || new Date())}`, marginLeft + contentWidth - 174, 85, { width: 156, align: 'center' });

            // ==========================================
            // 2. DATOS DEL CLIENTE Y DEL PEDIDO
            // ==========================================
            let y = 122;

            // Caja Cliente
            doc.rect(marginLeft, y, 262, 92).fillAndStroke('#f8fafc', '#e2e8f0');
            doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text('DATOS DEL CLIENTE', marginLeft + 12, y + 10);
            doc.font('Helvetica').fontSize(9).fillColor('#334155');
            doc.text(`Cliente: ${sanitizar(datos.cliente || 'Cliente Particular')}`, marginLeft + 12, y + 26);
            doc.text(`CI / NIT: ${sanitizar(datos.ci_nit || datos.ci || datos.nit || 'S/N')}`, marginLeft + 12, y + 42);
            doc.text(`Teléfono / Cel: ${sanitizar(datos.telefono || datos.telefono_whatsapp || 'S/N')}`, marginLeft + 12, y + 58);
            doc.text(`Correo: ${sanitizar(datos.correo || datos.cliente_correo || 'No registrado')}`, marginLeft + 12, y + 74);

            // Caja Confección & Operaria
            doc.rect(marginLeft + 278, y, 262, 92).fillAndStroke('#f8fafc', '#e2e8f0');
            doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text('ESPECIFICACIONES DE TALLER', marginLeft + 290, y + 10);
            doc.font('Helvetica').fontSize(9).fillColor('#334155');
            doc.text(`Pedido N°: #${datos.id_pedido}`, marginLeft + 290, y + 26);
            doc.text(`Prenda: ${sanitizar(datos.prenda || 'Prenda a Medida')}`, marginLeft + 290, y + 42);
            doc.text(`Color / Tono: ${sanitizar(datos.color || 'A elección de diseño')}`, marginLeft + 290, y + 58);
            doc.text(`Costurera Asignada: ${sanitizar(datos.costurera || 'Taller Simonetta')}`, marginLeft + 290, y + 74);

            // ==========================================
            // 3. CRONOGRAMA DE FECHAS (TIPO FACTURA)
            // ==========================================
            y = 224;
            doc.rect(marginLeft, y, contentWidth, 38).fillAndStroke('#f1f5f9', '#cbd5e1');

            const colWidth = contentWidth / 4;
            const fechasItems = [
                { label: 'Fecha de Recepción', val: formatearFecha(datos.fecha_pedido || datos.fecha_inicio) },
                { label: 'Fecha de Prueba', val: formatearFecha(datos.fecha_prueba) },
                { label: 'Fecha de Entrega', val: formatearFecha(datos.fecha_entrega) },
                { label: 'Estado de Confección', val: sanitizar(datos.estado || datos.estado_pedido || 'En Proceso') }
            ];

            fechasItems.forEach((f, idx) => {
                const xItem = marginLeft + (idx * colWidth);
                doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7.5).text(f.label.toUpperCase(), xItem + 8, y + 8, { width: colWidth - 16, align: 'center' });
                doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text(f.val, xItem + 8, y + 20, { width: colWidth - 16, align: 'center' });
            });

            // ==========================================
            // 4. PATRONAJE Y MEDIDAS REGISTRADAS
            // ==========================================
            y = 272;
            doc.rect(marginLeft, y, contentWidth, 20).fill('#e2e8f0');
            doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(9.5).text('PATRONAJE Y MEDIDAS DE LA PRENDA', marginLeft + 10, y + 5);

            y = 292;
            const tieneMedidas = datos.busto || datos.cintura || datos.cadera || datos.espalda || datos.hombro || datos.cortas;

            if (tieneMedidas) {
                doc.rect(marginLeft, y, contentWidth, 54).fillAndStroke('#ffffff', '#e2e8f0');
                const medidasGrid = [
                    { k: 'Busto', v: datos.busto ? `${datos.busto} cm` : '-' },
                    { k: 'Cintura', v: datos.cintura ? `${datos.cintura} cm` : '-' },
                    { k: 'Cadera', v: datos.cadera ? `${datos.cadera} cm` : '-' },
                    { k: 'Espalda', v: datos.espalda ? `${datos.espalda} cm` : '-' },
                    { k: 'Hombro', v: datos.hombro ? `${datos.hombro} cm` : '-' },
                    { k: 'Largo Prenda', v: datos.cortas ? `${datos.cortas} cm` : '-' }
                ];

                const medColWidth = contentWidth / 6;
                medidasGrid.forEach((m, idx) => {
                    const xMed = marginLeft + (idx * medColWidth);
                    doc.fillColor('#64748b').font('Helvetica').fontSize(8).text(m.k, xMed, y + 10, { width: medColWidth, align: 'center' });
                    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text(m.v, xMed, y + 26, { width: medColWidth, align: 'center' });
                });
                y += 54;
            } else {
                doc.rect(marginLeft, y, contentWidth, 34).fillAndStroke('#ffffff', '#e2e8f0');
                const tallaTexto = datos.talla && datos.talla !== 'A Medida' ? `Talla Convencional Estándar: ${datos.talla}` : 'Confección bajo Medidas Estándar';
                doc.fillColor('#334155').font('Helvetica-Bold').fontSize(10).text(tallaTexto, marginLeft + 16, y + 11);
                y += 34;
            }

            // Notas de diseño si existen
            if (datos.notas_diseno) {
                y += 6;
                doc.rect(marginLeft, y, contentWidth, 32).fillAndStroke('#f8fafc', '#e2e8f0');
                doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8).text('Notas de Diseño & Detalles:', marginLeft + 10, y + 5);
                doc.font('Helvetica').fontSize(8.5).fillColor('#1e293b').text(sanitizar(datos.notas_diseno), marginLeft + 10, y + 17, { width: contentWidth - 20, lineBreak: false });
                y += 32;
            }

            // ==========================================
            // 5. HISTORIAL DE PAGOS Y ABONOS (TABLA)
            // ==========================================
            y += 14;
            doc.rect(marginLeft, y, contentWidth, 20).fill('#0f172a');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text('HISTORIAL DE ABONOS Y PAGOS', marginLeft + 10, y + 5);

            y += 20;
            // Cabecera tabla pagos
            doc.rect(marginLeft, y, contentWidth, 18).fill('#f1f5f9');
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#475569');
            doc.text('N° Pago', marginLeft + 10, y + 5, { width: 60 });
            doc.text('Fecha de Pago', marginLeft + 75, y + 5, { width: 110 });
            doc.text('Método de Pago', marginLeft + 195, y + 5, { width: 140 });
            doc.text('Estado', marginLeft + 345, y + 5, { width: 80 });
            doc.text('Monto Abonado', marginLeft + 435, y + 5, { width: 95, align: 'right' });
            y += 18;

            const pagos = Array.isArray(datos.pagos) && datos.pagos.length > 0 ? datos.pagos : [
                {
                    numero: 1,
                    fecha_pago: datos.fecha_pedido || new Date(),
                    metodo: datos.metodo_pago || 'Efectivo',
                    estado: 'Confirmado',
                    monto_pago: datos.adelanto || datos.total_pagado || 0
                }
            ];

            pagos.forEach((p, index) => {
                const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                doc.rect(marginLeft, y, contentWidth, 18).fillAndStroke(bg, '#f1f5f9');
                doc.font('Helvetica').fontSize(8.5).fillColor('#1e293b');
                doc.text(String(index + 1), marginLeft + 10, y + 5, { width: 60 });
                doc.text(formatearFecha(p.fecha_pago), marginLeft + 75, y + 5, { width: 110 });
                doc.text(sanitizar(p.metodo || p.metodo_pago || 'Efectivo'), marginLeft + 195, y + 5, { width: 140 });
                doc.text('Abonado', marginLeft + 345, y + 5, { width: 80 });
                doc.font('Helvetica-Bold').text(formatearBs(p.monto_pago), marginLeft + 435, y + 5, { width: 95, align: 'right' });
                y += 18;
            });

            // ==========================================
            // 6. RESUMEN FINANCIERO Y SALDO
            // ==========================================
            y += 10;
            const subtotal = parseFloat(datos.costo_total || 0);
            const totalPagado = parseFloat(datos.total_pagado !== undefined ? datos.total_pagado : (datos.adelanto || 0));
            const saldo = Math.max(0, subtotal - totalPagado);

            const resumenBoxX = marginLeft + contentWidth - 240;
            doc.rect(resumenBoxX, y, 240, 72).fillAndStroke('#f8fafc', '#cbd5e1');

            doc.font('Helvetica').fontSize(9).fillColor('#475569');
            doc.text('Costo Total Confección:', resumenBoxX + 12, y + 10);
            doc.font('Helvetica-Bold').fillColor('#0f172a').text(formatearBs(subtotal), resumenBoxX + 130, y + 10, { width: 98, align: 'right' });

            doc.font('Helvetica').fillColor('#166534').text('Total Abonado:', resumenBoxX + 12, y + 28);
            doc.font('Helvetica-Bold').fillColor('#16a34a').text(formatearBs(totalPagado), resumenBoxX + 130, y + 28, { width: 98, align: 'right' });

            // Saldo box destacado
            const saldoColor = saldo > 0 ? '#b91c1c' : '#15803d';
            const saldoBg = saldo > 0 ? '#fef2f2' : '#f0fdf4';
            doc.rect(resumenBoxX + 8, y + 46, 224, 20).fill(saldoBg);
            doc.font('Helvetica-Bold').fontSize(9.5).fillColor(saldoColor);
            doc.text(saldo > 0 ? 'SALDO PENDIENTE:' : 'PAGADO TOTALMENTE:', resumenBoxX + 14, y + 51);
            doc.text(formatearBs(saldo), resumenBoxX + 130, y + 51, { width: 94, align: 'right' });

            // Cláusulas de garantía a la izquierda del totalizador
            const terminosWidth = contentWidth - 255;
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#334155').text('Condiciones de Entrega y Garantía:', marginLeft, y + 10);
            doc.font('Helvetica').fontSize(7.5).fillColor('#64748b');
            doc.text('• La prenda cuenta con 10 días calendario para ajustes finos de calce tras la entrega.', marginLeft, y + 22, { width: terminosWidth });
            doc.text('• La entrega final de la prenda confeccionada se efectiviza una vez cancelado el 100% del saldo restante.', marginLeft, y + 36, { width: terminosWidth });
            doc.text('• Todo abono mediante QR debe ser verificado con comprobante bancario correspondiente.', marginLeft, y + 50, { width: terminosWidth });

            // ==========================================
            // 7. PIE DE PÁGINA Y FIRMAS
            // ==========================================
            const footY = 710;
            doc.strokeColor('#cbd5e1').lineWidth(0.8);
            doc.moveTo(marginLeft + 40, footY).lineTo(marginLeft + 200, footY).stroke();
            doc.moveTo(marginLeft + contentWidth - 200, footY).lineTo(marginLeft + contentWidth - 40, footY).stroke();

            doc.font('Helvetica').fontSize(8).fillColor('#64748b');
            doc.text('Firma / Conformidad Cliente', marginLeft + 40, footY + 4, { width: 160, align: 'center' });
            doc.text('Por Simonetta Modas', marginLeft + contentWidth - 200, footY + 4, { width: 160, align: 'center' });

            doc.fontSize(7).fillColor('#94a3b8').text(
                `Documento emitido electrónicamente por Sistema Simonetta Modas | ${new Date().toLocaleDateString('es-BO')} ${new Date().toLocaleTimeString('es-BO')}`,
                marginLeft,
                750,
                { width: contentWidth, align: 'center' }
            );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Genera el Buffer binario del Reporte General del Taller (Admin / Mensual o Manual)
 * @param {Object} datos - Objeto con KPIs, finanzas por método, pedidos, almacén y clientes
 * @returns {Promise<Buffer>}
 */
const generarBufferReporteTaller = (datos) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'LETTER',
                margin: 36,
                info: {
                    Title: 'Reporte General del Taller - Simonetta Modas',
                    Author: 'Simonetta Modas - Panel Administrativo',
                    Subject: 'Auditoría Integral de Pedidos, Finanzas y Almacén'
                }
            });

            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            const marginLeft = 36;
            const contentWidth = 540;

            // ==========================================
            // 1. ENCABEZADO FORMAL DEL INFORME
            // ==========================================
            doc.rect(marginLeft, 36, contentWidth, 75).fill('#0f172a');

            doc.fillColor('#ffffff')
                .font('Helvetica-Bold')
                .fontSize(18)
                .text('SIMONETTA MODAS', marginLeft + 16, 46);

            doc.font('Helvetica-Bold')
                .fontSize(11)
                .fillColor('#fbbf24')
                .text('INFORME GENERAL DE ACTIVIDAD Y GESTION DEL TALLER', marginLeft + 16, 68);

            doc.font('Helvetica')
                .fontSize(8.5)
                .fillColor('#94a3b8')
                .text(`Periodo evaluado: ${datos.periodo || 'Mes en Curso'}  |  Generado: ${new Date().toLocaleDateString('es-BO')} ${new Date().toLocaleTimeString('es-BO')}`, marginLeft + 16, 85);

            // ==========================================
            // 2. CUADRÍCULA DE KPIS EJECUTIVOS
            // ==========================================
            let y = 122;
            const kpiWidth = (contentWidth - 24) / 4;
            const kpis = [
                {
                    titulo: 'Pedidos del Periodo',
                    valor: String(datos.kpis?.total_pedidos || 0),
                    sub: `${datos.kpis?.pedidos_entregados || 0} Entregados`,
                    border: '#3b82f6',
                    textCol: '#1d4ed8'
                },
                {
                    titulo: 'Total Recaudado',
                    valor: formatearBs(datos.kpis?.total_recaudado || 0),
                    sub: `Efectivo: ${formatearBs(datos.kpis?.total_efectivo || 0)}`,
                    border: '#10b981',
                    textCol: '#047857'
                },
                {
                    titulo: 'Saldos por Cobrar',
                    valor: formatearBs(datos.kpis?.total_saldos_pendientes || 0),
                    sub: `${datos.kpis?.pedidos_con_deuda || 0} pedidos con saldo`,
                    border: '#f59e0b',
                    textCol: '#b45309'
                },
                {
                    titulo: 'Alertas de Almacén',
                    valor: String(datos.kpis?.items_bajo_stock || 0),
                    sub: `${datos.kpis?.movimientos_almacen || 0} movimientos`,
                    border: '#ef4444',
                    textCol: '#b91c1c'
                }
            ];

            kpis.forEach((kpi, idx) => {
                const xPos = marginLeft + (idx * (kpiWidth + 8));
                doc.rect(xPos, y, kpiWidth, 62).fillAndStroke('#ffffff', '#e2e8f0');
                doc.rect(xPos, y, 4, 62).fill(kpi.border);

                doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7.5).text(kpi.titulo.toUpperCase(), xPos + 8, y + 8, { width: kpiWidth - 12 });
                doc.fillColor(kpi.textCol).font('Helvetica-Bold').fontSize(11.5).text(kpi.valor, xPos + 8, y + 24, { width: kpiWidth - 12 });
                doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text(kpi.sub, xPos + 8, y + 44, { width: kpiWidth - 12 });
            });

            // ==========================================
            // 3. DESGLOSE FINANCIERO: EFECTIVO VS QR
            // ==========================================
            y = 196;
            doc.rect(marginLeft, y, contentWidth, 20).fill('#1e293b');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text('1. BALANCE DE INGRESOS POR METODO DE PAGO', marginLeft + 10, y + 5);

            y += 20;
            doc.rect(marginLeft, y, contentWidth, 42).fillAndStroke('#f8fafc', '#e2e8f0');
            const totalRec = parseFloat(datos.kpis?.total_recaudado || 0);
            const totalEf = parseFloat(datos.kpis?.total_efectivo || 0);
            const totalQr = parseFloat(datos.kpis?.total_qr || 0);
            const pctEf = totalRec > 0 ? ((totalEf / totalRec) * 100).toFixed(1) : '0.0';
            const pctQr = totalRec > 0 ? ((totalQr / totalRec) * 100).toFixed(1) : '0.0';

            doc.font('Helvetica-Bold').fontSize(9).fillColor('#166534');
            doc.text(`Efectivo Recaudado: ${formatearBs(totalEf)} (${pctEf}%)`, marginLeft + 14, y + 10);
            doc.font('Helvetica').fontSize(8).fillColor('#64748b').text('Cobros directos en taller y recepción', marginLeft + 14, y + 24);

            doc.font('Helvetica-Bold').fontSize(9).fillColor('#1d4ed8');
            doc.text(`QR / Transferencias: ${formatearBs(totalQr)} (${pctQr}%)`, marginLeft + 280, y + 10);
            doc.font('Helvetica').fontSize(8).fillColor('#64748b').text('Pagos digitales y transferencias verificadas', marginLeft + 280, y + 24);

            // ==========================================
            // 4. PRODUCCIÓN Y PEDIDOS DEL TALLER
            // ==========================================
            y = 270;
            doc.rect(marginLeft, y, contentWidth, 20).fill('#1e293b');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text('2. REGISTRO DE PEDIDOS Y CONFECCION EN EL PERIODO', marginLeft + 10, y + 5);

            y += 20;
            // Header tabla pedidos
            doc.rect(marginLeft, y, contentWidth, 18).fill('#f1f5f9');
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#475569');
            doc.text('ID', marginLeft + 6, y + 5, { width: 30 });
            doc.text('Cliente', marginLeft + 40, y + 5, { width: 110 });
            doc.text('Prenda / Color', marginLeft + 155, y + 5, { width: 105 });
            doc.text('Costurera', marginLeft + 265, y + 5, { width: 85 });
            doc.text('Estado', marginLeft + 355, y + 5, { width: 65 });
            doc.text('Total', marginLeft + 425, y + 5, { width: 50, align: 'right' });
            doc.text('Saldo', marginLeft + 480, y + 5, { width: 52, align: 'right' });
            y += 18;

            const listaPedidos = Array.isArray(datos.pedidos) ? datos.pedidos.slice(0, 10) : [];

            if (listaPedidos.length === 0) {
                doc.rect(marginLeft, y, contentWidth, 20).fill('#ffffff');
                doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text('No se registraron pedidos en este periodo.', marginLeft + 10, y + 6);
                y += 20;
            } else {
                listaPedidos.forEach((ped, idx) => {
                    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                    doc.rect(marginLeft, y, contentWidth, 17).fillAndStroke(bg, '#f1f5f9');
                    doc.font('Helvetica').fontSize(7.5).fillColor('#1e293b');
                    doc.text(`#${ped.id_pedido}`, marginLeft + 6, y + 4, { width: 30 });
                    doc.text(sanitizar(ped.cliente || 'Particular'), marginLeft + 40, y + 4, { width: 110 });
                    doc.text(`${sanitizar(ped.prenda || 'Prenda')} ${ped.color ? `(${sanitizar(ped.color)})` : ''}`, marginLeft + 155, y + 4, { width: 105 });
                    doc.text(sanitizar(ped.costurera || 'Sin asignar'), marginLeft + 265, y + 4, { width: 85 });
                    doc.text(sanitizar(ped.estado || 'En Proceso'), marginLeft + 355, y + 4, { width: 65 });
                    doc.text(formatearBs(ped.costo_total), marginLeft + 425, y + 4, { width: 50, align: 'right' });

                    const saldoPed = parseFloat(ped.saldo || 0);
                    doc.font('Helvetica-Bold').fillColor(saldoPed > 0 ? '#b91c1c' : '#15803d');
                    doc.text(formatearBs(saldoPed), marginLeft + 480, y + 4, { width: 52, align: 'right' });
                    y += 17;
                });
            }

            // ==========================================
            // 5. ALMACÉN Y CONTROL DE STOCK CRÍTICO
            // ==========================================
            y += 14;
            doc.rect(marginLeft, y, contentWidth, 20).fill('#1e293b');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text('3. ALMACEN: ALERTAS DE STOCK MINIMO Y REPOSICION', marginLeft + 10, y + 5);

            y += 20;
            doc.rect(marginLeft, y, contentWidth, 18).fill('#f1f5f9');
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#475569');
            doc.text('Material / Insumo', marginLeft + 10, y + 5, { width: 170 });
            doc.text('Categoría', marginLeft + 185, y + 5, { width: 110 });
            doc.text('Stock Físico', marginLeft + 300, y + 5, { width: 75, align: 'center' });
            doc.text('Stock Mínimo', marginLeft + 380, y + 5, { width: 75, align: 'center' });
            doc.text('Estado Alerta', marginLeft + 460, y + 5, { width: 70, align: 'right' });
            y += 18;

            const alertasStock = Array.isArray(datos.bajo_stock) ? datos.bajo_stock.slice(0, 6) : [];

            if (alertasStock.length === 0) {
                doc.rect(marginLeft, y, contentWidth, 20).fill('#ffffff');
                doc.font('Helvetica-Bold').fontSize(8).fillColor('#15803d').text('Todos los insumos y telas cuentan con stock optimo por encima del minimo.', marginLeft + 10, y + 6);
                y += 20;
            } else {
                alertasStock.forEach((item, idx) => {
                    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                    doc.rect(marginLeft, y, contentWidth, 17).fillAndStroke(bg, '#f1f5f9');
                    doc.font('Helvetica').fontSize(7.5).fillColor('#1e293b');
                    doc.text(sanitizar(item.nombre_material || item.nombre_producto || 'Insumo'), marginLeft + 10, y + 4, { width: 170 });
                    doc.text(sanitizar(item.categoria || item.nombre_categoria || 'Materia Prima'), marginLeft + 185, y + 4, { width: 110 });
                    doc.text(`${parseFloat(item.cantidad_stock || item.cantidad_actual || 0).toFixed(1)} ${item.unidad || 'u'}`, marginLeft + 300, y + 4, { width: 75, align: 'center' });
                    doc.text(`${parseFloat(item.stock_minimo || 0).toFixed(1)} ${item.unidad || 'u'}`, marginLeft + 380, y + 4, { width: 75, align: 'center' });
                    doc.font('Helvetica-Bold').fillColor('#b91c1c').text('REPOSICION URGENTE', marginLeft + 460, y + 4, { width: 70, align: 'right' });
                    y += 17;
                });
            }

            // ==========================================
            // 6. FIRMA Y CONSTANCIA DE AUDITORÍA
            // ==========================================
            const footY = 705;
            doc.strokeColor('#cbd5e1').lineWidth(0.8);
            doc.moveTo(marginLeft + 40, footY).lineTo(marginLeft + 200, footY).stroke();
            doc.moveTo(marginLeft + contentWidth - 200, footY).lineTo(marginLeft + contentWidth - 40, footY).stroke();

            doc.font('Helvetica').fontSize(8).fillColor('#64748b');
            doc.text('Responsable de Taller', marginLeft + 40, footY + 4, { width: 160, align: 'center' });
            doc.text('Administración Simonetta Modas', marginLeft + contentWidth - 200, footY + 4, { width: 160, align: 'center' });

            doc.fontSize(7).fillColor('#94a3b8').text(
                `Informe de Auditoría Simonetta Modas  |  Página 1 de 1  |  Confidencial Taller`,
                marginLeft,
                750,
                { width: contentWidth, align: 'center' }
            );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generarBufferNotaVenta,
    generarBufferReporteTaller
};
