export interface LabTestCategory {
    id: number;
    category_name: string;
    description?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface LabTest {
    id: number;
    test_code: string;
    test_name: string;
    category_id: number;
    sample_type: string;
    unit?: string;
    normal_range?: string;
    price: string | number;
    report_type: 'numeric' | 'text';
    fasting_required: boolean;
    description?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    category?: LabTestCategory;
}

// Query parameter types for Lab Test APIs

export interface TestQueryParams {
    page?: number;
    limit?: number;
    sortBy?: 'test_name' | 'test_code' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    search?: string;
    status?: 'active' | 'inactive';
    categoryId?: number;
    fastingRequired?: boolean;
    minPrice?: number;
    maxPrice?: number;
}

export interface CategoryQueryParams {
    page?: number;
    limit?: number;
    sortBy?: 'category_name' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
