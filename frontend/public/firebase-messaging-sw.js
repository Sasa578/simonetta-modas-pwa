// Service Worker para Firebase Cloud Messaging (TI-4.4)
// Registrado por el frontend para recibir notificaciones push en background.

// Firebase App (CDN) — los imports se resuelven en runtime por el Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSy placeholder-api-key',
    projectId: 'simonetta-modas',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000000000',
});

const messaging = firebase.messaging();

// Manejar notificaciones en background
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Notificación en background:', payload);

    const { title, body } = payload.notification || {};
    const opciones = {
        body: body || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: payload.data || {},
    };

    self.registration.showNotification(title || 'Simonetta Modas', opciones);
});

// Click en la notificación → abrir la app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
