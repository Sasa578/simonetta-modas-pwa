require('dotenv').config();
const { verificarConexionTransporter, obtenerTransporter } = require('./utils/emailService');
const { generarBufferReporteTaller } = require('./utils/pdfGenerator');

async function testEmail() {
    console.log('====================================================');
    console.log('  DIAGNÓSTICO Y PRUEBA DE CORREO - SIMONETTA MODAS  ');
    console.log('====================================================\n');

    console.log('1. Verificando variables de entorno en .env:');
    console.log('   EMAIL_SERVICE :', process.env.EMAIL_SERVICE || '(no definido, usando host)');
    console.log('   EMAIL_HOST    :', process.env.EMAIL_HOST || 'smtp.gmail.com');
    console.log('   EMAIL_PORT    :', process.env.EMAIL_PORT || '465');
    console.log('   EMAIL_USER    :', process.env.EMAIL_USER ? `${process.env.EMAIL_USER.slice(0, 4)}***@${process.env.EMAIL_USER.split('@')[1] || ''}` : '❌ NO DEFINIDO');
    console.log('   EMAIL_PASS    :', process.env.EMAIL_PASS ? '******** (definido)' : '❌ NO DEFINIDO');
    console.log('   ADMIN_EMAIL   :', process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '(no definido)');
    console.log('----------------------------------------------------');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n⚠️  ATENCIÓN: Faltan credenciales de correo en el archivo .env.');
        console.log('   Para configurar Gmail:');
        console.log('   1. Activa la verificación en 2 pasos en tu cuenta de Google.');
        console.log('   2. Genera una "Contraseña de Aplicación" de 16 caracteres.');
        console.log('   3. Añade en backend/.env:');
        console.log('      EMAIL_SERVICE=gmail');
        console.log('      EMAIL_USER=tu_correo@gmail.com');
        console.log('      EMAIL_PASS=xxxx xxxx xxxx xxxx');
        console.log('      ADMIN_EMAIL=tu_correo@gmail.com');
        console.log('\nConsulta el documento GUIA_CONFIGURACION_CORREO_LAPTOP.md para instrucciones detalladas.\n');
        process.exit(0);
    }

    console.log('\n2. Verificando conexión con el servidor SMTP...');
    const resVerif = await verificarConexionTransporter();

    if (!resVerif.ok) {
        console.error('❌ ERROR DE CONEXIÓN SMTP:');
        console.error('   ', resVerif.error);
        console.log('\nConsejos de solución:');
        console.log(' - Si usas Gmail, asegúrate de usar la Contraseña de Aplicación de 16 letras, no tu contraseña normal.');
        console.log(' - Verifica que tu antivirus o red no bloqueen el puerto 465 / 587.\n');
        process.exit(1);
    }

    console.log('✅ ' + resVerif.mensaje);

    // Si se pasa un argumento con el correo destino: node test_email.js mi_correo@gmail.com
    const correoDestino = process.argv[2] || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    if (process.argv[2] || process.env.ENVIAR_TEST === 'true') {
        console.log(`\n3. Enviando correo de prueba con PDF adjunto a: ${correoDestino}...`);
        try {
            const transporter = obtenerTransporter();
            const pdfBuffer = await generarBufferReporteTaller({
                periodo: 'Prueba de Sistema 2026',
                kpis: {
                    total_pedidos: 5,
                    pedidos_entregados: 3,
                    total_recaudado: 3500,
                    total_efectivo: 2000,
                    total_qr: 1500,
                    total_saldos_pendientes: 800,
                    pedidos_con_deuda: 1,
                    items_bajo_stock: 0,
                    movimientos_almacen: 10
                },
                pedidos: [],
                bajo_stock: []
            });

            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || `"Simonetta Modas" <${process.env.EMAIL_USER}>`,
                to: correoDestino,
                subject: '🧪 Correo de Prueba con PDF - Simonetta Modas',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
                        <h2 style="color: #0f172a;">Simonetta Modas - Verificación de Correo</h2>
                        <p>Este es un correo de prueba enviado exitosamente desde el backend del sistema.</p>
                        <p>Se adjunta una muestra de reporte en PDF para verificar la recepción de archivos adjuntos.</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0;">
                        <small style="color: #64748b;">Fecha de emisión: ${new Date().toLocaleString('es-BO')}</small>
                    </div>
                `,
                attachments: [
                    {
                        filename: 'Reporte_Prueba_Simonetta.pdf',
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            });

            console.log('✅ ¡CORREO ENVIADO CON ÉXITO!');
            console.log('   ID de Mensaje:', info.messageId);
            console.log('   Destinatario :', correoDestino);
            console.log('\nRevisa la bandeja de entrada (o carpeta de spam) de ' + correoDestino + '.\n');
        } catch (sendErr) {
            console.error('❌ Error al enviar el mensaje:', sendErr.message);
            process.exit(1);
        }
    } else {
        console.log('\n💡 Para enviar un correo real de prueba con PDF adjunto, ejecuta:');
        console.log(`   node test_email.js ${process.env.EMAIL_USER || 'tu_correo@gmail.com'}\n`);
    }

    process.exit(0);
}

testEmail().catch(err => {
    console.error('Error general:', err);
    process.exit(1);
});
