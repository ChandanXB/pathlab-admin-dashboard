import apiClient from '@/config/apiClient';
import { useAuthStore } from '@/store/authStore';

export const authService = {
    login: async (email: string, password: string) => {
        const response = await apiClient.post('/auth/login', { email, password });
        const data = response.data;

        // Store token and user data using Zustand
        if (data.success && data.data.token) {
            useAuthStore.getState().login(data.data.user, data.data.token);
        }

        return data;
    },

    register: async (userData: any) => {
        const response = await apiClient.post('/auth/register', userData);
        const data = response.data;

        // Store token and user data using Zustand
        if (data.success && data.data.token) {
            useAuthStore.getState().login(data.data.user, data.data.token);
        }

        return data;
    },

    logout: () => {
        useAuthStore.getState().logout();
    },

    getCurrentUser: () => {
        return useAuthStore.getState().user;
    },

    isAuthenticated: () => {
        return useAuthStore.getState().isAuthenticated;
    },
    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },
    updateProfile: async (data: any) => {
        const response = await apiClient.patch('/auth/profile', data);
        if (response.data.success) {
            useAuthStore.getState().updateUser(response.data.data);
        }
        return response.data;
    }
};
