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

// Handle session expiration (401)
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            const status = error.response.status;
            const data: any = error.response.data;
            const errorMsg = data.message || data.error;

            switch (status) {
                case 401:
                    useAuthStore.getState().logout();
                    window.location.href = '/login';
                    message.error('Session expired. Please login again.');
                    break;
                case 403:
                    message.error(errorMsg || 'Permission denied.');
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
