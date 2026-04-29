export interface Coupon {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string | number;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  minOrderValue: string | number;
  status: 'active' | 'inactive';
  applicableTo: 'all' | 'test' | 'package';
  applicableIds: number[];
  showOnLandingPage: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponFormData {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  minOrderValue?: number;
  status: 'active' | 'inactive';
  applicableTo: 'all' | 'test' | 'package';
  applicableIds: number[];
  showOnLandingPage?: boolean;
}
