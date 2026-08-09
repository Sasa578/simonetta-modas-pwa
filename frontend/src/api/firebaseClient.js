import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuración cliente de Firebase
const firebaseConfig = {
  apiKey: "AIzaSy placeholder-api-key",
  projectId: "simonetta-modas",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

const app = initializeApp(firebaseConfig);
let messaging = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}

export const requestFirebaseToken = async () => {
  if (!messaging) return null;
  
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY_HERE_Opcional' // Reemplazar si hay Web Push Certificate en Firebase
    });
    
    if (currentToken) {
      console.log('✅ FCM Token obtenido:', currentToken);
      return currentToken;
    } else {
      console.warn('⚠ No se pudo obtener el FCM token, solicite permisos.');
      return null;
    }
  } catch (err) {
    console.error('❌ Error al obtener token FCM:', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });
