/// <reference lib="webworker" />
// This directive pulls in the TypeScript WebWorker types (ServiceWorkerGlobalScope, etc.)

import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

declare const self: ServiceWorkerGlobalScope;

// Force immediate activation
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event: ExtendableEvent) => event.waitUntil(self.clients.claim()));

// Initialize Firebase in the service worker
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const title = payload.notification?.title || 'New Notification';
    const body = payload.notification?.body || '';
    const data = payload.data || {};

    // 1. Show the Chrome notification popup
    self.registration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'new-order',
        requireInteraction: true,
        data,
    });

    // 2. Broadcast to all open tabs so the badge updates in real-time
    self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients: readonly Client[]) => {
            clients.forEach((client: Client) => {
                (client as WindowClient).postMessage({
                    type: 'FCM_BACKGROUND_MESSAGE',
                    title,
                    body,
                    data,
                });
            });
        });
});

// Handle notification click — focus the app tab or open a new one
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();
    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList: readonly Client[]) => {
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return (client as WindowClient).focus();
                    }
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow('/');
                }
            })
    );
});
