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
    },

    /**
     * Send a Google Meet link via email for an appointment
     * @param id The ID of the appointment
     * @param payload An object containing the meet link, date, and time
     */
    sendMeetLink: async (id: number, payload: { meet_link: string; date?: string; time?: string }) => {
        const response = await apiClient.post(`/appointments/${id}/meet-link`, payload);
        return response.data;
    },

    /**
     * Update the status of an appointment
     * @param id The ID of the appointment
     * @param status The new status (scheduled, completed, cancelled)
     */
    updateStatus: async (id: number, status: string) => {
        const response = await apiClient.patch(`/appointments/${id}/status`, { status });
        return response.data;
    }
};
