export interface RoutineCheckup {
    id: number;
    title: string;
    description: string;
    category_id: number;
    tags: string[];
    gender: 'male' | 'female' | 'general';
    status: string;
    createdAt: string;
    updatedAt: string;
    category: {
        id: number;
        category_name: string;
    };
}

export interface RoutineCheckupCreateDTO {
    title: string;
    description: string;
    category_id: number;
    tags: string[];
    gender: 'male' | 'female' | 'general';
    status?: string;
}

export interface RoutineCheckupUpdateDTO extends Partial<RoutineCheckupCreateDTO> { }

export interface RoutineCheckupFilters {
    status?: string;
    gender?: string;
    categoryId?: number;
    search?: string;
    page?: number;
    limit?: number;
}
