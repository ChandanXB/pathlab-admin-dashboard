import apiClient from '@/config/apiClient';

export interface Pregnancy {
    id: number;
    mother_patient_id: number;
    lmp_date: string;
    edd_date: string;
    gestational_age_weeks: number;
    gravida: number;
    para: number;
    abortions: number;
    living_children: number;
    previous_complications: string;
    risk_level: string;
    report_url?: string;
    report_name?: string;
    createdAt: string;
    updatedAt: string;
    mother: {
        id: number;
        full_name: string;
        patient_code: string;
        phone: string;
        email?: string;
        pregnancies?: Array<{
            id: number;
            lmp_date: string;
            risk_level: string;
            createdAt: string;
        }>;
    };
    antenatal_visits?: any[];
    risk_assessments?: any[];
}

export const ancService = {
    getAllPregnancies: async () => {
        const response = await apiClient.get('/pregnancies');
        return response.data;
    },
    getPregnancyById: async (id: number) => {
        const response = await apiClient.get(`/pregnancies/${id}`);
        return response.data;
    },
    updatePregnancy: async (id: number, data: any) => {
        const response = await apiClient.put(`/pregnancies/${id}`, data);
        return response.data;
    },
    createPregnancy: async (data: any) => {
        const response = await apiClient.post('/pregnancies', data);
        return response.data;
    },
    logVisit: async (id: number, data: any) => {
        const response = await apiClient.post(`/pregnancies/${id}/visits`, data);
        return response.data;
    },
    logRiskAssessment: async (id: number, data: any) => {
        const response = await apiClient.post(`/pregnancies/${id}/risks`, data);
        return response.data;
    },
    shareAncCard: async (id: number, payload: { file_base64: string; mother_name: string; email: string }) => {
        const response = await apiClient.post(`/pregnancies/${id}/share`, payload);
        return response.data;
    }
};
