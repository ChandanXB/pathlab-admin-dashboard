importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Force this SW to activate immediately (don't wait for old tab to close)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

// Full Firebase config required here — service workers cannot access import.meta.env
firebase.initializeApp({
    apiKey: "AIzaSyDXFBGEsBXgx85cBtw39wAoDf20JvTQ7UY",
    authDomain: "patlab-dev.firebaseapp.com",
    projectId: "patlab-dev",
    storageBucket: "patlab-dev.firebasestorage.app",
    messagingSenderId: "678993127915",
    appId: "1:678993127915:web:032b6a23cdd3f79a9451ae"
});

const messaging = firebase.messaging();

// Handle BACKGROUND messages (tab is hidden or closed)
messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'New Notification';
    const options = {
        body: payload.notification?.body || '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'new-order',
        requireInteraction: true,
        data: payload.data || {}
    };

    self.registration.showNotification(title, options);
});

// Handle notification click — opens/focuses the Admin UI tab
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
