import React from 'react';
import { Table, Tag, Space, Button, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '@/config/apiClient';
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
    const getFullImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('data:') || url.startsWith('http')) return url;
        const baseUrl = API_BASE_URL.replace('/api/v1', '');
        return `${baseUrl}/${url.startsWith('/') ? url.slice(1) : url}`;
    };

    const columns = [
        {
            title: 'Icon/Img',
            dataIndex: 'image_url',
            key: 'image_url',
            width: 100,
            align: 'center' as const,
            onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
            onCell: () => ({ style: { verticalAlign: 'middle' } }),
            render: (url: string) => url ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <img src={getFullImageUrl(url)} alt="icon" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '4px' }} />
                </div>
            ) : (
                <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999', margin: '0 auto' }}>No Img</div>
            )
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            onCell: () => ({ style: { verticalAlign: 'middle' } }),
            render: (text: string, record: RoutineCheckup) => {
                const parent = data.find(p => p.id === record.parent_id);
                return (
                    <div style={{ paddingLeft: record.parent_id ? '20px' : '0' }}>
                        <div style={{ fontWeight: 600 }}>{text}</div>
                        {parent && (
                            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                Sub-package of: <span style={{ color: '#595959' }}>{parent.title}</span>
                            </div>
                        )}
                    </div>
                );
            },
        },

        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            align: 'center' as const,
            onCell: () => ({ style: { verticalAlign: 'middle' } }),
            render: (gender: string) => (
                <Tag color={gender === 'male' ? 'blue' : gender === 'female' ? 'magenta' : 'default'}>
                    {gender.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Age Group',
            dataIndex: 'age_group',
            key: 'age_group',
            align: 'center' as const,
            onCell: () => ({ style: { verticalAlign: 'middle' } }),
            render: (ageGroup: string) => (
                <Tag color="cyan">
                    {(ageGroup || 'ALL').toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Target',
            key: 'target',
            align: 'center' as const,
            onCell: () => ({ style: { verticalAlign: 'middle' } }),
            render: (_: any, record: RoutineCheckup) => {
                const tests = record.tests || [];
                const categories = record.categories || [];
                const maxVisible = 1;
                
                const allItems = [
                    ...tests.map(t => ({ id: `t-${t.id}`, label: `[Test] ${t.test_name}`, color: 'blue' })),
                    ...categories.map(c => ({ id: `c-${c.id}`, label: c.category_name, color: 'cyan' }))
                ];

                if (allItems.length === 0) return <Tag color="default">No Target</Tag>;

                const visibleItems = allItems.slice(0, maxVisible);
                const remainingCount = allItems.length - maxVisible;

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        {visibleItems.map(item => (
                            <Tag 
                                key={item.id} 
                                color={item.color} 
                                style={{ 
                                    fontSize: '11px', 
                                    margin: 0, 
                                    maxWidth: '120px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'inline-block',
                                    verticalAlign: 'bottom'
                                }}
                            >
                                {item.label}
                            </Tag>
                        ))}
                        {remainingCount > 0 && (
                            <Tooltip 
                                title={
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {allItems.map(item => (
                                            <Tag key={item.id} color={item.color} style={{ fontSize: '11px', margin: 0 }}>
                                                {item.label}
                                            </Tag>
                                        ))}
                                    </div>
                                }
                            >
                                <Tag style={{ fontSize: '10px', cursor: 'pointer', margin: 0 }}>+{remainingCount} more</Tag>
                            </Tooltip>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            onCell: () => ({ style: { verticalAlign: 'middle' } }),
            render: (tags: string[]) => {
                if (!tags || tags.length === 0) return '-';
                const maxVisible = 1;
                const visible = tags.slice(0, maxVisible);
                const remaining = tags.length - maxVisible;

                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '100px' }}>
                        {visible.map(tag => (
                            <Tag 
                                key={tag} 
                                style={{ 
                                    borderRadius: '10px', 
                                    margin: 0,
                                    maxWidth: '80px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'inline-block',
                                    verticalAlign: 'bottom'
                                }}
                            >
                                {tag}
                            </Tag>
                        ))}
                        {remaining > 0 && (
                            <Tooltip title={tags.join(', ')}>
                                <Tag style={{ borderRadius: '10px', cursor: 'pointer', margin: 0, fontSize: '10px' }}>+{remaining}</Tag>
                            </Tooltip>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            onCell: () => ({ style: { verticalAlign: 'middle' } }),
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
            align: 'center' as const,
            onCell: () => ({ style: { verticalAlign: 'middle' } }),
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
