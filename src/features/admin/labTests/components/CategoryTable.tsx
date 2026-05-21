import React from 'react';
import { Tag } from 'antd';
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
    rowSelection?: any;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
    data,
    loading,
    loadingMore,
    hasMore,
    onEdit,
    onDelete,
    onNext,
    scroll,
    rowSelection
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
            rowSelection={rowSelection}
        />
    );
};

export default CategoryTable;

