import { useState, useEffect } from 'react';
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
                labOrderService.getOrders({ limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }) // Only need 50 for the recent orders table
            ]);

            if (orderStatsRes.success && patientRes.success) {
                const orderData = orderStatsRes.data;
                const totalPatients = patientRes.meta?.total || patientRes.pagination?.total || 0;
                const orders: any[] = recentOrdersRes.data || [];

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
                    trends: orderData.trends || defaultTrends,
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
