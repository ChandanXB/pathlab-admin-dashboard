import React from 'react';
import { Space, Button, Tag, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';
import type { Doctor } from '../types/doctor.types';

interface DoctorTableProps {
    doctors: Doctor[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    onEdit: (doctor: Doctor) => void;
    onDelete: (id: number) => void;
    onRowClick: (record: Doctor) => void;
    onLoadMore: () => void;
    scroll?: { x?: number | string; y?: number | string };
}

const DoctorTable: React.FC<DoctorTableProps> = ({
    doctors,
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
            render: (text: string) => (
                <Space>
                    <UserOutlined />
                    <span style={{ fontWeight: 600 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Specialty',
            dataIndex: 'specialty',
            key: 'specialty',
            render: (specialty: string) => <Tag color="blue">{specialty}</Tag>
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email: string) => <span style={{ whiteSpace: 'nowrap' }}>{email}</span>
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
            width: 100,
            render: (_: any, record: Doctor) => (
                <Space size="middle">
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(record);
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this doctor?"
                        onConfirm={(e) => {
                            e?.stopPropagation();
                            onDelete(record.id);
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <InfiniteScrollTable
            columns={columns}
            dataSource={doctors}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            next={onLoadMore}
            rowKey="id"
            scroll={scroll}
            onRow={(record) => ({
                onClick: () => onRowClick(record),
                style: { cursor: 'pointer' }
            })}
        />
    );
};

export default DoctorTable;
