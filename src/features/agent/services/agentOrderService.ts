import apiClient from '@/config/apiClient';

export interface AgentOrder {
    id: number;
    order_code: string;
    status: string;
    priority: string;
    total_amount: string;
    paid_amount: string;
    payment_status: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    order_source: string | null;
    order_type: string | null;
    assignment_status: string | null;
    scheduled_date: string | null;
    scheduled_time: string | null;
    sample_photo_url: string | null;
    payment_mode: string | null;
    payment_proof_url: string | null;
    collected_at: string | null;
    reached_at: string | null;
    createdAt: string;
    updatedAt: string;
    patient: {
        id: number;
        patient_code: string;
        full_name: string;
        phone: string | null;
        email: string | null;
        alternate_phone: string | null;
        address: string | null;
    } | null;
    test_results: Array<{
        id: number;
        status: string;
        result_value?: string;
        test: {
            id: number;
            test_name: string;
            test_code: string;
            price: string;
            sample_type?: string;
            category?: { category_name: string };
        };
    }>;
    collection_agent?: {
        id: number;
        name: string;
        phone: string;
    } | null;
}

export interface AgentProfile {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    status: string;
    vehicle_type: string | null;
    vehicle_no: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    profile_image?: string | null;
}

export const agentOrderService = {
    /**
     * Get all orders assigned to this agent
     */
    getMyOrders: async (agentId: number, params?: { status?: string }): Promise<{ data: AgentOrder[]; meta: any }> => {
        const queryParams: any = { agent_id: agentId, limit: 100 };
        if (params?.status) queryParams.status = params.status;
        const response = await apiClient.get('/lab-orders', { params: queryParams });
        return response.data;
    },

    /**
     * Update the assignment_status of an order (accept, picking_up, collected)
     */
    updateAssignmentStatus: async (orderId: number, assignmentStatus: string): Promise<any> => {
        const response = await apiClient.put(`/lab-orders/${orderId}/assignment-status`, {
            assignment_status: assignmentStatus
        });
        return response.data;
    },

    /**
     * Update the order status (e.g., mark as 'collected')
     */
    updateOrderStatus: async (orderId: number, status: string): Promise<any> => {
        const response = await apiClient.patch(`/lab-orders/${orderId}/status`, { status });
        return response.data;
    },

    /**
     * Update agent's live location
     */
    updateLocation: async (agentId: number, latitude: number, longitude: number): Promise<any> => {
        const response = await apiClient.put(`/collection-agents/${agentId}/location`, { latitude, longitude });
        return response.data;
    },

    /**
     * Get agent profile info
     */
    getAgentProfile: async (agentId: number): Promise<AgentProfile> => {
        const response = await apiClient.get(`/collection-agents/${agentId}`);
        return response.data.data;
    },

    /**
     * Update agent profile info (e.g., profile picture)
     */
    updateAgentProfile: async (agentId: number, data: Partial<AgentProfile>): Promise<any> => {
        const response = await apiClient.put(`/collection-agents/${agentId}`, data);
        return response.data;
    },

    /**
     * Upload collection proof (photos & payment)
     */
    uploadCollectionProof: async (orderId: number, proofData: {
        samplePhoto: string;
        paymentMode: 'cash' | 'upi';
        paymentProof?: string;
        amountPaid?: number;
    }): Promise<any> => {
        const response = await apiClient.post(`/lab-orders/${orderId}/collection-proof`, proofData);
        return response.data;
    },

    /**
     * Accept a broadcasted order
     */
    acceptOrder: async (orderId: number): Promise<any> => {
        const response = await apiClient.put(`/lab-orders/${orderId}/accept`);
        return response.data;
    },
};
