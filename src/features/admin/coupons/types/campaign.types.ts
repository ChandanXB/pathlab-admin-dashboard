import type { Coupon } from './coupon.types';

export interface Campaign {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  bannerImage?: string;
  couponId?: number;
  coupon?: Coupon;
  startDate: string;
  endDate: string;
  isActive: boolean;
  ctaText?: string;
  targetUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignFormData {
  title: string;
  subtitle?: string;
  description?: string;
  bannerImage?: string;
  couponId?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  ctaText?: string;
  targetUrl?: string;
}
