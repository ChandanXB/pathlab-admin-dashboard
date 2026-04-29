import React from 'react';
import { Tag, Space, Button, Popconfirm, Tooltip, Typography } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    BarcodeOutlined,
    ExperimentOutlined,
    ClockCircleOutlined,
    UserAddOutlined,
    UserSwitchOutlined,
    CloudUploadOutlined,
    CameraOutlined
} from '@ant-design/icons';

import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';
import type { LabOrder } from '../types/labOrder.types';
import { ORDER_STATUSES, PRIORITIES } from '@/shared/constants/app.constants';
import dayjs from 'dayjs';

const { Text } = Typography;

interface LabOrderTableProps {
    data: LabOrder[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    onEdit: (record: LabOrder) => void;
    onDelete: (id: number) => void;
    onAssign: (record: LabOrder) => void;
    onLoadMore: () => void;
    onRowClick: (record: LabOrder) => void;
    onUploadReport: (record: LabOrder) => void;
    onUploadProof?: (record: LabOrder) => void;
    visibleColumns?: string[];
    scroll?: { x?: number | string; y?: number | string };
}

const LabOrderTable: React.FC<LabOrderTableProps> = ({
    data,
    loading,
    loadingMore,
    hasMore,
    onEdit,
    onDelete,
    onAssign,
    onLoadMore,
    onRowClick,
    onUploadReport,
    onUploadProof,
    visibleColumns = ['order_info', 'patient', 'tests', 'agent', 'agent_assign', 'amount', 'status', 'actions'],
    scroll,
}) => {

    const getStatusColor = (status: string) => {
        const found = ORDER_STATUSES.find(s => s.value === status);
        return found ? found.color : 'default';
    };

    const getStatusLabel = (status: string) => {
        const found = ORDER_STATUSES.find(s => s.value === status);
        return found ? found.label : status;
    };





    const columns = [
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>Order Details</span>,
            key: 'order_info',
            minWidth: 140,
            render: (_: any, record: LabOrder) => {
                const foundPriority = PRIORITIES.find(p => p.value === record.priority);
                const tooltipContent = (
                    <div style={{ padding: '2px' }}>
                        <div><ClockCircleOutlined /> {dayjs(record.createdAt).format('DD/MM/YY hh:mm A')}</div>
                        <div style={{ marginTop: '4px' }}>
                            Priority: <span style={{ color: foundPriority?.color }}>{foundPriority?.label || record.priority}</span>
                        </div>
                    </div>
                );

                return (
                    <Tooltip title={tooltipContent} placement="top">
                        <Text strong style={{ whiteSpace: 'nowrap', cursor: 'pointer' }} ellipsis>
                            <BarcodeOutlined /> {record.order_code}
                        </Text>
                    </Tooltip>
                );
            }
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>Patient</span>,
            key: 'patient',
            minWidth: 120,
            render: (_: any, record: LabOrder) => (
                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Text strong style={{ textTransform: 'capitalize' }} ellipsis={{ tooltip: record.patient?.full_name }}>
                        <UserOutlined /> {record.patient?.full_name || 'N/A'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.patient?.patient_code}</Text>
                </Space>
            )
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>Tests</span>,
            key: 'tests',
            minWidth: 130,
            render: (_: any, record: LabOrder) => {
                const results = record.test_results || [];
                if (results.length === 0) return '-';

                const maxVisible = 1;
                const visible = results.slice(0, maxVisible);
                const remaining = results.length - maxVisible;

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '120px' }}>
                        {visible.map((tr, idx) => (
                            <Tag 
                                key={idx} 
                                icon={<ExperimentOutlined />} 
                                style={{ 
                                    margin: 0, 
                                    maxWidth: '100%', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap',
                                    display: 'inline-block',
                                    verticalAlign: 'bottom'
                                }}
                            >
                                {tr.test?.test_name}
                            </Tag>
                        ))}
                        {remaining > 0 && (
                            <Tooltip
                                title={
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {results.map((tr, idx) => (
                                            <Tag key={idx} icon={<ExperimentOutlined />} style={{ border: 'none', color: 'rgba(0, 0, 0, 0.85)' }}>
                                                {tr.test?.test_name}
                                            </Tag>
                                        ))}
                                    </div>
                                }
                            >
                                <Tag color="blue" style={{ cursor: 'pointer', margin: 0, fontSize: '10px' }}>+{remaining} more</Tag>
                            </Tooltip>
                        )}
                    </div>
                );
            }
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>Agent</span>,
            key: 'agent',
            width: '12%',
            render: (_: any, record: LabOrder) => {
                if (record.collection_agent) {
                    return (
                        <Space direction="vertical" size={0} style={{ width: '100%' }}>
                            <Text strong style={{ fontSize: '12px', textTransform: 'capitalize' }} ellipsis={{ tooltip: record.collection_agent.name }}>
                                {record.collection_agent.name}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>{record.collection_agent.phone}</Text>
                        </Space>
                    );
                }
                
                if (record.order_type === 'lab_visit') {
                    return <Tag color="blue">LAB VISIT</Tag>;
                }

                return <Tag color="default">UNASSIGNED</Tag>;
            }
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>Amount</span>,
            key: 'amount',
            width: '10%',
            render: (_: any, record: LabOrder) => (
                <Space direction="vertical" size={0}>
                    <Text>₹{record.total_amount}</Text>
                    <Tag color={record.payment_status === 'paid' ? 'success' : 'warning'}>
                        {record.payment_status.toUpperCase()}
                    </Tag>
                </Space>
            )
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>Order Status</span>,
            dataIndex: 'status',
            key: 'status',
            width: '12%',
            render: (status: string, record: LabOrder) => {
                const isAssigning = status === 'assigned' && record.assignment_status !== 'accepted';
                const displayLabel = isAssigning ? 'Assigning' : getStatusLabel(status);
                const displayColor = isAssigning ? 'blue' : getStatusColor(status);

                const tag = (
                    <Tag
                        color={displayColor}
                        style={{ borderRadius: '12px', padding: '0 10px' }}
                    >
                        {displayLabel}
                    </Tag>
                );

                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        {isAssigning ? (
                            <Tooltip title="Agent not accepted the order yet" placement="top">
                                {tag}
                            </Tooltip>
                        ) : (
                            tag
                        )}
                    </div>
                );
            }
        },
        {
            title: <div style={{ textAlign: 'center', width: '100%' }}>Assign</div>,
            key: 'agent_assign',
            width: '12%',
            render: (_: any, record: LabOrder) => {
                const isLabVisit = record.order_type === 'lab_visit';
                const button = (
                    <Button
                        type="primary"
                        ghost
                        size="small"
                        disabled={isLabVisit}
                        icon={record.collection_agent
                            ? <UserSwitchOutlined />
                            : <UserAddOutlined />
                        }
                        onClick={() => !isLabVisit && onAssign(record)}
                        style={{
                            borderRadius: '6px',
                            borderColor: isLabVisit ? '#d9d9d9' : (record.collection_agent ? '#52c41a' : '#faad14'),
                            color: isLabVisit ? 'rgba(0, 0, 0, 0.25)' : (record.collection_agent ? '#52c41a' : '#faad14'),
                            fontWeight: 600,
                            height: '32px',
                            width: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {record.collection_agent ? "Reassign" : "Assign"}
                    </Button>
                );

                return (
                    <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'center' }}>
                        {isLabVisit ? (
                            <Tooltip title="Not required for Lab Visit">
                                {button}
                            </Tooltip>
                        ) : button}
                    </div>
                );
            },
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>Actions</span>,
            key: 'actions',
            width: '12%',
            render: (_: any, record: LabOrder) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Space size={0}>
                        <Tooltip title="Edit Order">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => onEdit(record)}
                            />
                        </Tooltip>
                        {record.order_type === 'lab_visit' && record.status === 'pending' && onUploadProof && (
                            <Tooltip title="Upload Payment/Collection Proof">
                                <Button
                                    type="text"
                                    icon={<CameraOutlined style={{ color: '#52c41a' }} />}
                                    onClick={() => onUploadProof(record)}
                                />
                            </Tooltip>
                        )}
                        {(record.status === 'processing' || record.status === 'collected') && (
                            <Tooltip title="Upload Report">
                                <Button
                                    type="text"
                                    icon={<CloudUploadOutlined style={{ color: '#1890ff' }} />}
                                    onClick={() => onUploadReport(record)}
                                />
                            </Tooltip>
                        )}
                        <Popconfirm
                            title="Delete Order"
                            description="Are you sure?"
                            onConfirm={() => onDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Delete">
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                </div>
            ),
        },
    ];

    // Filter columns based on visibility
    const filteredColumns = columns.filter(col => visibleColumns.includes(col.key || ''));


    return (
        <div className="infinite-scroll-table-wrapper" style={{ width: '100%' }}>
            <style>{`
                .infinite-scroll-table-wrapper {
                    width: 100% !important;
                }
                .infinite-scroll-table-wrapper .ant-table-wrapper,
                .infinite-scroll-table-wrapper .ant-table,
                .infinite-scroll-table-wrapper .ant-table-container,
                .infinite-scroll-table-wrapper .ant-table-content,
                .infinite-scroll-table-wrapper .ant-table-header table,
                .infinite-scroll-table-wrapper .ant-table-body table {
                    width: 100% !important;
                    min-width: 100% !important;
                }
                .infinite-scroll-table-wrapper .ant-table-thead > tr > th {
                    padding: 12px 12px !important;
                    white-space: nowrap !important;
                    background: #fafafa !important;
                }
                .infinite-scroll-table-wrapper .ant-table-tbody > tr > td {
                    padding: 12px 12px !important;
                }
                .infinite-scroll-table-wrapper .ant-table-placeholder {
                    width: 100% !important;
                }
            `}</style>
            <InfiniteScrollTable
                columns={filteredColumns}
                dataSource={data}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                next={onLoadMore}
                scroll={scroll}
                rowKey="id"
                onRow={(record) => ({
                    onClick: (e: any) => {
                        // Prevent drawer opening if user clicks on dropdown, buttons or icons
                        if (e.target.closest('.ant-dropdown-trigger') || e.target.closest('button') || e.target.closest('.anticon')) {
                            return;
                        }
                        onRowClick(record);
                    },
                    style: { cursor: 'pointer' }
                })}
            />
        </div>
    );
};

export default LabOrderTable;
