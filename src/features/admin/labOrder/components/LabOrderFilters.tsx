import React from 'react';
import { Card, Row, Col, Input, Select, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { LabOrderQueryParams } from '../types/labOrder.types';
import { ORDER_STATUSES, PRIORITIES, SORT_OPTIONS } from '@/shared/constants/labOrder.constants';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface LabOrderFiltersProps {
    filters: LabOrderQueryParams;
    onFilterChange: (filters: Partial<LabOrderQueryParams>) => void;
    onSearch: (value: string) => void;
}

const LabOrderFilters: React.FC<LabOrderFiltersProps> = ({
    filters,
    onFilterChange,
    onSearch,
}) => {
    return (
        <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                        placeholder="Search order code, patient..."
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
                        {ORDER_STATUSES.map((status) => (
                            <Option key={status.value} value={status.value}>
                                {status.label}
                            </Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <RangePicker
                        style={{ width: '100%' }}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                onFilterChange({
                                    date_from: dates[0].format('YYYY-MM-DD'),
                                    date_to: dates[1].format('YYYY-MM-DD'),
                                    page: 1,
                                });
                            } else {
                                onFilterChange({
                                    date_from: undefined,
                                    date_to: undefined,
                                    page: 1,
                                });
                            }
                        }}
                    />
                </Col>

                <Col xs={24} sm={12} md={12} lg={4}>
                    <Select
                        placeholder="Priority"
                        allowClear
                        style={{ width: '100%' }}
                        onChange={(value) => onFilterChange({ sortBy: value === 'urgent' ? 'priority' : 'createdAt', page: 1 })}
                    >
                        {PRIORITIES.map(p => (
                            <Option key={p.value} value={p.value}>{p.label}</Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={12} lg={4}>
                    <Select
                        placeholder="Sort By"
                        style={{ width: '100%' }}
                        value={filters.sortBy && filters.sortOrder ? `${filters.sortBy}-${filters.sortOrder}` : 'createdAt-desc'}
                        onChange={(value) => {
                            const [sortBy, sortOrder] = value.split('-');
                            onFilterChange({
                                sortBy: sortBy as any,
                                sortOrder: sortOrder as any,
                                page: 1,
                            });
                        }}
                    >
                        {SORT_OPTIONS.map(opt => (
                            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                        ))}
                    </Select>
                </Col>
            </Row>
        </Card>
    );
};

export default LabOrderFilters;
