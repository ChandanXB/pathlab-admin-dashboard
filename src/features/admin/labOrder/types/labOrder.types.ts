import type { Patient } from '../../patients/types/patient.types';
import type { LabTest } from '../../labTests/types/labTest.types';

export interface LabOrder {
    id: number;
    order_code: string;
    patient_id: number;
    appointment_id?: number;
    status: 'pending' | 'assigned' | 'collected' | 'processing' | 'completed' | 'cancelled';
    priority: 'normal' | 'urgent' | 'stat';
    total_amount: string | number;
    paid_amount: string | number;
    payment_status: 'unpaid' | 'partial' | 'paid';
    order_source?: string;
    order_type?: string;
    scheduled_date?: string;
    scheduled_time?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    assignment_status?: string;
    collection_agent_id?: number;
    collection_agent?: {
        id: number;
        name: string;
        phone: string;
    };
    sample_photo_url?: string;
    signature_url?: string; // Legacy
    payment_mode?: string;
    payment_proof_url?: string;
    report_notes?: string;
    collected_at?: string;
    createdAt: string;
    updatedAt: string;
    patient?: Partial<Patient> & {
        email?: string;
        alternate_phone?: string;
    };
    test_results?: {
        id: number;
        test_id: number;
        status: string;
        result_value?: string;
        clinical_status?: string;
        test: Partial<LabTest> & {
            category?: {
                category_name: string;
            };
        };
    }[];
    report_urls?: string[];
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
    address?: string;
    order_source?: string;
    order_type?: string;
    scheduled_date?: any; // Allow Date or string from AntD
    scheduled_time?: string;
    email?: string;
    alternate_phone?: string;
    latitude?: number;
    longitude?: number;
    payment_mode?: string;
    payment_proof?: string;
    sample_photo?: string;
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


