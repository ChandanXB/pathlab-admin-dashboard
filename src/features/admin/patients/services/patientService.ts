import apiClient from '@/config/apiClient';
import type {
    Patient,
    PatientQueryParams,
    PatientFormData,
    PatientResponse,
} from '../types/patient.types';

export const patientService = {
    /**
     * Get all patients with pagination and filters
     */
    getPatients: async (params: PatientQueryParams): Promise<PatientResponse> => {
        const response = await apiClient.get('/patients', { params });
        return response.data;
    },

    /**
     * Get patient by ID
     */
    getPatientById: async (id: number): Promise<{ success: boolean; data: Patient }> => {
        const response = await apiClient.get(`/patients/${id}`);
        return response.data;
    },

    /**
     * Search patients by name, phone, or patient code
     */
    searchPatients: async (query: string): Promise<Patient[]> => {
        const response = await apiClient.get('/patients/search', {
            params: { q: query },
        });
        return response.data.data;
    },

    /**
     * Create a new patient
     */
    createPatient: async (data: PatientFormData): Promise<{ success: boolean; data: Patient }> => {
        const response = await apiClient.post('/patients', data);
        return response.data;
    },

    /**
     * Update an existing patient
     */
    updatePatient: async (
        id: number,
        data: Partial<PatientFormData>
    ): Promise<{ success: boolean; data: Patient }> => {
        const response = await apiClient.put(`/patients/${id}`, data);
        return response.data;
    },

    /**
     * Delete a patient
     */
    deletePatient: async (id: number): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/patients/${id}`);
        return response.data;
    },
};
