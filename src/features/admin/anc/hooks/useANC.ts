import { useState, useEffect, useCallback } from 'react';
import { ancService, type Pregnancy } from '../services/ancService';
import { message } from 'antd';

export const useANC = () => {
    const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchPregnancies = useCallback(async (pageNum: number = 1, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        
        try {
            const response = await ancService.getAllPregnancies(pageNum, 50); // limit 50
            if (response.success) {
                const { data, totalPages } = response.data; // Now it returns { data, totalPages, ... }
                // fallback if backend doesn't send pagination structure (e.g. still returning raw array somehow)
                const items = Array.isArray(response.data) ? response.data : data || [];
                
                if (isLoadMore) {
                    setPregnancies(prev => [...prev, ...items]);
                } else {
                    setPregnancies(items);
                }
                
                // If we use the new pagination response format
                if (totalPages !== undefined) {
                    setHasMore(pageNum < totalPages);
                } else {
                    setHasMore(items.length === 50); // Fallback: if we got exactly limit items, assume there's more
                }
                setPage(pageNum);
            }
        } catch (error: any) {
            message.error('Failed to fetch pregnancy records');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    const loadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            fetchPregnancies(page + 1, true);
        }
    }, [fetchPregnancies, page, loading, loadingMore, hasMore]);

    const fetchPregnancyById = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const response = await ancService.getPregnancyById(id);
            if (response.success) {
                return response.data;
            }
        } catch (error: any) {
            message.error('Failed to fetch pregnancy details');
        } finally {
            setLoading(false);
        }
        return null;
    }, []);

    const updatePregnancy = useCallback(async (id: number, data: any) => {
        try {
            const response = await ancService.updatePregnancy(id, data);
            if (response.success) {
                message.success('Pregnancy record updated successfully');
                fetchPregnancies();
                return true;
            }
        } catch (error: any) {
            message.error('Failed to update pregnancy record');
        }
        return false;
    }, [fetchPregnancies]);

    const updatePregnancyStatus = useCallback(async (id: number, status: string) => {
        try {
            const response = await ancService.updatePregnancyStatus(id, status);
            if (response.success) {
                message.success('Pregnancy status updated successfully');
                fetchPregnancies();
                return true;
            }
        } catch (error: any) {
            message.error('Failed to update pregnancy status');
        }
        return false;
    }, [fetchPregnancies]);

    const logVisit = useCallback(async (id: number, data: any) => {
        try {
            const response = await ancService.logVisit(id, data);
            if (response.success) {
                message.success('Antenatal visit logged successfully');
                fetchPregnancies();
                return true;
            }
        } catch (error: any) {
            message.error('Failed to log antenatal visit');
        }
        return false;
    }, [fetchPregnancies]);

    const createPregnancy = useCallback(async (data: any) => {
        try {
            const response = await ancService.createPregnancy(data);
            if (response.success) {
                message.success('Pregnancy record created successfully');
                fetchPregnancies();
                return true;
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to create pregnancy record');
        }
        return false;
    }, [fetchPregnancies]);

    const logRiskAssessment = useCallback(async (id: number, data: any) => {
        try {
            const response = await ancService.logRiskAssessment(id, data);
            if (response.success) {
                message.success('Risk assessment logged successfully');
                fetchPregnancies();
                return true;
            }
        } catch (error: any) {
            message.error('Failed to log risk assessment');
        }
        return false;
    }, [fetchPregnancies]);

    const updateVisit = useCallback(async (visitId: number, data: any) => {
        try {
            const response = await ancService.updateVisit(visitId, data);
            if (response.success) {
                message.success('Antenatal visit updated successfully');
                fetchPregnancies();
                return true;
            }
        } catch (error: any) {
            message.error('Failed to update antenatal visit');
        }
        return false;
    }, [fetchPregnancies]);

    const deleteVisit = useCallback(async (visitId: number) => {
        try {
            const response = await ancService.deleteVisit(visitId);
            if (response.success) {
                message.success('Antenatal visit deleted successfully');
                fetchPregnancies();
                return true;
            }
        } catch (error: any) {
            message.error('Failed to delete antenatal visit');
        }
        return false;
    }, [fetchPregnancies]);

    const deletePregnancy = useCallback(async (id: number) => {
        try {
            const response = await ancService.deletePregnancy(id);
            if (response.success) {
                message.success('Pregnancy record deleted successfully');
                fetchPregnancies();
                return true;
            }
        } catch (error: any) {
            message.error('Failed to delete pregnancy record');
        }
        return false;
    }, [fetchPregnancies]);

    // This hook must always be called after all useCallbacks and useStates
    useEffect(() => {
        fetchPregnancies();
    }, [fetchPregnancies]);

    return {
        pregnancies,
        loading,
        hasMore,
        loadingMore,
        fetchPregnancies,
        loadMore,
        fetchPregnancyById,
        updatePregnancy,
        updatePregnancyStatus,
        logVisit,
        createPregnancy,
        logRiskAssessment,
        deletePregnancy,
        updateVisit,
        deleteVisit
    };
};
