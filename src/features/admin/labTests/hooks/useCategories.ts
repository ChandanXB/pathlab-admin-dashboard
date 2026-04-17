import { useState, useEffect } from 'react';
import { message } from 'antd';
import { labTestService } from '../services/labTestService';
import type { CategoryQueryParams } from '../types/labTest.types';

export const useCategories = (fetchListEnabled: boolean = true) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingMoreCategories, setLoadingMoreCategories] = useState(false);
    const [categoryPagination, setCategoryPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
        hasMore: true,
    });
    const [categoryFilters, setCategoryFilters] = useState<CategoryQueryParams>({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: '',
    });

    const fetchAllCategories = async () => {
        try {
            const response = await labTestService.getCategories({ limit: 1000 });
            setAllCategories(response.data);
        } catch (error: any) {
            console.error('Failed to fetch all categories:', error);
        }
    };

    const fetchCategories = async (resetData = false) => {
        if (resetData) {
            setLoadingCategories(true);
            setCategories([]);
        } else {
            setLoadingMoreCategories(true);
        }

        try {
            const response = await labTestService.getCategories(categoryFilters);

            if (resetData || categoryFilters.page === 1) {
                setCategories(response.data);
            } else {
                setCategories(prev => [...prev, ...response.data]);
            }

            const pagination = response.meta || response.pagination;
            if (pagination) {
                setCategoryPagination({
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.total,
                    hasMore: pagination.page < pagination.totalPages,
                });
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            message.error('Failed to fetch categories: ' + errorMsg);
        } finally {
            setLoadingCategories(false);
            setLoadingMoreCategories(false);
        }
    };

    const createCategory = async (values: any) => {
        try {
            await labTestService.createCategory(values);
            message.success('Category created successfully');
            setCategoryFilters(prev => ({ ...prev, page: 1 }));
            await fetchAllCategories();
            return true;
        } catch (error: any) {
            message.error('Operation failed: ' + error.message);
            return false;
        }
    };

    const updateCategory = async (id: number, values: any) => {
        try {
            await labTestService.updateCategory(id, values);
            message.success('Category updated successfully');
            setCategoryFilters(prev => ({ ...prev, page: 1 }));
            await fetchAllCategories();
            return true;
        } catch (error: any) {
            message.error('Operation failed: ' + error.message);
            return false;
        }
    };

    const deleteCategory = async (id: number) => {
        try {
            await labTestService.deleteCategory(id);
            message.success('Category deleted successfully');
            setCategoryFilters(prev => ({ ...prev, page: 1 }));
            await fetchAllCategories();
            return true;
        } catch (error: any) {
            message.error('Delete failed: ' + error.message);
            return false;
        }
    };

    const resetFilters = () => {
        setCategoryFilters({
            page: 1,
            limit: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            search: '',
        });
    };

    useEffect(() => {
        if (!fetchListEnabled) return;
        const shouldReset = categoryFilters.page === 1;
        fetchCategories(shouldReset);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryFilters, fetchListEnabled]);

    const searchAllCategories = async (query: string) => {
        try {
            const response = await labTestService.getCategories({ search: query, limit: 50 });
            setAllCategories(response.data);
        } catch (error: any) {
            console.error('Failed to search categories:', error);
        }
    };

    useEffect(() => {
        fetchAllCategories();
    }, []);

    return {
        categories,
        allCategories,
        loadingCategories,
        loadingMoreCategories,
        categoryPagination,
        categoryFilters,
        setCategoryFilters,
        createCategory,
        updateCategory,
        deleteCategory,
        resetFilters,
        searchAllCategories
    };
};
