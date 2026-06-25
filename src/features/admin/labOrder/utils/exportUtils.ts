import type { LabOrder } from '../types/labOrder.types';
import dayjs from 'dayjs';

/**
 * Helper to escape/format values specifically for Excel import from CSV.
 * Prevents scientific notation (e.g. phone numbers 9.2E+11) and autoconverting
 * date strings into values that display as "###" in narrow columns.
 */
const formatExcelCell = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);

    // Check if it's a numeric code or phone number that Excel might convert to scientific notation
    const isPhoneNumber = /^\+?\d{8,15}$/.test(str) || /^\d{1,4}E\+?\d+$/i.test(str);
    
    // Check if it's an order code (like ORD-XXXX-XXXX)
    const isOrderCode = /^ORD-\d+-\d+$/.test(str);

    // Check if it's a date or timestamp
    const isDate = /^\d{4}-\d{2}-\d{2}/.test(str);

    // Check if it's a scheduled time (e.g. 08:00 AM or 19:00)
    const isTime = /^\d{2}:\d{2}/.test(str);

    if (isPhoneNumber || isOrderCode || isDate || isTime) {
        // wrapping in ="value" forces Excel to interpret as text formula
        return `="${str}"`;
    }

    return str;
};

/**
 * Formats and exports lab orders to a UTF-8 CSV file openable directly in Excel.
 */
export const exportOrdersToCSV = (orders: LabOrder[]) => {
    const headers = [
        'Order Code',
        'Patient Name',
        'Patient Phone',
        'Patient Email',
        'Address',
        'Scheduled Date',
        'Scheduled Time',
        'Tests',
        'Total Amount',
        'Discount Amount',
        'Paid Amount',
        'Payment Status',
        'Payment Mode',
        'Order Status',
        'Collection Agent',
        'Agent Phone',
        'Assignment Status',
        'Created At',
        'Collected At',
        'Notes',
    ];

    const rows = orders.map((order) => {
        const tests = order.test_results?.map((tr) => tr.test?.test_name).filter(Boolean).join(', ') || '';
        const agentName = order.collection_agent?.name || '';
        const agentPhone = order.collection_agent?.phone || '';
        const patientName = order.patient?.full_name || '';
        const patientPhone = order.patient?.phone || '';
        const patientEmail = order.patient?.email || '';

        return [
            order.order_code || '',
            patientName,
            patientPhone,
            patientEmail,
            order.address || '',
            order.scheduled_date ? dayjs(order.scheduled_date).format('YYYY-MM-DD') : '',
            order.scheduled_time || '',
            tests,
            order.total_amount || 0,
            order.discount_amount || 0,
            order.paid_amount || 0,
            order.payment_status || '',
            order.payment_mode || '',
            order.status || '',
            agentName,
            agentPhone,
            order.assignment_status || '',
            order.createdAt ? dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
            order.collected_at ? dayjs(order.collected_at).format('YYYY-MM-DD HH:mm:ss') : '',
            order.notes || '',
        ];
    });

    const csvContent = [
        headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
        ...rows.map((row) => row.map((val) => {
            const formatted = formatExcelCell(val);
            return `"${formatted.replace(/"/g, '""')}"`;
        }).join(',')),
    ].join('\r\n');

    // Add UTF-8 BOM so Excel opens it with correct formatting
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileName = `lab_orders_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
