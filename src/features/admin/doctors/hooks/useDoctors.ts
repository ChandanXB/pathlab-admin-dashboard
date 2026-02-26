import { useState, useEffect } from 'react';
import { message } from 'antd';
import { doctorService } from '../services/doctorService';
import type { DoctorQueryParams, Doctor } from '../types/doctor.types';

export const useDoctors = (enabled: boolean = true) => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [loadingMoreDoctors, setLoadingMoreDoctors] = useState(false);
    const [doctorPagination, setDoctorPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
        hasMore: true,
    });
    const [doctorFilters, setDoctorFilters] = useState<DoctorQueryParams>({
        page: 1,
        limit: 20,
        search: '',
    });

    const fetchDoctors = async (resetData = false) => {
        if (resetData) {
            setLoadingDoctors(true);
            setDoctors([]);
        } else {
            setLoadingMoreDoctors(true);
        }

        try {
            const response = await doctorService.getDoctors(doctorFilters);

            // API returns response.data and response.meta or response.pagination
            const data = Array.isArray(response) ? response : response.data || [];

            if (resetData || doctorFilters.page === 1) {
                setDoctors(data);
            } else {
                setDoctors((prev) => [...prev, ...data]);
            }

            const pagination = response.meta || response.pagination;
            if (pagination) {
                setDoctorPagination({
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.total,
                    hasMore: pagination.page < pagination.totalPages,
                });
            } else {
                // Fallback if no pagination meta
                setDoctorPagination(prev => ({ ...prev, hasMore: false }));
            }
        } catch (error: any) {
            // Error handled by interceptor
            message.error('Failed to fetch doctors');
        } finally {
            setLoadingDoctors(false);
            setLoadingMoreDoctors(false);
        }
    };

    const createDoctor = async (values: any) => {
        try {
            await doctorService.createDoctor(values);
            message.success('Doctor onboarded successfully');
            setDoctorFilters((prev) => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            return false;
        }
    };

    const updateDoctor = async (id: number, values: any) => {
        try {
            await doctorService.updateDoctor(id, values);
            message.success('Doctor updated successfully');
            setDoctorFilters((prev) => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            return false;
        }
    };

    const deleteDoctor = async (id: number) => {
        try {
            await doctorService.deleteDoctor(id);
            message.success('Doctor removed successfully');
            setDoctorFilters((prev) => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            return false;
        }
    };

    const loadMore = () => {
        if (doctorPagination.hasMore && !loadingMoreDoctors) {
            setDoctorFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
        }
    };

    useEffect(() => {
        if (!enabled) return;
        const shouldReset = doctorFilters.page === 1;
        fetchDoctors(shouldReset);
    }, [doctorFilters]);

    return {
        doctors,
        loadingDoctors,
        loadingMoreDoctors,
        doctorPagination,
        doctorFilters,
        setDoctorFilters,
        createDoctor,
        updateDoctor,
        deleteDoctor,
        loadMore,
    };
};
