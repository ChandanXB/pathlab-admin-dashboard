import React from 'react';
import { Users, Activity, FileCheck, CreditCard } from 'lucide-react';
import colors from '@/styles/colors';

export interface StatData {
    title: string;
    value: string;
    trend: string;
    isUp: boolean;
    icon: React.ReactNode;
    color: string;
    iconColor: string;
}

export const statsData: StatData[] = [
    {
        title: 'Total Patients',
        value: '1,284',
        trend: '+12.5%',
        isUp: true,
        icon: React.createElement(Users, { size: 20 }),
        color: colors.stats.patients,
        iconColor: colors.info
    },
    {
        title: 'Active Tests',
        value: '42',
        trend: '+3.2%',
        isUp: true,
        icon: React.createElement(Activity, { size: 20 }),
        color: colors.stats.tests,
        iconColor: colors.success
    },
    {
        title: 'Pending Reports',
        value: '15',
        trend: '-2.4%',
        isUp: false,
        icon: React.createElement(FileCheck, { size: 20 }),
        color: colors.stats.reports,
        iconColor: colors.danger
    },
    {
        title: 'Total Revenue',
        value: '₹12,450',
        trend: '+8.1%',
        isUp: true,
        icon: React.createElement(CreditCard, { size: 20 }),
        color: colors.stats.revenue,
        iconColor: colors.warning
    },
];

export const visitData = [
    { key: '1', name: 'John Doe', test: 'Complete Blood Count', date: '2023-10-24', status: 'Completed' },
    { key: '2', name: 'Jane Smith', test: 'Thyroid Profile', date: '2023-10-24', status: 'Pending' },
    { key: '3', name: 'Robert Johnson', test: 'Lipid Profile', date: '2023-10-23', status: 'Completed' },
    { key: '4', name: 'Emily Davis', test: 'HbA1c', date: '2023-10-23', status: 'In Progress' },
];

export const systemHealthMetrics = [
    { label: 'Report Generation', value: '98.2%', color: colors.success, percent: 98.2 },
    { label: 'Database Sync', value: '100%', color: colors.info, percent: 100 }
];

export const quickActions = [
    { label: 'New Test' },
    { label: 'Bulk Print' },
    { label: 'Inventory' },
    { label: 'Support' }
];
