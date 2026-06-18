import React from 'react';
import { Space, Tag, Avatar, Button, Tooltip, Popconfirm } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';
import type { Doctor } from '../types/doctor.types';
import { formatName, formatDoctorName } from '@/shared/utils/nameUtils';

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
    rowSelection?: any;
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
    scroll,
    rowSelection
}) => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_: string, record: Doctor) => (
                <Space>
                    {record.profile_image ? (
                        <Avatar src={record.profile_image} size="small" />
                    ) : (
                        <Avatar icon={<UserOutlined />} size="small" />
                    )}
                    <span style={{ fontWeight: 600 }}>{formatDoctorName(record.name)}</span>
                </Space>
            ),
        },
        {
            title: 'Specialty',
            dataIndex: 'specialty',
            key: 'specialty',
            render: (specialty: string) => <Tag color="blue">{formatName(specialty)}</Tag>
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
            ellipsis: true,
            render: (email: string) => email || '-'
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
                <div onClick={(e) => e.stopPropagation()}>
                    <Space size={4}>
                        <Tooltip title="Edit Doctor">
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => onEdit(record)}
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Delete Doctor"
                            description="Are you sure you want to delete this doctor?"
                            onConfirm={() => onDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Delete">
                                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                </div>
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
            rowSelection={rowSelection}
            onRow={(record) => ({
                onClick: (e: any) => {
                    if (
                        e.target.closest('.ant-table-selection-column') || 
                        e.target.closest('button') || 
                        e.target.closest('.anticon')
                    ) {
                        return;
                    }
                    onRowClick(record);
                },
                style: { cursor: 'pointer' }
            })}
        />
    );
};

export default DoctorTable;
