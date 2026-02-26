import { useState, useEffect } from 'react';
import { message } from 'antd';
import { patientService } from '../services/patientService';
import type { PatientQueryParams, PatientFormData, Patient } from '../types/patient.types';

export const usePatients = (enabled: boolean = true) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingMorePatients, setLoadingMorePatients] = useState(false);
    const [patientPagination, setPatientPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
        hasMore: true,
    });
    const [patientFilters, setPatientFilters] = useState<PatientQueryParams>({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: '',
        gender: undefined,
    });

    const fetchPatients = async (resetData = false) => {
        if (resetData) {
            setLoadingPatients(true);
            setPatients([]);
        } else {
            setLoadingMorePatients(true);
        }

        try {
            const response = await patientService.getPatients(patientFilters);

            if (resetData || patientFilters.page === 1) {
                setPatients(response.data);
            } else {
                setPatients((prev) => [...prev, ...response.data]);
            }

            const pagination = response.meta || response.pagination;
            if (pagination) {
                setPatientPagination({
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.total,
                    hasMore: pagination.page < pagination.totalPages,
                });
            }
        } catch (error: any) {
            // Error handled by interceptor
        } finally {
            setLoadingPatients(false);
            setLoadingMorePatients(false);
        }
    };

    const createPatient = async (values: PatientFormData) => {
        try {
            await patientService.createPatient(values);
            message.success('Patient created successfully');
            setPatientFilters((prev) => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            // Error handled by interceptor
            return false;
        }
    };

    const updatePatient = async (id: number, values: Partial<PatientFormData>) => {
        try {
            await patientService.updatePatient(id, values);
            message.success('Patient updated successfully');
            setPatientFilters((prev) => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            // Error handled by interceptor
            return false;
        }
    };

    const deletePatient = async (id: number) => {
        try {
            await patientService.deletePatient(id);
            message.success('Patient deleted successfully');
            setPatientFilters((prev) => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            // Error handled by interceptor
            return false;
        }
    };

    const resetFilters = () => {
        setPatientFilters({
            page: 1,
            limit: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            search: '',
            gender: undefined,
        });
    };

    const loadMore = () => {
        if (patientPagination.hasMore && !loadingMorePatients) {
            setPatientFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
        }
    };

    useEffect(() => {
        if (!enabled) return;
        const shouldReset = patientFilters.page === 1;
        fetchPatients(shouldReset);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientFilters]); // enabled is intentionally omitted to prevent auto-fetch on tab switch

    return {
        patients,
        loadingPatients,
        loadingMorePatients,
        patientPagination,
        patientFilters,
        setPatientFilters,
        createPatient,
        updatePatient,
        deletePatient,
        resetFilters,
        loadMore,
    };
};
