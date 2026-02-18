import colors from '@/styles/colors';

export const ORDER_STATUSES = [
    { label: 'Pending', value: 'pending', color: colors.status.pending },
    { label: 'Collected', value: 'collected', color: colors.status.collected },
    { label: 'Processing', value: 'processing', color: colors.status.processing },
    { label: 'Completed', value: 'completed', color: colors.status.completed },
    { label: 'Cancelled', value: 'cancelled', color: colors.status.cancelled },
] as const;

export const PRIORITIES = [
    { label: 'Normal', value: 'normal', color: 'default' },
    { label: 'Urgent', value: 'urgent', color: 'warning' },
    { label: 'STAT', value: 'stat', color: 'error' },
] as const;

export const PAYMENT_STATUSES = [
    { label: 'Unpaid', value: 'unpaid', color: 'default' },
    { label: 'Partial', value: 'partial', color: 'warning' },
    { label: 'Paid', value: 'paid', color: 'success' },
] as const;

export const ACCOUNT_STATUSES = [
    { label: 'Active', value: 'active', color: 'success' },
    { label: 'Inactive', value: 'inactive', color: 'error' },
] as const;

export const VEHICLE_TYPES = [
    { label: 'Bike', value: 'Bike' },
    { label: 'Scooter', value: 'Scooter' },
    { label: 'Car', value: 'Car' },
    { label: 'Cycle', value: 'Cycle' },
] as const;

export const SORT_OPTIONS = [
    { label: 'Newest First', value: 'createdAt-desc' },
    { label: 'Oldest First', value: 'createdAt-asc' },
    { label: 'Amount (High to Low)', value: 'total_amount-desc' },
    { label: 'Amount (Low to High)', value: 'total_amount-asc' },
] as const;
