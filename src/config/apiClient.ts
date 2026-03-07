import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { message } from 'antd';
import { useAuthStore } from '../store/authStore';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api/v1';

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


let isHandlingAuthError = false;

const handleAuthExpired = () => {
    if (isHandlingAuthError) return; // Already handling — skip duplicates
    isHandlingAuthError = true;

    useAuthStore.getState().logout();
    message.error('Your session has expired. Please login again.');

    // Small delay so the message renders before navigation
    setTimeout(() => {
        window.location.href = '/login';
        isHandlingAuthError = false;
    }, 800);
};

// Centralised response error handler
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            const status = error.response.status;
            const data: any = error.response.data;
            const errorMsg: string = data?.message || data?.error || '';

            // Keywords the backend sends when a JWT is expired / invalid
            const isTokenExpired =
                errorMsg.toLowerCase().includes('expired') ||
                errorMsg.toLowerCase().includes('invalid') ||
                errorMsg.toLowerCase().includes('token');

            switch (status) {
                case 401:
                    // Always means "not authenticated" — logout & redirect
                    handleAuthExpired();
                    break;

                case 403:
                    if (isTokenExpired) {
                        // 403 + token-related message → treat as session expiry
                        handleAuthExpired();
                    } else {
                        // Genuine permission error (role not allowed etc.)
                        message.error(errorMsg || 'You do not have permission to do this.');
                    }
                    break;

                case 404:
                    if (errorMsg) message.error(errorMsg);
                    break;

                case 422:
                    message.error(errorMsg || 'Validation error.');
                    break;

                case 500:
                    message.error(errorMsg || 'Server error. Please try again later.');
                    break;

                default:
                    if (errorMsg) message.error(errorMsg);
            }
        } else if (error.request) {
            message.error('Network error. Service might be down.');
        } else {
            message.error('An unexpected error occurred.');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
