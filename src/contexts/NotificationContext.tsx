import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/config/apiClient';
import { useAuthStore } from '@/store/authStore';

export interface NotificationItem {
    id: string | number;
    title: string;
    description: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    data?: any;
}

interface NotificationContextType {
    notifications: NotificationItem[];
    unreadCount: number;
    fetchNotifications: () => Promise<void>;
    addNotification: (notification: Omit<NotificationItem, 'id' | 'read' | 'time'>) => void;
    markAsRead: (id: string | number) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
    deleteNotification: (id: string | number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await apiClient.get('/notifications');
            if (response.data && response.data.data) {
                const fetched: NotificationItem[] = response.data.data.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    description: n.body,
                    time: new Date(n.createdAt).toLocaleString(),
                    type: n.type as any,
                    read: n.is_read,
                    data: n.data
                }));

                // Merge: keep any real-time local notifications, then append DB ones
                setNotifications(prev => {
                    const localItems = prev.filter(n =>
                        typeof n.id === 'string' && n.id.startsWith('local-')
                    );
                    return [...localItems, ...fetched];
                });
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, []);

    // Load from API on mount
    useEffect(() => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // addNotification is stable — wrapped in useCallback with no deps
    const addNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'read' | 'time'>) => {
        const newItem: NotificationItem = {
            ...notification,
            id: `local-${Date.now()}`,
            read: false,
            time: 'Just now',
        };
        setNotifications(prev => [newItem, ...prev].slice(0, 50));
    }, []);

    const markAsRead = async (id: string | number) => {
        // Optimistic UI update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

        try {
            // Don't sync local-only IDs to the backend
            if (typeof id === 'string' && id.startsWith('local-')) {
                return;
            }
            await apiClient.patch(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.patch('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
        }
    };

    const clearNotifications = async () => {
        // Mark all as read in DB so they don't reappear on reload
        try {
            await apiClient.patch('/notifications/mark-all-read');
        } catch (error) {
            console.error('Failed to mark all as read on server', error);
        }
        // Clear from local UI state
        setNotifications([]);
    };

    const deleteNotification = async (id: string | number) => {
        // Remove from UI immediately
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Sync with backend if it's a real DB notification
        try {
            if (typeof id === 'string' && id.startsWith('local-')) return;
            await apiClient.delete(`/notifications/${id}`);
        } catch (error) {
            console.error('Failed to delete notification on server', error);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            fetchNotifications,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearNotifications,
            deleteNotification,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};
