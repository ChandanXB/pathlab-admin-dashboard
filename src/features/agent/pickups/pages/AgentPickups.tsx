import React, { useState } from 'react';
import { Typography, Card, Table, Tag, Button, Space, Input, Select, Row, Col, Tooltip } from 'antd';
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
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAgentOrders } from '../../hooks/useAgentOrders';
import PickupDetailDrawer from '../../components/PickupDetailDrawer';
import type { AgentOrder } from '../../services/agentOrderService';

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
    } = useAgentOrders();

    const [selectedOrder, setSelectedOrder] = useState<AgentOrder | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [assignmentFilter, setAssignmentFilter] = useState<string>('all');

    const filteredOrders = orders.filter(order => {
        // Search
        if (searchText) {
            const search = searchText.toLowerCase();
            const matchesSearch =
                order.order_code.toLowerCase().includes(search) ||
                order.patient?.full_name?.toLowerCase().includes(search) ||
                order.patient?.phone?.toLowerCase().includes(search) ||
                order.address?.toLowerCase().includes(search);
            if (!matchesSearch) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) return false;

        // Assignment filter
        if (assignmentFilter !== 'all' && order.assignment_status !== assignmentFilter) return false;

        return true;
    });

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

    const getOrderStatusTag = (status: string) => {
        const map: Record<string, string> = {
            pending: 'gold',
            collected: 'blue',
            processing: 'purple',
            completed: 'green',
            cancelled: 'red',
        };
        return <Tag color={map[status] || 'default'} style={{ borderRadius: '6px' }}>{status.toUpperCase()}</Tag>;
    };

    const columns = [
        {
            title: 'Order',
            key: 'order',
            width: 160,
            render: (_: any, record: AgentOrder) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: '13px' }}>{record.order_code}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {dayjs(record.createdAt).format('DD MMM, hh:mm A')}
                    </Text>
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
                    <Text strong>{record.patient?.full_name || 'N/A'}</Text>
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
            title: 'Order Status',
            key: 'status',
            width: 120,
            render: (_: any, record: AgentOrder) => getOrderStatusTag(record.status)
        },
        {
            title: 'Pickup Status',
            key: 'assignment',
            width: 120,
            render: (_: any, record: AgentOrder) => getAssignmentTag(record.assignment_status)
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
                                onClick={() => claimBroadcastedOrder(record.id)}
                                style={{ background: '#1890ff', borderColor: '#1890ff', borderRadius: '6px' }}
                            >
                                Claim
                            </Button>
                        )}
                        {status === 'pending' && (
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => acceptPickup(record.id)}
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
                                onClick={() => startPickup(record.id)}
                                style={{ borderRadius: '6px' }}
                            >
                                Start
                            </Button>
                        )}
                        {status === 'picking_up' && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<SendOutlined />}
                                onClick={() => openDrawer(record)}
                                style={{ background: '#722ed1', borderColor: '#722ed1', borderRadius: '6px' }}
                            >
                                Collected
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
                                onClick={() => openDrawer(record)}
                                style={{ borderRadius: '6px' }}
                            />
                        </Tooltip>
                    </Space>
                );
            }
        }
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ marginBottom: '8px' }}>
                <Title level={4} style={{ margin: 0 }}>All Assigned Pickups</Title>
                <Text type="secondary">
                    Showing {filteredOrders.length} of {orders.length} pickups
                </Text>
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
                    <Col xs={12} sm={5}>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: '100%' }}
                            options={[
                                { label: 'All Statuses', value: 'all' },
                                { label: 'Pending', value: 'pending' },
                                { label: 'Collected', value: 'collected' },
                                { label: 'Processing', value: 'processing' },
                                { label: 'Completed', value: 'completed' },
                                { label: 'Cancelled', value: 'cancelled' },
                            ]}
                        />
                    </Col>
                    <Col xs={12} sm={5}>
                        <Select
                            value={assignmentFilter}
                            onChange={setAssignmentFilter}
                            style={{ width: '100%' }}
                            options={[
                                { label: 'All Pickups', value: 'all' },
                                { label: 'Available for Claim', value: 'broadcasted' },
                                { label: 'Pending Accept', value: 'pending' },
                                { label: 'Accepted', value: 'accepted' },
                                { label: 'En Route', value: 'picking_up' },
                                { label: 'Collected', value: 'collected' },
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={6}>
                        <Button
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
            <Card style={{ borderRadius: '12px', flex: 1 }} styles={{ body: { padding: 0 } }}>
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 15, showSizeChanger: false }}
                    size="small"
                    scroll={{ x: 900 }}
                    rowClassName={(record) =>
                        record.priority === 'urgent' ? 'urgent-row' : ''
                    }
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
