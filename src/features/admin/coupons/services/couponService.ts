import axiosInstance from '@/config/apiClient';
import type { CouponFormData } from '../types/coupon.types';

export const couponService = {
  getAllCoupons: async (params?: any) => {
    const response = await axiosInstance.get('/coupons', { params });
    return response.data;
  },

  getCouponById: async (id: number) => {
    const response = await axiosInstance.get(`/coupons/${id}`);
    return response.data;
  },

  createCoupon: async (data: CouponFormData) => {
    const response = await axiosInstance.post('/coupons', data);
    return response.data;
  },

  updateCoupon: async (id: number, data: Partial<CouponFormData>) => {
    const response = await axiosInstance.put(`/coupons/${id}`, data);
    return response.data;
  },

  deleteCoupon: async (id: number) => {
    const response = await axiosInstance.delete(`/coupons/${id}`);
    return response.data;
  },
};
