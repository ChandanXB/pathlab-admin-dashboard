import React, { useState, useEffect } from 'react';
import { Typography, Card, Tag, Button, Space, Input, Select, Row, Col, Tooltip, Popconfirm, Modal, message } from 'antd';
import {
    EnvironmentOutlined,
    PhoneOutlined,
    CheckOutlined,
    SearchOutlined,
    FilterOutlined,
    ThunderboltOutlined,
    EyeOutlined,
    CarOutlined,
    SendOutlined,
    ClockCircleOutlined,
    ExperimentOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { useAgentOrders } from '../../hooks/useAgentOrders';
import PickupDetailDrawer from '../../components/PickupDetailDrawer';
import type { AgentOrder } from '../../services/agentOrderService';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';
import { labOrderService } from '@/features/admin/labOrder/services/labOrderService';

const { Text, Title } = Typography;


const AgentPickups: React.FC = () => {
    const {
        orders,
        loading,
        acceptPickup,
        claimBroadcastedOrder,
        startPickup,
        markReached,
        markCollected,
        refresh,
        setFilters,
    } = useAgentOrders();

    const [searchParams] = useSearchParams();
    const urlStatus = searchParams.get('status') || 'all';

    const [selectedOrder, setSelectedOrder] = useState<AgentOrder | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(urlStatus);
    const [assignmentFilter, setAssignmentFilter] = useState<string>('all');

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [displayLimit, setDisplayLimit] = useState(15);
    const [loadingMore, setLoadingMore] = useState(false);
    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const isMobile = screenSize < 768;

    useEffect(() => {
        setStatusFilter(urlStatus);
    }, [urlStatus]);

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchText);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    useEffect(() => {
        setFilters({ search: debouncedSearch });
    }, [debouncedSearch, setFilters]);

    const filteredOrders = orders
        .filter(order => {
            // Status filter
            if (statusFilter !== 'all' && order.status !== statusFilter) return false;

            // Assignment filter
            if (assignmentFilter !== 'all' && order.assignment_status !== assignmentFilter) return false;

            return true;
        })
        .sort((a, b) => {
            // Sort by accepted_at (assignment time) descending — newest assigned first
            const aTime = a.accepted_at ? new Date(a.accepted_at).getTime() : new Date(a.updatedAt).getTime();
            const bTime = b.accepted_at ? new Date(b.accepted_at).getTime() : new Date(b.updatedAt).getTime();
            return bTime - aTime;
        });

    useEffect(() => {
        setDisplayLimit(15);
        setSelectedRowKeys([]);
    }, [searchText, statusFilter, assignmentFilter]);

    const handleLoadMore = () => {
        if (displayLimit >= filteredOrders.length) return;
        setLoadingMore(true);
        setTimeout(() => {
            setDisplayLimit(prev => Math.min(prev + 15, filteredOrders.length));
            setLoadingMore(false);
        }, 500);
    };

    const handleDelete = async (id: number) => {
        const hide = message.loading('Deleting order...', 0);
        try {
            const res = await labOrderService.deleteOrder(id);
            if (res.success) {
                message.success('Order deleted successfully');
                setSelectedRowKeys(prev => prev.filter(key => key !== id));
                refresh();
            } else {
                message.error('Failed to delete order');
            }
        } catch (err: any) {
            message.error(err.response?.data?.error || 'Failed to delete order');
        } finally {
            hide();
        }
    };

    const handleBulkDelete = () => {
        Modal.confirm({
            title: 'Delete Selected Orders',
            content: `Are you sure you want to permanently delete ${selectedRowKeys.length} selected orders? This action cannot be undone.`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            style: { top: 80 },
            onOk: async () => {
                const ids = selectedRowKeys.map(Number);
                const hide = message.loading(`Deleting ${ids.length} selected orders...`, 0);
                try {
                    const res = await labOrderService.bulkDeleteOrders(ids);
                    if (res.success) {
                        message.success('Selected orders deleted successfully');
                        setSelectedRowKeys([]);
                        refresh();
                    } else {
                        message.error('Failed to delete selected orders');
                    }
                } catch (err: any) {
                    message.error(err.response?.data?.error || 'Failed to delete selected orders');
                } finally {
                    hide();
                }
            }
        });
    };

    const openDrawer = (order: AgentOrder) => {
        setSelectedOrder(order);
        setDrawerVisible(true);
    };

    const getAssignmentTag = (status: string | null) => {
        const map: Record<string, { label: string; color: string }> = {
            broadcasted: { label: 'AVAILABLE', color: 'blue' },
            pending: { label: 'PENDING', color: 'warning' },
            accepted: { label: 'ACCEPTED', color: 'processing' },
            picking_up: { label: 'EN ROUTE', color: 'cyan' },
            collected: { label: 'COLLECTED', color: 'success' },
            not_assigned: { label: 'N/A', color: 'default' },
        };
        const info = map[status || 'not_assigned'] || { label: status?.toUpperCase() || 'N/A', color: 'default' };
        return <Tag color={info.color} style={{ borderRadius: '6px', fontWeight: 600 }}>{info.label}</Tag>;
    };


    const columns = [
        {
            title: 'Order',
            key: 'order',
            width: 180,
            render: (_: any, record: AgentOrder) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: '13px' }}>{record.order_code}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {dayjs(record.createdAt).format('DD MMM, hh:mm A')}
                    </Text>
                    {record.accepted_at && (
                        <Text style={{ fontSize: '11px', color: '#52c41a' }}>
                            <CheckOutlined style={{ marginRight: '4px' }} />
                            Assigned: {dayjs(record.accepted_at).format('DD MMM, hh:mm A')}
                        </Text>
                    )}
                    {record.priority !== 'normal' && (
                        <Tag color={record.priority === 'urgent' ? 'error' : 'warning'}
                            icon={<ThunderboltOutlined />}
                            style={{ borderRadius: '6px', marginTop: '4px', fontSize: '10px' }}>
                            {record.priority.toUpperCase()}
                        </Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'Patient & Address',
            key: 'patient',
            width: 250,
            ellipsis: true,
            render: (_: any, record: AgentOrder) => (
                <div>
                    <Text strong style={{ textTransform: 'capitalize' }}>{record.patient?.full_name || 'N/A'}</Text>
                    <div style={{ marginTop: '2px' }}>
                        <EnvironmentOutlined style={{ color: '#ff4d4f', marginRight: '4px', fontSize: '11px' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.address || record.patient?.address || 'No address'}
                        </Text>
                    </div>
                    {record.patient?.phone && (
                        <div style={{ marginTop: '2px' }}>
                            <PhoneOutlined style={{ marginRight: '4px', fontSize: '11px' }} />
                            <a href={`tel:${record.patient.phone}`} style={{ fontSize: '12px' }}>
                                {record.patient.phone}
                            </a>
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Tests',
            key: 'tests',
            width: 80,
            render: (_: any, record: AgentOrder) => (
                <Tooltip title={record.test_results?.map(tr => tr.test?.test_name).join(', ')}>
                    <Tag icon={<ExperimentOutlined />} color="default" style={{ borderRadius: '8px' }}>
                        {record.test_results?.length || 0}
                    </Tag>
                </Tooltip>
            )
        },
        {
            title: 'Status',
            key: 'combined_status',
            width: 140,
            render: (_: any, record: AgentOrder) => (
                <div>
                    {getAssignmentTag(record.assignment_status)}
                </div>
            )
        },
        {
            title: 'Actions',
            key: 'action',
            width: 180,
            render: (_: any, record: AgentOrder) => {
                const status = record.assignment_status;
                return (
                    <Space size="small">
                        {status === 'broadcasted' && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<SendOutlined />}
                                onClick={(e) => { e.stopPropagation(); claimBroadcastedOrder(record.id); }}
                                style={{ background: '#1890ff', borderColor: '#1890ff', borderRadius: '6px' }}
                            >
                                Claim
                            </Button>
                        )}
                        {status === 'pending' && (
                            <Button
                                type="primary"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); acceptPickup(record.id); }}
                                style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: '6px' }}
                            >
                                Accept
                            </Button>
                        )}
                        {status === 'accepted' && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<CarOutlined />}
                                onClick={(e) => { e.stopPropagation(); startPickup(record.id); }}
                                style={{ borderRadius: '6px' }}
                            >
                                Start
                            </Button>
                        )}
                        {status === 'picking_up' && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<EnvironmentOutlined />}
                                onClick={(e) => { e.stopPropagation(); markReached(record.id); }}
                                style={{ background: '#faad14', borderColor: '#faad14', borderRadius: '6px' }}
                            >
                                Reached
                            </Button>
                        )}
                        {status === 'reached' && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<SendOutlined />}
                                onClick={(e) => { e.stopPropagation(); openDrawer(record); }}
                                style={{ background: '#722ed1', borderColor: '#722ed1', borderRadius: '6px' }}
                            >
                                Collect
                            </Button>
                        )}
                        {(status === 'collected') && (
                            <Tag color="success" icon={<CheckOutlined />} style={{ borderRadius: '6px' }}>
                                Done
                            </Tag>
                        )}
                        <Tooltip title="View Details">
                            <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={(e) => { e.stopPropagation(); openDrawer(record); }}
                                style={{ borderRadius: '6px' }}
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Delete Order"
                            description="Are you sure?"
                            onConfirm={(e) => { e?.stopPropagation(); handleDelete(record.id); }}
                            onCancel={(e) => e?.stopPropagation()}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Delete">
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ borderRadius: '6px' }}
                                />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                );
            }
        }
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '16px' : '0',
                marginBottom: '8px'
            }}>
                <div>
                    <Title level={4} style={{ margin: 0 }}>All Assigned Pickups</Title>
                    <Text type="secondary">
                        Showing {Math.min(displayLimit, filteredOrders.length)} of {filteredOrders.length} pickups
                    </Text>
                </div>
                {selectedRowKeys.length > 0 && (
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleBulkDelete}
                        style={{ borderRadius: '8px' }}
                    >
                        Delete ({selectedRowKeys.length})
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card style={{ borderRadius: '12px' }} styles={{ body: { padding: '12px 16px' } }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={8}>
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Search order, patient, address..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                            style={{ borderRadius: '8px' }}
                        />
                    </Col>
                    <Col xs={12} sm={8}>
                        <Select
                            value={assignmentFilter}
                            onChange={setAssignmentFilter}
                            style={{ width: '100%', borderRadius: '8px' }}
                            placeholder="Assignment Type"
                            options={[
                                { label: 'All Assignments', value: 'all' },
                                { label: 'Available for Claim', value: 'broadcasted' },
                                { label: 'Pending Accept', value: 'pending' },
                                { label: 'Accepted', value: 'accepted' },
                                { label: 'En Route', value: 'picking_up' },
                                { label: 'Collected', value: 'collected' },
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Button
                            block
                            icon={<FilterOutlined />}
                            onClick={() => { setSearchText(''); setStatusFilter('all'); setAssignmentFilter('all'); }}
                            style={{ borderRadius: '8px' }}
                        >
                            Clear Filters
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card style={{ borderRadius: '12px', flex: 1, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
                <InfiniteScrollTable
                    columns={columns}
                    dataSource={filteredOrders.slice(0, displayLimit)}
                    loading={loading}
                    loadingMore={loadingMore}
                    hasMore={displayLimit < filteredOrders.length}
                    next={handleLoadMore}
                    rowKey="id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys) => setSelectedRowKeys(keys)
                    }}
                    size="small"
                    scroll={{ x: 900, y: 'calc(100vh - 350px)' }}
                    rowClassName={(record) => record.priority === 'urgent' ? 'urgent-row' : ''}
                    onRow={(record) => ({
                        onClick: (e: any) => {
                            if (
                                e.target.closest('.ant-dropdown-trigger') || 
                                e.target.closest('button') || 
                                e.target.closest('.anticon') ||
                                e.target.closest('.ant-table-selection-column')
                            ) {
                                return;
                            }
                            openDrawer(record);
                        },
                        style: { cursor: 'pointer' }
                    })}
                />
            </Card>

            {/* Detail Drawer */}
            <PickupDetailDrawer
                visible={drawerVisible}
                order={selectedOrder}
                onClose={() => { setDrawerVisible(false); setSelectedOrder(null); }}
                onAccept={async (id) => { await acceptPickup(id); setDrawerVisible(false); }}
                onStartPickup={async (id) => { await startPickup(id); setDrawerVisible(false); }}
                onMarkReached={async (id) => { await markReached(id); setDrawerVisible(false); }}
                onMarkCollected={async (id, proofData) => { await markCollected(id, proofData); setDrawerVisible(false); }}
            />

            <style>{`
                .urgent-row {
                    background: #fff2f0 !important;
                }
                .urgent-row:hover td {
                    background: #ffece8 !important;
                }
            `}</style>
        </div>
    );
};

export default AgentPickups;
