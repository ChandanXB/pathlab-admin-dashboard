import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Statistic, List, Tag, Space, Button, Empty, Segmented, Tooltip } from 'antd';
import {
    ExperimentOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CarOutlined,
    EnvironmentOutlined,
    UserOutlined,
    PhoneOutlined,
    ReloadOutlined,
    RightOutlined,
    SendOutlined,
    InboxOutlined,
    ThunderboltOutlined,
    FileImageOutlined,
    EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAgentOrders } from '../../hooks/useAgentOrders';
import { useAuthStore } from '@/store/authStore';
import PickupDetailDrawer from '../../components/PickupDetailDrawer';
import type { AgentOrder } from '../../services/agentOrderService';

const { Title, Text } = Typography;

const AgentDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const {
        activeOrders,
        pendingOrders,
        acceptedOrders,
        collectedOrders,
        loading,
        stats,
        profile,
        acceptPickup,
        startPickup,
        markCollected,
        refresh,
    } = useAgentOrders();

    const [selectedOrder, setSelectedOrder] = useState<AgentOrder | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('active');

    // Location tracking
    useEffect(() => {
        if (!user?.agentId) return;
        let intervalId: number;

        const updateLocation = () => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const { agentOrderService } = await import('../../services/agentOrderService');
                        await agentOrderService.updateLocation(user.agentId!, latitude, longitude);
                    } catch (e) {
                        // silently fail location updates
                    }
                },
                () => { },
                { enableHighAccuracy: true }
            );
        };

        updateLocation();
        intervalId = window.setInterval(updateLocation, 60000);
        return () => clearInterval(intervalId);
    }, [user?.agentId]);

    const openDrawer = (order: AgentOrder) => {
        setSelectedOrder(order);
        setDrawerVisible(true);
    };

    const getDisplayOrders = () => {
        switch (activeTab) {
            case 'pending': return pendingOrders;
            case 'active': return acceptedOrders;
            case 'collected': return collectedOrders;
            default: return activeOrders;
        }
    };

    const displayOrders = getDisplayOrders();

    const getAssignmentColor = (status: string | null) => {
        const map: Record<string, string> = {
            pending: '#faad14',
            accepted: '#1890ff',
            picking_up: '#722ed1',
            collected: '#52c41a',
        };
        return map[status || ''] || '#d9d9d9';
    };

    return (
        <div style={{ padding: '4px', height: '100%', overflow: 'auto' }}>
            {/* Welcome Header */}
            <div style={{
                marginBottom: 20,
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                borderRadius: '16px',
                padding: '24px 28px',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 20px rgba(24, 144, 255, 0.3)',
            }}>
                <div>
                    <Title level={4} style={{ color: '#fff', margin: 0 }}>
                        Welcome back, {user?.name}! 👋
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                        {dayjs().format('dddd, DD MMMM YYYY')} • Collection Agent
                    </Text>
                    {profile?.vehicle_no && (
                        <div style={{ marginTop: '8px' }}>
                            <Tag icon={<CarOutlined />} color="#fff" style={{
                                color: '#1890ff',
                                fontWeight: 600,
                                borderRadius: '8px',
                                padding: '2px 10px',
                            }}>
                                {profile.vehicle_type || 'Vehicle'}: {profile.vehicle_no}
                            </Tag>
                        </div>
                    )}
                </div>
                <Tooltip title="Refresh">
                    <Button
                        type="text"
                        icon={<ReloadOutlined spin={loading} />}
                        onClick={refresh}
                        style={{ color: '#fff', fontSize: '18px' }}
                    />
                </Tooltip>
            </div>

            {/* Stats Row */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                <Col xs={12} sm={6}>
                    <Card bordered={false} style={{
                        borderRadius: 14,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        background: 'linear-gradient(135deg, #fff7e6, #fff1b8)',
                    }}>
                        <Statistic
                            title={<Text style={{ fontSize: '12px', color: '#ad6800' }}>New Requests</Text>}
                            value={stats.pendingPickups}
                            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                            valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#ad6800' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false} style={{
                        borderRadius: 14,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        background: 'linear-gradient(135deg, #e6f7ff, #bae7ff)',
                    }}>
                        <Statistic
                            title={<Text style={{ fontSize: '12px', color: '#0050b3' }}>In Progress</Text>}
                            value={stats.activePickups}
                            prefix={<CarOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#0050b3' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false} style={{
                        borderRadius: 14,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        background: 'linear-gradient(135deg, #f6ffed, #d9f7be)',
                    }}>
                        <Statistic
                            title={<Text style={{ fontSize: '12px', color: '#237804' }}>Collected Today</Text>}
                            value={stats.collectedToday}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#237804' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false} style={{
                        borderRadius: 14,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        background: 'linear-gradient(135deg, #f9f0ff, #d3adf7)',
                    }}>
                        <Statistic
                            title={<Text style={{ fontSize: '12px', color: '#391085' }}>Total Assigned</Text>}
                            value={stats.totalAssigned}
                            prefix={<ExperimentOutlined style={{ color: '#722ed1' }} />}
                            valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#391085' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Task List */}
            <Card
                title={
                    <Space>
                        <ExperimentOutlined style={{ color: '#1890ff' }} />
                        <Text strong>My Pickups</Text>
                    </Space>
                }
                extra={
                    <Segmented
                        options={[
                            { label: `New (${pendingOrders.length})`, value: 'pending' },
                            { label: `Active (${acceptedOrders.length})`, value: 'active' },
                            { label: `Done (${collectedOrders.length})`, value: 'collected' },
                        ]}
                        value={activeTab}
                        onChange={(v) => setActiveTab(v as string)}
                        size="small"
                    />
                }
                style={{ borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                loading={loading}
                styles={{ body: { padding: '0' } }}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={displayOrders}
                    locale={{
                        emptyText: (
                            <Empty
                                image={<InboxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
                                description={`No ${activeTab} pickups`}
                                style={{ padding: '40px 0' }}
                            />
                        )
                    }}
                    renderItem={(item) => (
                        <List.Item
                            onClick={() => openDrawer(item)}
                            style={{
                                padding: '16px 20px',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                borderLeft: `4px solid ${getAssignmentColor(item.assignment_status)}`,
                            }}
                            className="agent-pickup-item"
                            actions={[
                                item.assignment_status === 'pending' ? (
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={(e) => { e.stopPropagation(); acceptPickup(item.id); }}
                                        style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: '8px' }}
                                    >
                                        Accept
                                    </Button>
                                ) : item.assignment_status === 'accepted' ? (
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<CarOutlined />}
                                        onClick={(e) => { e.stopPropagation(); startPickup(item.id); }}
                                        style={{ borderRadius: '8px' }}
                                    >
                                        Start
                                    </Button>
                                ) : item.assignment_status === 'picking_up' ? (
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<SendOutlined />}
                                        onClick={(e) => { e.stopPropagation(); markCollected(item.id); }}
                                        style={{ background: '#722ed1', borderColor: '#722ed1', borderRadius: '8px' }}
                                    >
                                        Collected
                                    </Button>
                                ) : (
                                    <Tag color="success" style={{ borderRadius: '8px' }}>
                                        <CheckCircleOutlined /> Done
                                    </Tag>
                                ),
                                <RightOutlined style={{ color: '#bfbfbf' }} />
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space size="small">
                                        <Text strong style={{ fontSize: '14px' }}>{item.order_code}</Text>
                                        {item.priority === 'urgent' && (
                                            <Tag color="error" icon={<ThunderboltOutlined />} style={{ borderRadius: '6px' }}>
                                                URGENT
                                            </Tag>
                                        )}
                                        {item.priority === 'stat' && (
                                            <Tag color="warning" icon={<ThunderboltOutlined />} style={{ borderRadius: '6px' }}>
                                                STAT
                                            </Tag>
                                        )}
                                    </Space>
                                }
                                description={
                                    <div>
                                        <Space size="small" style={{ marginBottom: '4px' }}>
                                            <UserOutlined style={{ color: '#8c8c8c' }} />
                                            <Text>{item.patient?.full_name || 'N/A'}</Text>
                                            {item.patient?.phone && (
                                                <>
                                                    <PhoneOutlined style={{ color: '#8c8c8c', marginLeft: '8px' }} />
                                                    <Text type="secondary">{item.patient.phone}</Text>
                                                </>
                                            )}
                                        </Space>
                                        <div>
                                            <EnvironmentOutlined style={{ color: '#ff4d4f', marginRight: '4px' }} />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {item.address || item.patient?.address || 'No address'}
                                            </Text>
                                        </div>
                                        <div style={{ marginTop: '4px' }}>
                                            <ClockCircleOutlined style={{ color: '#8c8c8c', marginRight: '4px' }} />
                                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                                {dayjs(item.createdAt).format('DD MMM, hh:mm A')}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '11px', marginLeft: '12px' }}>
                                                {item.test_results?.length || 0} test(s)
                                            </Text>
                                            {(item.sample_photo_url || item.signature_url) && (
                                                <Space style={{ marginLeft: '12px' }}>
                                                    {item.sample_photo_url && <FileImageOutlined style={{ color: '#52c41a', fontSize: '12px' }} />}
                                                    {item.signature_url && <EditOutlined style={{ color: '#1890ff', fontSize: '12px' }} />}
                                                </Space>
                                            )}
                                        </div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>

            {/* Detail Drawer */}
            <PickupDetailDrawer
                visible={drawerVisible}
                order={selectedOrder}
                onClose={() => { setDrawerVisible(false); setSelectedOrder(null); }}
                onAccept={async (id) => { await acceptPickup(id); setDrawerVisible(false); }}
                onStartPickup={async (id) => { await startPickup(id); setDrawerVisible(false); }}
                onMarkCollected={async (id, proofData) => { await markCollected(id, proofData); setDrawerVisible(false); }}
            />

            <style>{`
                .agent-pickup-item:hover {
                    background: #fafafa !important;
                }
            `}</style>
        </div>
    );
};

export default AgentDashboard;
