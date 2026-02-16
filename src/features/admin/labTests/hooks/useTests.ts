import { useState, useEffect } from 'react';
import { message } from 'antd';
import { labTestService } from '../services/labTestService';
import type { TestQueryParams } from '../types/labTest.types';

export const useTests = (enabled: boolean = true) => {
    const [tests, setTests] = useState<any[]>([]);
    const [loadingTests, setLoadingTests] = useState(false);
    const [loadingMoreTests, setLoadingMoreTests] = useState(false);
    const [testPagination, setTestPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
        hasMore: true,
    });
    const [testFilters, setTestFilters] = useState<TestQueryParams>({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: '',
        status: undefined,
        categoryId: undefined,
        fastingRequired: undefined,
        minPrice: undefined,
        maxPrice: undefined,
    });

    const fetchTests = async (resetData = false) => {
        if (resetData) {
            setLoadingTests(true);
            setTests([]);
        } else {
            setLoadingMoreTests(true);
        }

        try {
            const response = await labTestService.getTests(testFilters);

            if (resetData || testFilters.page === 1) {
                setTests(response.data);
            } else {
                setTests(prev => [...prev, ...response.data]);
            }

            const pagination = response.meta || response.pagination;
            if (pagination) {
                setTestPagination({
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.total,
                    hasMore: pagination.page < pagination.totalPages,
                });
            }
        } catch (error: any) {
            message.error('Failed to fetch tests: ' + error.message);
        } finally {
            setLoadingTests(false);
            setLoadingMoreTests(false);
        }
    };

    const createTest = async (values: any) => {
        try {
            await labTestService.createTest(values);
            message.success('Test created successfully');
            setTestFilters(prev => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            message.error('Operation failed: ' + error.message);
            return false;
        }
    };

    const updateTest = async (id: number, values: any) => {
        try {
            await labTestService.updateTest(id, values);
            message.success('Test updated successfully');
            setTestFilters(prev => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            message.error('Operation failed: ' + error.message);
            return false;
        }
    };

    const deleteTest = async (id: number) => {
        try {
            await labTestService.deleteTest(id);
            message.success('Test deleted successfully');
            setTestFilters(prev => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            message.error('Delete failed: ' + error.message);
            return false;
        }
    };

    const resetFilters = () => {
        setTestFilters({
            page: 1,
            limit: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            search: '',
            status: undefined,
            categoryId: undefined,
            fastingRequired: undefined,
            minPrice: undefined,
            maxPrice: undefined,
        });
    };

    useEffect(() => {
        if (!enabled) return;
        const shouldReset = testFilters.page === 1;
        fetchTests(shouldReset);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testFilters]); // enabled is intentionally omitted to prevent auto-fetch on tab switch

    return {
        tests,
        loadingTests,
        loadingMoreTests,
        testPagination,
        testFilters,
        setTestFilters,
        createTest,
        updateTest,
        deleteTest,
        resetFilters
    };
};
