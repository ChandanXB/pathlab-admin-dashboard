import apiClient from '@/config/apiClient';
import type {
    LabOrder,
    LabOrderQueryParams,
    LabOrderFormData,
    LabOrderResponse
} from '../types/labOrder.types';

export const labOrderService = {
    /**
     * Get all lab orders with pagination and filters
     */
    getOrders: async (params: LabOrderQueryParams): Promise<LabOrderResponse> => {
        const response = await apiClient.get('/lab-orders', { params });
        return response.data;
    },

    /**
     * Get lab order by ID
     */
    getOrderById: async (id: number): Promise<{ success: boolean; data: LabOrder }> => {
        const response = await apiClient.get(`/lab-orders/${id}`);
        return response.data;
    },

    /**
     * Create a new lab order
     */
    createOrder: async (data: LabOrderFormData): Promise<{ success: boolean; data: LabOrder }> => {
        const response = await apiClient.post('/lab-orders', data);
        return response.data;
    },

    /**
     * Update an existing lab order
     */
    updateOrder: async (id: number, data: Partial<LabOrderFormData>): Promise<{ success: boolean; data: LabOrder }> => {
        const response = await apiClient.put(`/lab-orders/${id}`, data);
        return response.data;
    },

    /**
     * Update order status only
     */
    updateOrderStatus: async (id: number, status: string): Promise<{ success: boolean; data: LabOrder }> => {
        const response = await apiClient.patch(`/lab-orders/${id}/status`, { status });
        return response.data;
    },

    /**
     * Delete a lab order
     */
    deleteOrder: async (id: number): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/lab-orders/${id}`);
        return response.data;
    },

    /**
     * Get order statistics
     */
    getOrderStats: async () => {
        const response = await apiClient.get('/lab-orders/stats');
        return response.data;
    },

    /**
     * Assign a collection agent to a lab order
     */
    assignAgent: async (id: number, agentId: number | null): Promise<{ success: boolean; data: LabOrder }> => {
        const response = await apiClient.put(`/lab-orders/${id}/assign`, { agent_id: agentId });
        return response.data;
    },

    /**
     * Broadcast a lab order to all agents
     */
    broadcastOrder: async (id: number): Promise<{ success: boolean; data: LabOrder }> => {
        const response = await apiClient.put(`/lab-orders/${id}/broadcast`);
        return response.data;
    }
};
