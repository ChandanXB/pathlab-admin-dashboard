import React from 'react';
import { Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';

interface CategoryTableProps {
    data: any[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    onEdit: (record: any) => void;
    onDelete: (id: number) => void;
    onNext: () => void;
    scroll?: { x?: number | string; y?: number | string };
}

const CategoryTable: React.FC<CategoryTableProps> = ({
    data,
    loading,
    loadingMore,
    hasMore,
    onEdit,
    onDelete,
    onNext,
    scroll
}) => {
    const columns = [
        {
            title: 'S.No',
            key: 'serial',
            width: 80,
            render: (_: any, __: any, index: number) => index + 1
        },
        {
            title: 'Name',
            dataIndex: 'category_name',
            key: 'category_name',
            render: (text: string) => <strong>{text}</strong>
        },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {(status || 'inactive').toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                    />
                    <Popconfirm
                        title="Delete category?"
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
            )
        }
    ];

    return (
        <InfiniteScrollTable
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            next={onNext}
            scroll={scroll}
        />
    );
};

export default CategoryTable;

