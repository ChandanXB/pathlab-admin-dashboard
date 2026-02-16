import React from 'react';
import { Card, Row, Col, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { PatientQueryParams } from '../types/patient.types';
import { GENDER_OPTIONS } from '../types/patient.types';

const { Option } = Select;

interface PatientFiltersProps {
    filters: PatientQueryParams;
    onFilterChange: (filters: Partial<PatientQueryParams>) => void;
    onSearch: (value: string) => void;
}

const PatientFilters: React.FC<PatientFiltersProps> = ({
    filters,
    onFilterChange,
    onSearch,
}) => {
    return (
        <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={10} lg={8}>
                    <Input
                        placeholder="Search by name, phone, or patient code..."
                        prefix={<SearchOutlined />}
                        allowClear
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </Col>
                <Col xs={24} sm={12} md={7} lg={5}>
                    <Select
                        placeholder="Gender"
                        allowClear
                        style={{ width: '100%' }}
                        value={filters.gender}
                        onChange={(value) => onFilterChange({ gender: value, page: 1 })}
                    >
                        {GENDER_OPTIONS.map((option) => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={7} lg={6}>
                    <Select
                        placeholder="Sort By"
                        style={{ width: '100%' }}
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(value) => {
                            const [sortBy, sortOrder] = value.split('-');
                            onFilterChange({
                                sortBy: sortBy as any,
                                sortOrder: sortOrder as any,
                                page: 1,
                            });
                        }}
                    >
                        <Option value="full_name-asc">Name (A-Z)</Option>
                        <Option value="full_name-desc">Name (Z-A)</Option>
                        <Option value="patient_code-asc">Code (A-Z)</Option>
                        <Option value="patient_code-desc">Code (Z-A)</Option>
                        <Option value="createdAt-desc">Newest First</Option>
                        <Option value="createdAt-asc">Oldest First</Option>
                    </Select>
                </Col>
            </Row>
        </Card>
    );
};

export default PatientFilters;
