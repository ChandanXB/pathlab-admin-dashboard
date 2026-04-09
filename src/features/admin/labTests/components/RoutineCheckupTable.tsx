import React from 'react';
import { Table, Tag, Space, Button, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { RoutineCheckup } from '../types/routineCheckup.types';

interface RoutineCheckupTableProps {
    data: RoutineCheckup[];
    loading: boolean;
    onEdit: (record: RoutineCheckup) => void;
    onDelete: (id: number) => void;
    scroll?: { x?: number | string; y?: number | string };
}

const RoutineCheckupTable: React.FC<RoutineCheckupTableProps> = ({
    data,
    loading,
    onEdit,
    onDelete,
    scroll
}) => {
    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            render: (gender: string) => (
                <Tag color={gender === 'male' ? 'blue' : gender === 'female' ? 'magenta' : 'default'}>
                    {gender.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Category',
            dataIndex: ['category', 'category_name'],
            key: 'category',
            render: (text: string) => <Tag color="cyan">{text}</Tag>,
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags: string[]) => (
                <Space wrap>
                    {tags.map(tag => (
                        <Tag key={tag} style={{ borderRadius: '10px' }}>{tag}</Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'success' : 'error'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_: any, record: RoutineCheckup) => (
                <Space size="middle">
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Are you sure you want to delete this routine package?"
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
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={scroll}
            className="custom-table"
        />
    );
};

export default RoutineCheckupTable;
