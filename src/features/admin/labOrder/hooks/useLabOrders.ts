import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { labOrderService } from '../services/labOrderService';
import type { LabOrder, LabOrderQueryParams, LabOrderFormData } from '../types/labOrder.types';

export const useLabOrders = (initialFilters: LabOrderQueryParams = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }) => {
    const [orders, setOrders] = useState<LabOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filters, setFilters] = useState<LabOrderQueryParams>(initialFilters);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasMore: false
    });

    const fetchOrders = useCallback(async () => {
        const isLoadMore = (filters.page || 1) > 1;
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const response = await labOrderService.getOrders(filters);

            if (response.success) {
                if (isLoadMore) {
                    setOrders(prev => [...prev, ...response.data]);
                } else {
                    setOrders(response.data);
                }

                const paginationData = response.meta || response.pagination;
                if (paginationData) {
                    setPagination({
                        ...paginationData,
                        hasMore: paginationData.page < paginationData.totalPages
                    });
                }
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch lab orders';
            message.error(errorMsg);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const loadMore = () => {
        if (!loadingMore && pagination.hasMore) {
            setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
        }
    };

    const createOrder = async (data: LabOrderFormData) => {
        try {
            setSubmitting(true);
            const response = await labOrderService.createOrder(data);
            if (response.success) {
                message.success('Lab order created successfully');
                fetchOrders();
                return true;
            }
            return false;
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to create lab order');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const updateOrder = async (id: number, data: Partial<LabOrderFormData>) => {
        try {
            setSubmitting(true);
            const response = await labOrderService.updateOrder(id, data);
            if (response.success) {
                message.success('Lab order updated successfully');
                fetchOrders();
                return true;
            }
            return false;
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to update lab order');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const updateOrderStatus = async (id: number, status: string) => {
        try {
            const response = await labOrderService.updateOrderStatus(id, status);
            if (response.success) {
                message.success(`Status updated to ${status}`);
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
                return true;
            }
            return false;
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to update status');
            return false;
        }
    };

    const deleteOrder = async (id: number) => {
        try {
            await labOrderService.deleteOrder(id);
            message.success('Lab order deleted');
            fetchOrders();
            return true;
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to delete lab order');
            return false;
        }
    };

    const assignAgent = async (id: number, agentId: number | null) => {
        try {
            const response = await labOrderService.assignAgent(id, agentId);
            if (response.success) {
                message.success('Collection agent assigned');
                setOrders(prev => prev.map(o => o.id === id ? response.data : o));
                return true;
            }
            return false;
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to assign agent');
            return false;
        }
    };

    const broadcastOrder = async (id: number) => {
        try {
            const response = await labOrderService.broadcastOrder(id);
            if (response.success) {
                message.success('Order broadcasted to all agents');
                setOrders(prev => prev.map(o => o.id === id ? response.data : o));
                return true;
            }
            return false;
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to broadcast order');
            return false;
        }
    };

    return {
        orders,
        loading,
        loadingMore,
        submitting,
        pagination,
        filters,
        setFilters,
        createOrder,
        updateOrder,
        updateOrderStatus,
        assignAgent,
        broadcastOrder,
        deleteOrder,
        loadMore,
        refresh: fetchOrders
    };
};
