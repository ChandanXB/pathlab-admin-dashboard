import type { Patient } from './patient.types';
import type { LabTest } from './labTest.types';

export interface LabOrder {
    id: number;
    order_code: string;
    patient_id: number;
    appointment_id?: number;
    status: 'pending' | 'collected' | 'processing' | 'completed' | 'cancelled';
    priority: 'normal' | 'urgent' | 'stat';
    total_amount: string | number;
    paid_amount: string | number;
    payment_status: 'unpaid' | 'partial' | 'paid';
    address?: string;
    notes?: string;
    collection_agent_id?: number;
    collection_agent?: {
        id: number;
        name: string;
        phone: string;
    };
    createdAt: string;
    updatedAt: string;
    patient?: Partial<Patient>;
    test_results?: {
        id: number;
        test_id: number;
        status: string;
        result_value?: string;
        test: Partial<LabTest> & {
            category?: {
                category_name: string;
            };
        };
    }[];
    appointment?: {
        appointment_date: string;
        appointment_time: string;
    };
}

export interface LabOrderQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    status?: string;
    patient_id?: number;
    date_from?: string;
    date_to?: string;
}

export interface LabOrderFormData {
    patient_id: number;
    appointment_id?: number;
    test_ids: number[];
    priority: string;
    status?: string;
    total_amount: number;
    paid_amount?: number;
    payment_status?: string;
    notes?: string;
}

export interface LabOrderResponse {
    success: boolean;
    data: LabOrder[];
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


