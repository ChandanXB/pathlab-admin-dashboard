export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    phone: string;
    email: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface DoctorQueryParams {
    search?: string;
    specialty?: string;
    status?: string;
    page?: number;
    limit?: number;
}
