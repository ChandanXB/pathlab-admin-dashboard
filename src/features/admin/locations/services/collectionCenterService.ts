import api from '@/config/apiClient';

export interface CollectionCenter {
    id: number;
    center_name: string;
    type: string;
    rating?: number;
    review_count: number;
    services_available: string[];
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    open_time: string;
    close_time: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export const collectionCenterService = {
    async getCenters() {
        try {
            const response = await api.get('/collection-centers');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async createCenter(data: any) {
        try {
            const response = await api.post('/collection-centers', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async updateCenter(id: number, data: any) {
        try {
            const response = await api.put(`/collection-centers/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async deleteCenter(id: number) {
        try {
            const response = await api.delete(`/collection-centers/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
