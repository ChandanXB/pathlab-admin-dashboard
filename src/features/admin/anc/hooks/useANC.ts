import { useState, useEffect, useCallback } from 'react';
import { ancService, type Pregnancy } from '../services/ancService';
import { message } from 'antd';

export const useANC = () => {
    const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPregnancies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ancService.getAllPregnancies();
            if (response.success) {
                setPregnancies(response.data);
            }
        } catch (error: any) {
            message.error('Failed to fetch pregnancy records');
        } finally {
            setLoading(false);
        }
    }, []);

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

    // This hook must always be called after all useCallbacks and useStates
    useEffect(() => {
        fetchPregnancies();
    }, [fetchPregnancies]);

    return {
        pregnancies,
        loading,
        fetchPregnancies,
        fetchPregnancyById,
        updatePregnancy,
        logVisit,
        createPregnancy,
        logRiskAssessment
    };
};
