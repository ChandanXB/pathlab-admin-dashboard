import { useEffect, useRef } from 'react';
import { getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { messaging } from '@/config/firebase';
import apiClient from '@/config/apiClient';
import { useNotificationContext } from '@/contexts/NotificationContext';

export const useNotifications = () => {
    const { addNotification, fetchNotifications } = useNotificationContext();

    // Always hold the latest function references to avoid stale closures
    const addNotificationRef = useRef(addNotification);
    const fetchNotificationsRef = useRef(fetchNotifications);
    useEffect(() => {
        addNotificationRef.current = addNotification;
        fetchNotificationsRef.current = fetchNotifications;
    }, [addNotification, fetchNotifications]);

    useEffect(() => {
        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

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

        // --- FIX 1: Foreground listener ---
        // Fires when the tab IS the active focused tab
        const unsubscribeForeground = onMessage(messaging, (payload: MessagePayload) => {
            const title = payload.notification?.title || 'New Lab Order';
            const body = payload.notification?.body || '';
            const data = payload.data || {};

            addNotificationRef.current({
                title,
                description: body,
                type: data.type === 'order_completed' ? 'success' : 'info',
                data,
            });

            // Also show Chrome popup for foreground messages
            if (Notification.permission === 'granted' && navigator.serviceWorker) {
                navigator.serviceWorker.ready.then((reg) => {
                    reg.showNotification(title, {
                        body,
                        icon: '/favicon.ico',
                        badge: '/favicon.ico',
                        tag: 'new-notification',
                        requireInteraction: true,
                        data,
                    });
                });
            }
        });

        // --- FIX 2: Background SW postMessage listener ---
        // Fires when the Service Worker received the message (tab was not focused)
        // and broadcasts it back to the page via postMessage
        const handleSwMessage = (event: MessageEvent) => {
            if (event.data?.type === 'FCM_BACKGROUND_MESSAGE') {
                const { title, body, data } = event.data;
                addNotificationRef.current({
                    title,
                    description: body,
                    type: data?.type === 'order_completed' ? 'success' : 'info',
                    data: data || {},
                });
            }
        };

        navigator.serviceWorker.addEventListener('message', handleSwMessage);

        // --- FIX 3: Visibility fallback ---
        // When the user switches back to the tab, re-fetch from DB to sync any missed messages
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchNotificationsRef.current();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            unsubscribeForeground();
            navigator.serviceWorker.removeEventListener('message', handleSwMessage);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
};
