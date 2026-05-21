/**
 * Common API response shapes used across the application.
 * Feature-specific types should still live in their own feature/types/ folders.
 */

/** Standard paginated list response from the backend */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

/** Standard single-resource response */
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

/** Standard error response shape */
export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}

/** Generic select option used in dropdowns */
export interface SelectOption {
    label: string;
    value: string | number;
}

/** Common audit fields present on most entities */
export interface AuditFields {
    createdAt: string;
    updatedAt: string;
}

/** Role strings used across the app */
export type UserRole = 'admin' | 'superadmin' | 'ADMIN' | 'DOCTOR' | 'COLLECTION_AGENT' | 'patient';
