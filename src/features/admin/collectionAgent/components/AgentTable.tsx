import React from 'react';
import { Table, Space, Button, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { CollectionAgent } from '../services/collectionAgentService';

interface AgentTableProps {
    agents: CollectionAgent[];
    loading: boolean;
    onEdit: (agent: CollectionAgent) => void;
    onDelete: (id: number) => void;
}

const AgentTable: React.FC<AgentTableProps> = ({ agents, loading, onEdit, onDelete }) => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
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
        },
        {
            title: 'Vehicle',
            key: 'vehicle',
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
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
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
        <Table
            columns={columns}
            dataSource={agents}
            loading={loading}
            rowKey="id"
        />
    );
};

export default AgentTable;
