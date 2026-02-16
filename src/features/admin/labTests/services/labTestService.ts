import apiClient from '@/config/apiClient';
import type {
    TestQueryParams,
    CategoryQueryParams,
    PaginatedResponse,
} from '../types/labTest.types';

// Re-export types for convenience
export type { TestQueryParams, CategoryQueryParams, PaginatedResponse };

export const labTestService = {
    // ==================== Categories ====================

    /**
     * Get all categories with pagination and filters
     */
    getCategories: async (params?: CategoryQueryParams): Promise<PaginatedResponse<any>> => {
        const response = await apiClient.get('/lab-test-categories', { params });
        return response.data;
    },

    /**
     * Create a new category
     */
    createCategory: async (categoryData: any) => {
        const response = await apiClient.post('/lab-test-categories', categoryData);
        return response.data.data;
    },

    /**
     * Update an existing category
     */
    updateCategory: async (id: number, categoryData: any) => {
        const response = await apiClient.put(`/lab-test-categories/${id}`, categoryData);
        return response.data.data;
    },

    /**
     * Delete a category
     */
    deleteCategory: async (id: number) => {
        const response = await apiClient.delete(`/lab-test-categories/${id}`);
        return response.data;
    },

    // ==================== Tests ====================

    /**
     * Get all tests with pagination and filters
     */
    getTests: async (params?: TestQueryParams): Promise<PaginatedResponse<any>> => {
        const response = await apiClient.get('/lab-tests', { params });
        return response.data;
    },

    /**
     * Create a new test
     */
    createTest: async (testData: any) => {
        const response = await apiClient.post('/lab-tests', testData);
        return response.data.data;
    },

    /**
     * Update an existing test
     */
    updateTest: async (id: number, testData: any) => {
        const response = await apiClient.put(`/lab-tests/${id}`, testData);
        return response.data.data;
    },

    /**
     * Delete a test
     */
    deleteTest: async (id: number) => {
        const response = await apiClient.delete(`/lab-tests/${id}`);
        return response.data;
    },
};
