import apiClient from '@/config/apiClient';

export const appointmentService = {
    /**
     * Get all appointments for the logged-in doctor
     */
    getDoctorAppointments: async () => {
        const response = await apiClient.get('/appointments/doctor');
        return response.data;
    },

    /**
     * Add or update a clinical precaution for a specific appointment
     * @param id The ID of the appointment
     * @param precaution The precaution text
     * @param file_base64 Optional base64 file string to upload
     */
    savePrecaution: async (id: number, precaution: string, file_base64?: string) => {
        const response = await apiClient.post(`/appointments/${id}/precaution`, { precaution, file_base64 });
        return response.data;
    }
};
