import apiClient from '@/config/apiClient';
import type {
    RoutineCheckup,
    RoutineCheckupCreateDTO,
    RoutineCheckupUpdateDTO,
    RoutineCheckupFilters
} from '../types/routineCheckup.types.js';

export const routineCheckupService = {
    /**
     * Get all routine checkups with filters
     */
    getRoutineCheckups: async (params?: RoutineCheckupFilters) => {
        const response = await apiClient.get('/routine-checkups', { params });
        return response.data;
    },

    /**
     * Get a routine checkup by ID
     */
    getRoutineCheckupById: async (id: number) => {
        const response = await apiClient.get(`/routine-checkups/${id}`);
        return response.data.data;
    },

    /**
     * Create a new routine checkup
     */
    createRoutineCheckup: async (data: RoutineCheckupCreateDTO) => {
        const response = await apiClient.post('/routine-checkups', data);
        return response.data.data;
    },

    /**
     * Update an existing routine checkup
     */
    updateRoutineCheckup: async (id: number, data: RoutineCheckupUpdateDTO) => {
        const response = await apiClient.put(`/routine-checkups/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete a routine checkup
     */
    deleteRoutineCheckup: async (id: number) => {
        const response = await apiClient.delete(`/routine-checkups/${id}`);
        return response.data;
    },
};
