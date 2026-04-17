export interface RoutineCheckup {
    id: number;
    parent_id?: number | null;
    title: string;
    sub_title?: string;
    description: string;
    price?: number;
    mrp?: number;
    category_ids?: number[];
    test_ids?: number[];
    tags: string[];
    gender: 'male' | 'female' | 'general';
    age_group?: string;
    status: string;
    image_url?: string;
    createdAt: string;
    updatedAt: string;
    categories?: Array<{
        id: number;
        category_name: string;
    }>;
    tests?: Array<{
        id: number;
        test_name: string;
        test_code: string;
    }>;
    children?: RoutineCheckup[];
}

export interface RoutineCheckupCreateDTO {
    parent_id?: number | null;
    title: string;
    sub_title?: string;
    description: string;
    price?: number;
    mrp?: number;
    category_ids?: number[];
    test_ids?: number[];
    tags: string[];
    gender: 'male' | 'female' | 'general';
    age_group?: string;
    status?: string;
    image_url?: string;
}

export interface RoutineCheckupUpdateDTO extends Partial<RoutineCheckupCreateDTO> { }

export interface RoutineCheckupFilters {
    status?: string;
    gender?: string;
    age_group?: string;
    categoryId?: number;
    search?: string;
    parentId?: number | 'null';
    page?: number;
    limit?: number;
}

