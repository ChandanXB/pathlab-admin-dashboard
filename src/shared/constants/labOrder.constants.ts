export const ORDER_STATUSES = [
    { label: 'Pending', value: 'pending', color: 'orange' },
    { label: 'Collected', value: 'collected', color: 'blue' },
    { label: 'Processing', value: 'processing', color: 'purple' },
    { label: 'Completed', value: 'completed', color: 'green' },
    { label: 'Cancelled', value: 'cancelled', color: 'red' },
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

export const SORT_OPTIONS = [
    { label: 'Newest First', value: 'createdAt-desc' },
    { label: 'Oldest First', value: 'createdAt-asc' },
    { label: 'Amount (High to Low)', value: 'total_amount-desc' },
    { label: 'Amount (Low to High)', value: 'total_amount-asc' },
] as const;
