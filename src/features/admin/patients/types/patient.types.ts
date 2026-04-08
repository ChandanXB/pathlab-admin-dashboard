export interface Patient {
    id: number;
    patient_code: string;
    full_name: string;
    gender: string;
    dob: string;
    blood_group_id?: number;
    address?: string;
    phone?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    user_id?: number;
    createdAt: string;
    updatedAt: string;
    added_by_id?: number;
    relation?: string;
    children?: Patient[];
    user?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
    added_by?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
    growth_records?: any[];
    immunizations?: any[];
}

export interface PatientQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    gender?: string;
}

export interface PatientFormData {
    full_name: string;
    gender: string;
    dob: string;
    phone?: string;
    address?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    blood_group_id?: number;
}

export interface PatientResponse {
    success: boolean;
    data: Patient[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const GENDER_OPTIONS = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
] as const;
