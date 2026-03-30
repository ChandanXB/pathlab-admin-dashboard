import { useState, useEffect } from 'react';
import { ancService, type Pregnancy } from '../services/ancService';
import { message } from 'antd';

export const useANC = () => {
    const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPregnancies = async () => {
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
    };

    useEffect(() => {
        fetchPregnancies();
    }, []);

    const updatePregnancy = async (id: number, data: any) => {
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
    };

    return {
        pregnancies,
        loading,
        fetchPregnancies,
        updatePregnancy
    };
};
