import React from 'react';
import { Card, Row, Col, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { CategoryQueryParams } from '../types/labTest.types';

const { Option } = Select;

interface CategoryFiltersProps {
    filters: CategoryQueryParams;
    onFilterChange: (filters: Partial<CategoryQueryParams>) => void;
    onSearch: (value: string) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
    filters,
    onFilterChange,
    onSearch
}) => {
    return (
        <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Input
                        placeholder="Search categories..."
                        prefix={<SearchOutlined />}
                        allowClear
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Select
                        placeholder="Sort By"
                        style={{ width: '100%' }}
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(value) => {
                            const [sortBy, sortOrder] = value.split('-');
                            onFilterChange({
                                sortBy: sortBy as any,
                                sortOrder: sortOrder as any,
                                page: 1
                            });
                        }}
                    >
                        <Option value="category_name-asc">Name (A-Z)</Option>
                        <Option value="category_name-desc">Name (Z-A)</Option>
                        <Option value="createdAt-desc">Newest First</Option>
                        <Option value="createdAt-asc">Oldest First</Option>
                    </Select>
                </Col>
            </Row>
        </Card>
    );
};

export default CategoryFilters;
