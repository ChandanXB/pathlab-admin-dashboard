import React from 'react';
import { Tag } from 'antd';
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
    rowSelection?: any;
}

const TestTable: React.FC<TestTableProps> = ({
    data,
    loading,
    loadingMore,
    hasMore,
    onEdit,
    onDelete,
    scroll,
    onScroll,
    rowSelection
}) => {
    const columns = [
        { title: 'Test Code', dataIndex: 'test_code', width: 120 },
        {
            title: 'Test Name',
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
            rowSelection={rowSelection}
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
