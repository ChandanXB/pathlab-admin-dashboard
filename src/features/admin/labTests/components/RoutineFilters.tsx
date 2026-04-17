import React from 'react';
import { Card, Row, Col, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { RoutineCheckupFilters } from '../types/routineCheckup.types';

const { Option } = Select;

interface RoutineFiltersProps {
    filters: RoutineCheckupFilters;
    onFilterChange: (filters: Partial<RoutineCheckupFilters>) => void;
    onSearch: (value: string) => void;
}

const RoutineFilters: React.FC<RoutineFiltersProps> = ({
    filters,
    onFilterChange,
    onSearch
}) => {
    return (
        <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                        placeholder="Search packages..."
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
                        onChange={(value) => onFilterChange({ status: value })}
                    >
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Select
                        placeholder="Gender"
                        allowClear
                        style={{ width: '100%' }}
                        value={filters.gender}
                        onChange={(value) => onFilterChange({ gender: value })}
                    >
                        <Option value="male">Male</Option>
                        <Option value="female">Female</Option>
                        <Option value="general">General</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Select
                        placeholder="Age Group"
                        allowClear
                        style={{ width: '100%' }}
                        value={filters.age_group}
                        onChange={(value) => onFilterChange({ age_group: value })}
                    >
                        <Option value="all">All Ages</Option>
                        <Option value="kids">Kids (0-12)</Option>
                        <Option value="teens">Teens (13-19)</Option>
                        <Option value="adults">Adults (20-60)</Option>
                        <Option value="seniors">Seniors (60+)</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Select
                        placeholder="Package Level"
                        allowClear
                        style={{ width: '100%' }}
                        value={filters.parentId}
                        onChange={(value) => onFilterChange({ parentId: value })}
                    >
                        <Option value="null">Main Packages Only</Option>
                        <Option value={undefined}>All Levels</Option>
                    </Select>
                </Col>
            </Row>
        </Card>
    );
};

export default RoutineFilters;
