// Firebase Admin SDK — Configuración para notificaciones push (TI-4.3)
const admin = require('firebase-admin');

let firebaseApp = null;

const inicializarFirebase = () => {
    if (firebaseApp) return firebaseApp;

    // Para producción se usaría una clave de servicio real.
    // En desarrollo inicializamos con credenciales de proyecto por defecto
    // o con applicationDefault() si está configurado en el entorno.
    try {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.FIREBASE_PROJECT_ID || 'simonetta-modas',
        });
        console.log('🔥 Firebase inicializado');
    } catch (error) {
        // Si no hay GOOGLE_APPLICATION_CREDENTIALS, usamos un modo simulado
        console.warn('⚠ Firebase no configurado — notificaciones deshabilitadas:', error.message);
        firebaseApp = null;
    }

    return firebaseApp;
};

/**
 * Envía una notificación push a un dispositivo FCM.
 * @param {string} fcmToken — Token del dispositivo destino
 * @param {object} payload  — { titulo, cuerpo, datos }
 * @returns {Promise<string|null>} messageId o null si falla
 */
const enviarNotificacion = async (fcmToken, payload) => {
    const app = inicializarFirebase();
    if (!app || !fcmToken) {
        console.log('📢 [SIMULADO] Notificación:', payload.titulo, '→ token:', fcmToken?.substring(0, 10) || 'N/A');
        return null;
    }

    try {
        const mensaje = {
            token: fcmToken,
            notification: {
                title: payload.titulo,
                body: payload.cuerpo,
            },
            data: payload.datos || {},
        };
        const response = await app.messaging().send(mensaje);
        console.log('✅ Notificación enviada:', response);
        return response;
    } catch (error) {
        console.error('❌ Error al enviar notificación:', error.message);
        return null;
    }
};

module.exports = { enviarNotificacion, inicializarFirebase };
