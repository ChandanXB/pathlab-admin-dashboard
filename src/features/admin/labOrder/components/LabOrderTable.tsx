import React from 'react';
import { Tag, Space, Button, Popconfirm, Tooltip, Dropdown, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    DownOutlined,
    BarcodeOutlined,
    ExperimentOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';
import type { LabOrder } from '../types/labOrder.types';
import { ORDER_STATUSES, PRIORITIES } from '@/shared/constants/app.constants';
import dayjs from 'dayjs';

const { Text } = Typography;

interface LabOrderTableProps {
    data: LabOrder[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    onEdit: (record: LabOrder) => void;
    onDelete: (id: number) => void;
    onStatusUpdate: (id: number, status: string) => void;
    onLoadMore: () => void;
    onRowClick: (record: LabOrder) => void;
    scroll?: { x?: number | string; y?: number | string };
}

const LabOrderTable: React.FC<LabOrderTableProps> = ({
    data,
    loading,
    loadingMore,
    hasMore,
    onEdit,
    onDelete,
    onStatusUpdate,
    onLoadMore,
    onRowClick,
    scroll,
}) => {

    const getStatusColor = (status: string) => {
        const found = ORDER_STATUSES.find(s => s.value === status);
        return found ? found.color : 'default';
    };

    const getStatusLabel = (status: string) => {
        const found = ORDER_STATUSES.find(s => s.value === status);
        return found ? found.label : status;
    };

    const getPriorityTag = (priority: string) => {
        const found = PRIORITIES.find(p => p.value === priority);
        return (
            <Tag color={found?.color || 'default'}>
                {found?.label || priority}
            </Tag>
        );
    };

    const getStatusMenu = (record: LabOrder): MenuProps => {
        return {
            items: ORDER_STATUSES.map(status => ({
                key: status.value,
                label: status.label,
                disabled: record.status === status.value,
                onClick: () => onStatusUpdate(record.id, status.value)
            }))
        };
    };

    const columns = [
        {
            title: 'Order Details',
            key: 'order_info',
            width: 220,
            render: (_: any, record: LabOrder) => (
                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Text strong style={{ whiteSpace: 'nowrap' }}>
                        <BarcodeOutlined /> {record.order_code}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                        <ClockCircleOutlined /> {dayjs(record.createdAt).format('DD MMM, hh:mm A')}
                    </Text>
                    {getPriorityTag(record.priority)}
                </Space>
            )
        },
        {
            title: 'Patient',
            key: 'patient',
            render: (_: any, record: LabOrder) => (
                <Space direction="vertical" size={0}>
                    <Text strong><UserOutlined /> {record.patient?.full_name || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.patient?.patient_code}</Text>
                </Space>
            )
        },
        {
            title: 'Tests',
            key: 'tests',
            render: (_: any, record: LabOrder) => (
                <div style={{ maxWidth: '250px' }}>
                    {record.test_results?.map((tr, idx) => (
                        <Tag key={idx} icon={<ExperimentOutlined />} style={{ marginBottom: '4px' }}>
                            {tr.test?.test_name}
                        </Tag>
                    ))}
                    {(!record.test_results || record.test_results.length === 0) && '-'}
                </div>
            )
        },
        {
            title: 'Agent',
            key: 'agent',
            width: 150,
            render: (_: any, record: LabOrder) => (
                record.collection_agent ? (
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: '12px' }}>{record.collection_agent.name}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{record.collection_agent.phone}</Text>
                    </Space>
                ) : (
                    <Tag color="default">UNASSIGNED</Tag>
                )
            )
        },
        {
            title: 'Amount',
            key: 'amount',
            width: 120,
            render: (_: any, record: LabOrder) => (
                <Space direction="vertical" size={0}>
                    <Text>₹{record.total_amount}</Text>
                    <Tag color={record.payment_status === 'paid' ? 'success' : 'warning'}>
                        {record.payment_status.toUpperCase()}
                    </Tag>
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status: string, record: LabOrder) => (
                <Dropdown menu={getStatusMenu(record)} trigger={['click']}>
                    <Tag
                        color={getStatusColor(status)}
                        style={{ cursor: 'pointer', borderRadius: '12px', padding: '0 10px' }}
                    >
                        {getStatusLabel(status)} <DownOutlined style={{ fontSize: '10px' }} />
                    </Tag>
                </Dropdown>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            fixed: 'right' as const,
            render: (_: any, record: LabOrder) => (
                <Space size="small">
                    <Tooltip title="Edit Order">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Order"
                        description="Are you sure you want to delete this order?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <InfiniteScrollTable
            columns={columns}
            dataSource={data}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            next={onLoadMore}
            scroll={scroll}
            rowKey="id"
            onRow={(record) => ({
                onClick: (e: any) => {
                    // Prevent drawer opening if user clicks on dropdown, buttons or icons
                    if (e.target.closest('.ant-dropdown-trigger') || e.target.closest('button') || e.target.closest('.anticon')) {
                        return;
                    }
                    onRowClick(record);
                },
                style: { cursor: 'pointer' }
            })}
        />
    );
};

export default LabOrderTable;
