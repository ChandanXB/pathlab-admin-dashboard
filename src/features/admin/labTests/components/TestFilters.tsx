import React from 'react';
import { Card, Row, Col, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TestQueryParams } from '../types/labTest.types';

const { Option } = Select;

interface TestFiltersProps {
    filters: TestQueryParams;
    onFilterChange: (filters: Partial<TestQueryParams>) => void;
    onSearch: (value: string) => void;
    categories: any[];
}

const TestFilters: React.FC<TestFiltersProps> = ({
    filters,
    onFilterChange,
    onSearch,
    categories
}) => {
    return (
        <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                        placeholder="Search tests..."
                        prefix={<SearchOutlined />}
                        allowClear
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Select
                        placeholder="Status"
                        allowClear
                        style={{ width: '100%' }}
                        value={filters.status}
                        onChange={(value) => onFilterChange({ status: value, page: 1 })}
                    >
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Select
                        placeholder="Category"
                        allowClear
                        showSearch
                        style={{ width: '100%' }}
                        value={filters.categoryId}
                        onChange={(value) => onFilterChange({ categoryId: value, page: 1 })}
                        filterOption={(input, option) => {
                            if (!option || !option.children) return false;
                            const childText = String(option.children);
                            return childText.toLowerCase().includes(input.toLowerCase());
                        }}
                    >
                        {categories.map((cat: any) => (
                            <Option key={cat.id} value={cat.id}>{cat.category_name}</Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Select
                        placeholder="Fasting"
                        allowClear
                        style={{ width: '100%' }}
                        value={filters.fastingRequired}
                        onChange={(value) => onFilterChange({ fastingRequired: value, page: 1 })}
                    >
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
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
                        <Option value="test_name-asc">Name (A-Z)</Option>
                        <Option value="test_name-desc">Name (Z-A)</Option>
                        <Option value="price-asc">Price (Low-High)</Option>
                        <Option value="price-desc">Price (High-Low)</Option>
                        <Option value="createdAt-desc">Newest First</Option>
                        <Option value="createdAt-asc">Oldest First</Option>
                    </Select>
                </Col>
            </Row>

        </Card>
    );
};

export default TestFilters;
