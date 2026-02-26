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
    ClockCircleOutlined,
    UserAddOutlined,
    UserSwitchOutlined,
    FileImageOutlined
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
    onAssign: (record: LabOrder) => void;
    onLoadMore: () => void;
    onRowClick: (record: LabOrder) => void;
    visibleColumns?: string[];
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
    onAssign,
    onLoadMore,
    onRowClick,
    visibleColumns = ['order_info', 'patient', 'tests', 'agent', 'amount', 'proof', 'status', 'actions'],
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
            width: 170,
            render: (_: any, record: LabOrder) => (
                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Text strong style={{ whiteSpace: 'nowrap' }} ellipsis={{ tooltip: record.order_code }}>
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
            width: 160,
            render: (_: any, record: LabOrder) => (
                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Text strong ellipsis={{ tooltip: record.patient?.full_name }}>
                        <UserOutlined /> {record.patient?.full_name || 'N/A'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.patient?.patient_code}</Text>
                </Space>
            )
        },
        {
            title: 'Tests',
            key: 'tests',
            width: 160,
            render: (_: any, record: LabOrder) => (
                <div style={{ maxWidth: '160px' }}>
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
            width: 120,
            render: (_: any, record: LabOrder) => (
                record.collection_agent ? (
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: '12px' }} ellipsis={{ tooltip: record.collection_agent.name }}>
                            {record.collection_agent.name}
                        </Text>
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
            width: 100,
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
            title: 'Proof',
            key: 'proof',
            width: 80,
            render: (_: any, record: LabOrder) => (
                <Space>
                    {record.sample_photo_url && (
                        <Tooltip title="Sample Photo Uploaded">
                            <FileImageOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                        </Tooltip>
                    )}
                    {record.payment_proof_url && (
                        <Tooltip title="Payment Proof Uploaded">
                            <ExperimentOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                        </Tooltip>
                    )}
                    {!record.sample_photo_url && !record.payment_proof_url && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>-</Text>
                    )}
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string, record: LabOrder) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown menu={getStatusMenu(record)} trigger={['click']}>
                        <Tag
                            color={getStatusColor(status)}
                            style={{ cursor: 'pointer', borderRadius: '12px', padding: '0 10px' }}
                        >
                            {getStatusLabel(status)} <DownOutlined style={{ fontSize: '10px' }} />
                        </Tag>
                    </Dropdown>
                </div>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_: any, record: LabOrder) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Space size="middle">
                        <Tooltip
                            title={
                                record.status === 'assigned'
                                    ? (record.collection_agent ? "Reassign Agent" : "Assign Agent")
                                    : `Cannot assign agent in ${record.status} status`
                            }
                        >
                            <Button
                                type="text"
                                icon={record.collection_agent ? <UserSwitchOutlined style={{ color: record.status === 'assigned' ? '#52c41a' : '#bfbfbf' }} /> : <UserAddOutlined style={{ color: record.status === 'assigned' ? '#faad14' : '#bfbfbf' }} />}
                                onClick={() => onAssign(record)}
                                disabled={record.status !== 'assigned'}
                            />
                        </Tooltip>
                        <Tooltip title="Edit Order">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => onEdit(record)}
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
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                </div>
            ),
        },
    ];

    // Filter columns based on visibility
    const filteredColumns = columns.filter(col => visibleColumns.includes(col.key || ''));


    return (
        <InfiniteScrollTable
            columns={filteredColumns}
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
