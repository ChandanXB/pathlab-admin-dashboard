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
    createdAt: string;
    updatedAt: string;
    mother: {
        id: number;
        full_name: string;
        patient_code: string;
        phone: string;
    };
    antenatal_visits?: any[];
}

export const ancService = {
    getAllPregnancies: async () => {
        const response = await apiClient.get('/pregnancies');
        return response.data;
    },
    updatePregnancy: async (id: number, data: any) => {
        const response = await apiClient.put(`/pregnancies/${id}`, data);
        return response.data;
    }
};
