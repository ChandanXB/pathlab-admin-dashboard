import apiClient from '@/config/apiClient';
import type { DoctorQueryParams } from '../types/doctor.types';

export interface DoctorFormData {
    name: string;
    phone: string;
    email: string;
    password?: string;
    specialty: string;
    status: 'active' | 'inactive';
}

export const doctorService = {
    /**
     * Get all doctors with pagination and filters
     */
    getDoctors: async (params: DoctorQueryParams) => {
        const response = await apiClient.get('/doctors', { params });
        return response.data;
    },

    /**
     * Get doctor by ID
     */
    getDoctorById: async (id: number) => {
        const response = await apiClient.get(`/doctors/${id}`);
        return response.data;
    },

    /**
     * Create a new doctor
     */
    createDoctor: async (data: DoctorFormData) => {
        const response = await apiClient.post('/doctors', data);
        return response.data;
    },

    /**
     * Update an existing doctor
     */
    updateDoctor: async (id: number, data: Partial<DoctorFormData>) => {
        const response = await apiClient.put(`/doctors/${id}`, data);
        return response.data;
    },

    /**
     * Delete a doctor
     */
    deleteDoctor: async (id: number) => {
        const response = await apiClient.delete(`/doctors/${id}`);
        return response.data;
    },
};
