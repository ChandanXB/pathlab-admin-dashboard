import { useState, useEffect } from 'react';
import { message } from 'antd';
import { routineCheckupService } from '../services/routineCheckupService';
import type { RoutineCheckupFilters } from '../types/routineCheckup.types';

export const useRoutineCheckups = (enabled: boolean = true) => {
    const [routineCheckups, setRoutineCheckups] = useState<any[]>([]);
    const [loadingRoutineCheckups, setLoadingRoutineCheckups] = useState(false);
    const [routineCheckupFilters, setRoutineCheckupFilters] = useState<RoutineCheckupFilters>({
        page: 1,
        limit: 100, // No pagination needed for routine checkups usually as they are few
        search: '',
        status: undefined,
        gender: undefined,
        categoryId: undefined,
    });

    const fetchRoutineCheckups = async () => {
        setLoadingRoutineCheckups(true);
        try {
            const response = await routineCheckupService.getRoutineCheckups(routineCheckupFilters);
            setRoutineCheckups(response.data);
        } catch (error: any) {
            message.error('Failed to fetch routine checkups: ' + error.message);
        } finally {
            setLoadingRoutineCheckups(false);
        }
    };

    const createRoutineCheckup = async (values: any) => {
        try {
            await routineCheckupService.createRoutineCheckup(values);
            message.success('Routine checkup created successfully');
            fetchRoutineCheckups();
            return true;
        } catch (error: any) {
            message.error('Operation failed: ' + error.message);
            return false;
        }
    };

    const updateRoutineCheckup = async (id: number, values: any) => {
        try {
            await routineCheckupService.updateRoutineCheckup(id, values);
            message.success('Routine checkup updated successfully');
            fetchRoutineCheckups();
            return true;
        } catch (error: any) {
            message.error('Operation failed: ' + error.message);
            return false;
        }
    };

    const deleteRoutineCheckup = async (id: number) => {
        try {
            await routineCheckupService.deleteRoutineCheckup(id);
            message.success('Routine checkup deleted successfully');
            fetchRoutineCheckups();
            return true;
        } catch (error: any) {
            message.error('Delete failed: ' + error.message);
            return false;
        }
    };

    useEffect(() => {
        if (!enabled) return;
        fetchRoutineCheckups();
    }, [enabled, routineCheckupFilters]);

    return {
        routineCheckups,
        loadingRoutineCheckups,
        routineCheckupFilters,
        setRoutineCheckupFilters,
        createRoutineCheckup,
        updateRoutineCheckup,
        deleteRoutineCheckup,
        refreshRoutineCheckups: fetchRoutineCheckups
    };
};
