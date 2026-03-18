export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    phone: string;
    email: string;
    bio?: string;
    address?: string;
    experience_years?: number;
    status: 'active' | 'inactive';
    createdAt?: string;
    updatedAt?: string;
    user?: {
        createdAt?: string;
        id?: number;
    };
}

export interface DoctorQueryParams {
    search?: string;
    specialty?: string;
    status?: string;
    page?: number;
    limit?: number;
}
