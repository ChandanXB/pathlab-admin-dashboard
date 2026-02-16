import React from 'react';
import { Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';

interface TestTableProps {
    data: any[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    onEdit: (record: any) => void;
    onDelete: (id: number) => void;
    scroll?: { x?: number | string; y?: number | string };
    onScroll?: (e: any) => void; // Keep for compatibility if needed, but InfiniteScroll handles this now
}

const TestTable: React.FC<TestTableProps> = ({
    data,
    loading,
    loadingMore,
    hasMore,
    onEdit,
    onDelete,
    scroll,
    onScroll
}) => {
    const columns = [
        { title: 'Code', dataIndex: 'test_code', width: 100 },
        {
            title: 'Name',
            dataIndex: 'test_name',
            key: 'test_name',
            render: (text: string) => <strong>{text}</strong>
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (cat: any) => <Tag color="blue">{cat?.category_name}</Tag>
        },
        { title: 'Sample', dataIndex: 'sample_type', width: 100 },
        { title: 'Price', dataIndex: 'price', render: (val: any) => `₹${val}` },
        {
            title: 'Fasting',
            dataIndex: 'fasting_required',
            render: (val: boolean) => val ? <Tag color="orange">Yes</Tag> : <Tag>No</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {(status || 'inactive').toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 120,
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)} />
                    <Popconfirm title="Delete test?" onConfirm={() => onDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger />
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
            next={() => {
                // If onScroll was passed, we can't easily trigger it, but we should 
                // typically trigger the filter update logic here.
                // In LabTestManager, we'll need to update how we trigger 'next'
                if (onScroll) onScroll({ currentTarget: {} } as any);
            }}
            scroll={scroll}
        />
    );
};

export default TestTable;
