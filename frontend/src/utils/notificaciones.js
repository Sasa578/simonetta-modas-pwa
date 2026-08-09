// Utilidad de notificaciones push para el frontend (TI-4.4)
// Gestiona el permiso del navegador y el token FCM del dispositivo.

const FCM_PUBLIC_KEY = 'B placeholder-public-vapid-key';

/**
 * Solicita permiso de notificación al usuario y obtiene el token FCM.
 * @returns {Promise<string|null>} FCM token o null si el permiso fue denegado
 */
export const solicitarPermisoNotificaciones = async () => {
    if (!('Notification' in window)) {
        console.warn('🔕 Notificaciones no soportadas en este navegador.');
        return null;
    }

    if (Notification.permission === 'granted') {
        console.log('✅ Permiso de notificación ya concedido.');
        return await obtenerTokenFCM();
    }

    if (Notification.permission === 'denied') {
        console.warn('🚫 Permiso de notificación denegado por el usuario.');
        return null;
    }

    // Solicitar permiso
    const permiso = await Notification.requestPermission();
    if (permiso === 'granted') {
        console.log('✅ Permiso de notificación concedido.');
        return await obtenerTokenFCM();
    }

    console.warn('🚫 Permiso de notificación denegado.');
    return null;
};

/**
 * Obtiene el token FCM del dispositivo.
 * @returns {Promise<string|null>}
 */
const obtenerTokenFCM = async () => {
    try {
        // En producción se usaría firebase.messaging().getToken()
        // Por ahora devolvemos un token simulado para desarrollo
        const tokenSimulado = `fcm-simulado-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        console.log('📱 FCM Token (simulado):', tokenSimulado);
        return tokenSimulado;
    } catch (error) {
        console.error('❌ Error al obtener token FCM:', error);
        return null;
    }
};

/**
 * Guarda el token FCM en el backend asociado al usuario actual.
 * @param {string} fcmToken
 * @param {object} api — instancia de axios configurada
 */
export const registrarTokenFCM = async (fcmToken, api) => {
    try {
        await api.put('/auth/fcm-token', { fcm_token: fcmToken });
        console.log('✅ Token FCM registrado en el servidor.');
    } catch (error) {
        console.error('❌ Error al registrar token FCM:', error);
    }
};
