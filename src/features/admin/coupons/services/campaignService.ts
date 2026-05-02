import axiosInstance from '@/config/apiClient';
import type { CampaignFormData } from '../types/campaign.types';

export const campaignService = {
  getAllCampaigns: async (params?: { search?: string; page?: number; limit?: number; isActive?: boolean }) => {
    const response = await axiosInstance.get('/campaigns', { params });
    return response.data;
  },

  getCampaignById: async (id: number) => {
    const response = await axiosInstance.get(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (data: CampaignFormData) => {
    const response = await axiosInstance.post('/campaigns', data);
    return response.data;
  },

  updateCampaign: async (id: number, data: Partial<CampaignFormData>) => {
    const response = await axiosInstance.put(`/campaigns/${id}`, data);
    return response.data;
  },

  deleteCampaign: async (id: number) => {
    const response = await axiosInstance.delete(`/campaigns/${id}`);
    return response.data;
  },

  sendCampaign: async (id: number, payload: { userIds?: number[]; sendAll: boolean }) => {
    const response = await axiosInstance.post(`/campaigns/${id}/send`, payload);
    return response.data;
  },
};
