import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { labOrderService } from '@/features/admin/labOrder/services/labOrderService';
import { patientService } from '@/features/admin/patients/services/patientService';

export interface StatTrend {
    trend: string;
    isUp: boolean;
}

export interface DashboardStats {
    totalPatients: number;
    activeTests: number;
    pendingReports: number;
    totalRevenue: number;
    statusCounts: Record<string, number>;
    recentOrders: any[];
    trends: {
        totalPatients: StatTrend;
        activeTests: StatTrend;
        pendingReports: StatTrend;
        totalRevenue: StatTrend;
    };
}

/** Computes a human-readable week-over-week trend string */
const computeTrend = (current: number, previous: number): StatTrend => {
    if (previous === 0 && current === 0) return { trend: '0%', isUp: true };
    if (previous === 0) return { trend: '+New', isUp: true };
    const pct = Math.round(((current - previous) / previous) * 100);
    return {
        trend: pct >= 0 ? `+${pct}%` : `${pct}%`,
        isUp: pct >= 0,
    };
};

const defaultTrends: DashboardStats['trends'] = {
    totalPatients: { trend: '—', isUp: true },
    activeTests: { trend: '—', isUp: true },
    pendingReports: { trend: '—', isUp: false },
    totalRevenue: { trend: '—', isUp: true },
};

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalPatients: 0,
        activeTests: 0,
        pendingReports: 0,
        totalRevenue: 0,
        statusCounts: {},
        recentOrders: [],
        trends: defaultTrends,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // Call existing services in parallel
            const [orderStatsRes, patientRes, recentOrdersRes] = await Promise.all([
                labOrderService.getOrderStats(),
                patientService.getPatients({ limit: 1 }),
                labOrderService.getOrders({ limit: 500, sortBy: 'createdAt', sortOrder: 'desc' })
            ]);

            if (orderStatsRes.success && patientRes.success) {
                const orderData = orderStatsRes.data;
                const totalPatients = patientRes.meta?.total || patientRes.pagination?.total || 0;
                const orders: any[] = recentOrdersRes.data || [];

                // ── Week boundaries ──────────────────────────────────────────
                const thisWeekStart = dayjs().startOf('week');
                const lastWeekStart = dayjs().subtract(1, 'week').startOf('week');
                const lastWeekEnd   = dayjs().subtract(1, 'week').endOf('week');

                const thisWeekOrders = orders.filter(o => dayjs(o.createdAt).isAfter(thisWeekStart));
                const lastWeekOrders = orders.filter(o => {
                    const d = dayjs(o.createdAt);
                    return d.isAfter(lastWeekStart) && d.isBefore(lastWeekEnd);
                });

                // Revenue trend
                const thisWeekRevenue = thisWeekOrders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
                const lastWeekRevenue = lastWeekOrders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);

                // Active tests trend (non-completed, non-cancelled orders)
                const isActive = (o: any) => !['completed', 'cancelled'].includes(o.status);
                const thisWeekActive = thisWeekOrders.filter(isActive).length;
                const lastWeekActive = lastWeekOrders.filter(isActive).length;

                // Pending reports trend (processing status)
                const thisWeekProcessing = thisWeekOrders.filter(o => o.status === 'processing').length;
                const lastWeekProcessing = lastWeekOrders.filter(o => o.status === 'processing').length;

                // Patient activity trend — unique patients placing orders this week vs last
                const thisWeekPatients = new Set(thisWeekOrders.map(o => o.patient_id)).size;
                const lastWeekPatients = new Set(lastWeekOrders.map(o => o.patient_id)).size;

                // Calculate Active Tests: All orders that are NOT completed or cancelled
                const activeTests = (orderData.totalOrders || 0) -
                    ((orderData.statusCounts?.completed || 0) +
                        (orderData.statusCounts?.cancelled || 0));

                setStats({
                    totalPatients,
                    activeTests,
                    pendingReports: orderData.statusCounts?.processing || 0,
                    totalRevenue: orderData.totalRevenue || 0,
                    statusCounts: orderData.statusCounts || {},
                    recentOrders: orders,
                    trends: {
                        totalPatients: computeTrend(thisWeekPatients, lastWeekPatients),
                        activeTests:   computeTrend(thisWeekActive, lastWeekActive),
                        pendingReports: computeTrend(thisWeekProcessing, lastWeekProcessing),
                        totalRevenue:  computeTrend(thisWeekRevenue, lastWeekRevenue),
                    },
                });
            }
            setError(null);
        } catch (err: any) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to fetch dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, error, refresh: fetchStats };
};
