import api from '@/config/apiClient';

export interface ServiceableCity {
    id: number;
    name: string;
    pincode?: string;
    address?: string;
    villages?: string[];
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export const locationService = {
    async getCities() {
        try {
            const response = await api.get('/serviceable-cities');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async createCity(data: { name: string; pincode?: string; address?: string; villages?: string[] }) {
        try {
            const response = await api.post('/serviceable-cities', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async updateCity(id: number, data: Partial<{ name: string; pincode: string; address: string; villages: string[]; status: string }>) {
        try {
            const response = await api.put(`/serviceable-cities/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async deleteCity(id: number) {
        try {
            const response = await api.delete(`/serviceable-cities/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
