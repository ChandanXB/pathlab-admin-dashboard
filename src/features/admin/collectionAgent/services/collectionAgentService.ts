import apiClient from '@/config/apiClient';

export interface CollectionAgent {
    id: number;
    name: string;
    phone: string;
    email?: string;
    status: string;
    vehicle_type?: string;
    vehicle_no?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    user_id?: number;
    _count?: {
        lab_orders: number;
    };
    lab_orders?: any[];
    createdAt: string;
}

export interface CollectionAgentFormData {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    status?: string;
    vehicle_type?: string;
    vehicle_no?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
}

export const collectionAgentService = {
    getAgents: async (params?: any) => {
        const response = await apiClient.get('/collection-agents', { params });
        return response.data;
    },

    getAgentById: async (id: number) => {
        const response = await apiClient.get(`/collection-agents/${id}`);
        return response.data;
    },

    createAgent: async (data: CollectionAgentFormData) => {
        const response = await apiClient.post('/collection-agents', data);
        return response.data;
    },

    updateAgent: async (id: number, data: Partial<CollectionAgentFormData>) => {
        const response = await apiClient.put(`/collection-agents/${id}`, data);
        return response.data;
    },

    deleteAgent: async (id: number) => {
        const response = await apiClient.delete(`/collection-agents/${id}`);
        return response.data;
    }
};
