import { useState, useEffect } from 'react';
import { labOrderService } from '@/features/admin/labOrder/services/labOrderService';
import { patientService } from '@/features/admin/patients/services/patientService';

export interface DashboardStats {
    totalPatients: number;
    activeTests: number;
    pendingReports: number;
    totalRevenue: number;
    statusCounts: Record<string, number>;
    recentOrders: any[];
}

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalPatients: 0,
        activeTests: 0,
        pendingReports: 0,
        totalRevenue: 0,
        statusCounts: {},
        recentOrders: [],
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
                    recentOrders: recentOrdersRes.data || []
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
