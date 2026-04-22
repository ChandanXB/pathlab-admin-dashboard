import { useEffect } from 'react';
import { getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { messaging } from '@/config/firebase';
import apiClient from '@/config/apiClient';

export const useNotifications = () => {
    useEffect(() => {
        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
                    
                    // Register Service Worker explicitly
                    const swUrl = import.meta.env.DEV 
                        ? new URL('../service-worker/firebase-messaging-sw.ts', import.meta.url).href
                        : '/firebase-messaging-sw.js';

                    const registration = await navigator.serviceWorker.register(swUrl, {
                        type: import.meta.env.DEV ? 'module' : 'classic'
                    });

                    const token = await getToken(messaging, { 
                        vapidKey: vapidKey,
                        serviceWorkerRegistration: registration
                    });

                    if (token) {
                        await apiClient.post('/auth/register-device-token', {
                            token,
                            device_type: 'web'
                        });
                    }
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        };

        requestPermission();

        // Listen for foreground messages and show system notification via Service Worker
        const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
            const title = payload.notification?.title || 'New Lab Order';
            const body = payload.notification?.body || '';
            const data = payload.data || {};

            // Chrome requires showNotification via SW when a service worker is registered
            if (Notification.permission === 'granted' && navigator.serviceWorker) {
                navigator.serviceWorker.ready
                    .then((registration) => {
                        return registration.showNotification(title, {
                            body,
                            icon: '/favicon.ico',
                            badge: '/favicon.ico',
                            tag: 'new-order',
                            requireInteraction: true,
                            data,
                        });
                    })
                    .catch((e) => {
                        console.error('Failed to show notification:', e);
                    });
            }
        });

        return () => unsubscribe();
    }, []);
};
