import React from 'react';
import { Space, Button, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';
import type { CollectionAgent } from '../services/collectionAgentService';

interface AgentTableProps {
    agents: CollectionAgent[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    onEdit: (agent: CollectionAgent) => void;
    onDelete: (id: number) => void;
    onRowClick: (agent: CollectionAgent) => void;
    onLoadMore: () => void;
    scroll?: { x?: number | string; y?: number | string };
}

const AgentTable: React.FC<AgentTableProps> = ({
    agents,
    loading,
    loadingMore,
    hasMore,
    onEdit,
    onDelete,
    onRowClick,
    onLoadMore,
    scroll
}) => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '15%',
            ellipsis: true,
            render: (text: string) => (
                <Space>
                    <UserOutlined />
                    <span style={{ fontWeight: 600 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            width: '14%',
            ellipsis: true,
        },
        {
            title: 'Vehicle',
            key: 'vehicle',
            width: '16%',
            ellipsis: true,
            render: (_: any, record: CollectionAgent) => (
                <span>{record.vehicle_type} {record.vehicle_no ? `(${record.vehicle_no})` : ''}</span>
            ),
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
        },
        {
            title: 'Availability',
            key: 'availability',
            width: '13%',
            render: (_: any, record: CollectionAgent) => {
                const activeOrders = record._count?.lab_orders || 0;
                return (
                    <Tag color={activeOrders > 0 ? 'warning' : 'success'}>
                        {activeOrders > 0 ? `Occupied (${activeOrders})` : 'FREE'}
                    </Tag>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '10%',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_: any, record: CollectionAgent) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                    />
                    <Popconfirm
                        title="Delete this agent?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <InfiniteScrollTable
            columns={columns}
            dataSource={agents}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            next={onLoadMore}
            rowKey="id"
            scroll={scroll}
            onRow={(record) => ({
                onClick: (e: any) => {
                    if (e.target.closest('button') || e.target.closest('.anticon')) {
                        return;
                    }
                    onRowClick(record);
                },
                style: { cursor: 'pointer' }
            })}
        />
    );
};

export default AgentTable;
