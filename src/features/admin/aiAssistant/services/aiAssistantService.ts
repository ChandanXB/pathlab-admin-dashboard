import apiClient from '@/config/apiClient';

export interface AIContext {
    totalPatients: number;
    totalRevenue: number;
    activeTests: number;
    pendingReports: number;
    statusCounts: Record<string, number>;
    recentOrders: any[];
}

export const aiAssistantService = {
    /**
     * Send a message to the PathLab AI Analytics Assistant.
     * Routes through backend (same pattern as report extraction) — backend calls Gemini.
     * Auth token is automatically attached by apiClient interceptor.
     */
    analyze: async (message: string, context: AIContext): Promise<string> => {
        const response = await apiClient.post(
            '/lab-orders/ai-analyze',
            { message, context },
            { timeout: 30000 }
        );
        const data = response.data;
        if (data?.success && data?.data?.reply) {
            return data.data.reply as string;
        }
        throw new Error(data?.message || 'AI returned an empty response');
    },
};
