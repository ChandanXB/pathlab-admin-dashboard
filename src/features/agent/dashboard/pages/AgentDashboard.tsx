import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, List, Tag, Space, Button, Empty, Segmented } from 'antd';
import {
    ExperimentOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CarOutlined,
    EnvironmentOutlined,
    UserOutlined,
    RightOutlined,
    SendOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import colors from '@/styles/colors';
import { useAgentOrders } from '../../hooks/useAgentOrders';
import { useAuthStore } from '@/store/authStore';
import PickupDetailDrawer from '../../components/PickupDetailDrawer';
import { WeeklyTrendsChart, ActivityDistributionChart, PerformanceSummaryChart, PriorityBreakdownChart } from '../components/DashboardCharts';
import type { AgentOrder } from '../../services/agentOrderService';

const { Title, Text } = Typography;

const AgentDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const {
        orders,
        activeOrders,
        pendingOrders,
        acceptedOrders,
        collectedOrders,
        loading,
        stats,
        profile,
        acceptPickup,
        startPickup,
        markReached,
        markCollected,
    } = useAgentOrders();

    const [selectedOrder, setSelectedOrder] = useState<AgentOrder | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('active');
    const [screenSize, setScreenSize] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            pending: colors.status.pending,
            accepted: colors.status.collected, // Reusing collected blue for accepted
            picking_up: colors.status.processing,
            collected: colors.status.completed,
        };
        return map[status || ''] || colors.charts.text;
    };

    return (
        <div style={{ padding: '24px', minHeight: '100%', background: colors.background }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Welcome Header */}
                <div style={{
                    marginBottom: 32,
                    background: `linear-gradient(135deg, ${colors.info} 0%, ${colors.layout.agentSidebarEnd} 100%)`,
                    borderRadius: '24px',
                    padding: '40px',
                    color: colors.white,
                    display: 'flex',
                    flexDirection: screenSize < 576 ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: screenSize < 576 ? 'flex-start' : 'center',
                    boxShadow: '0 12px 40px rgba(24, 144, 255, 0.25)',
                    position: 'relative',
                    overflow: 'hidden',
                    gap: screenSize < 576 ? '24px' : '0'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: -60,
                        right: -60,
                        width: 240,
                        height: 240,
                        background: colors.sidebarBorder,
                        borderRadius: '50%',
                        filter: 'blur(50px)',
                        zIndex: 0
                    }} />

                    <div style={{ zIndex: 1, flex: 1 }}>
                        <Title level={2} style={{ color: '#fff', margin: 0, fontSize: screenSize < 768 ? '24px' : '32px', fontWeight: 700 }}>
                            {(() => {
                                const hour = dayjs().hour();
                                if (hour < 12) return 'Good Morning';
                                if (hour < 17) return 'Good Afternoon';
                                return 'Good Evening';
                            })()}, {user?.name.split(' ')[0]}! 👋
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', display: 'block', marginTop: '4px' }}>
                            {dayjs().format('dddd, DD MMMM YYYY')} • Agent Dashboard
                        </Text>
                        {profile?.vehicle_no && (
                            <div style={{ marginTop: '20px' }}>
                                <Tag icon={<CarOutlined />} style={{
                                    background: `${colors.white}${colors.alpha.badgeBg}`,
                                    color: colors.white,
                                    fontWeight: 500,
                                    borderRadius: '100px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    padding: '6px 16px',
                                    fontSize: '13px'
                                }}>
                                    {profile.vehicle_type || 'Vehicle'}: {profile.vehicle_no}
                                </Tag>
                            </div>
                        )}
                    </div>

                    <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            borderRadius: '20px',
                            background: `${colors.white}${colors.alpha.badgeGlow}`,
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${colors.sidebarBorder}`,
                            fontSize: '24px'
                        }}>
                            <UserOutlined />
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
                    <Col xs={12} sm={6}>
                        <Card bordered={false} hoverable style={{
                            borderRadius: 24,
                            boxShadow: `0 8px 24px ${colors.cardShadow}`,
                            background: colors.white,
                        }} styles={{ body: { padding: '24px' } }}>
                            <Space direction="vertical" size={0}>
                                <div style={{ width: 48, height: 48, borderRadius: '14px', background: colors.stats.revenue, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <ClockCircleOutlined style={{ color: colors.status.pending, fontSize: '24px' }} />
                                </div>
                                <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>New Requests</Text>
                                <Title level={2} style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 700 }}>{stats.pendingPickups}</Title>
                            </Space>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card bordered={false} hoverable style={{
                            borderRadius: 24,
                            boxShadow: `0 8px 24px ${colors.cardShadow}`,
                            background: colors.white,
                        }} styles={{ body: { padding: '24px' } }}>
                            <Space direction="vertical" size={0}>
                                <div style={{ width: 48, height: 48, borderRadius: '14px', background: colors.charts.volumeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <CarOutlined style={{ color: colors.info, fontSize: '24px' }} />
                                </div>
                                <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>In Progress</Text>
                                <Title level={2} style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 700 }}>{stats.activePickups}</Title>
                            </Space>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card bordered={false} hoverable style={{
                            borderRadius: 24,
                            boxShadow: `0 8px 24px ${colors.cardShadow}`,
                            background: colors.white,
                        }} styles={{ body: { padding: '24px' } }}>
                            <Space direction="vertical" size={0}>
                                <div style={{ width: 48, height: 48, borderRadius: '14px', background: colors.stats.tests, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <CheckCircleOutlined style={{ color: colors.success, fontSize: '24px' }} />
                                </div>
                                <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>Collected Today</Text>
                                <Title level={2} style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 700 }}>{stats.collectedToday}</Title>
                            </Space>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card bordered={false} hoverable style={{
                            borderRadius: 24,
                            boxShadow: `0 8px 24px ${colors.cardShadow}`,
                            background: colors.white,
                        }} styles={{ body: { padding: '24px' } }}>
                            <Space direction="vertical" size={0}>
                                <div style={{ width: 48, height: 48, borderRadius: '14px', background: colors.stats.revenue, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <ExperimentOutlined style={{ color: colors.status.processing, fontSize: '24px' }} />
                                </div>
                                <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>Total Assigned</Text>
                                <Title level={2} style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 700 }}>{stats.totalAssigned}</Title>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                {/* Performance Graphs Row 1 */}
                <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
                    <Col xs={24} lg={16} style={{ display: 'flex' }}>
                        <WeeklyTrendsChart orders={orders} />
                    </Col>
                    <Col xs={24} lg={8} style={{ display: 'flex' }}>
                        <ActivityDistributionChart orders={orders} />
                    </Col>
                </Row>

                {/* Performance Graphs Row 2 */}
                <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
                    <Col xs={24} lg={10} style={{ display: 'flex' }}>
                        <PerformanceSummaryChart orders={orders} />
                    </Col>
                    <Col xs={24} lg={14} style={{ display: 'flex' }}>
                        <PriorityBreakdownChart orders={orders} />
                    </Col>
                </Row>

                {/* Task List */}
                <Card
                    title={
                        <Space size="middle">
                            <div style={{ padding: '8px', background: colors.charts.volumeBg, borderRadius: '12px' }}>
                                <ExperimentOutlined style={{ color: colors.info, fontSize: '20px' }} />
                            </div>
                            <Text strong style={{ fontSize: '20px' }}>Current Pickups</Text>
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
                            style={{ background: colors.background, padding: '4px', borderRadius: '12px' }}
                        />
                    }
                    style={{ borderRadius: 28, boxShadow: `0 8px 32px ${colors.cardShadow}`, border: 'none' }}
                    loading={loading}
                    styles={{ body: { padding: '0' } }}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={displayOrders}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={<InboxOutlined style={{ fontSize: 48, color: colors.charts.text }} />}
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
                                            style={{ borderRadius: '12px', fontWeight: 600 }}
                                        >
                                            Accept
                                        </Button>
                                    ) : item.assignment_status === 'accepted' ? (
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); startPickup(item.id); }}
                                            style={{ background: colors.success, borderColor: colors.success, borderRadius: '12px', fontWeight: 600 }}
                                        >
                                            Start
                                        </Button>
                                    ) : item.assignment_status === 'picking_up' ? (
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<SendOutlined />}
                                            onClick={(e) => { e.stopPropagation(); markCollected(item.id); }}
                                            style={{ background: colors.status.processing, borderColor: colors.status.processing, borderRadius: '12px', fontWeight: 600 }}
                                        >
                                            Collected
                                        </Button>
                                    ) : (
                                        <Tag color="success" style={{ borderRadius: '10px', padding: '2px 10px', border: 'none', background: colors.stats.tests }}>
                                            <Space size={4}><CheckCircleOutlined /> <Text strong style={{ color: colors.success, fontSize: '12px' }}>Done</Text></Space>
                                        </Tag>
                                    ),
                                    <RightOutlined style={{ color: colors.charts.text, fontSize: '12px' }} />
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space size="small">
                                            <Text strong style={{ fontSize: '15px', color: colors.textDark }}>{item.order_code}</Text>
                                            {item.priority === 'urgent' && (
                                                <Tag color="error" style={{ borderRadius: '6px', border: 'none', fontWeight: 600 }}>
                                                    URGENT
                                                </Tag>
                                            )}
                                        </Space>
                                    }
                                    description={
                                        <div style={{ marginTop: '4px' }}>
                                            <Space size="small" style={{ marginBottom: '6px' }}>
                                                <UserOutlined style={{ color: colors.charts.text }} />
                                                <Text style={{ color: colors.textDark, opacity: 0.85 }}>{item.patient?.full_name || 'N/A'}</Text>
                                                {item.patient?.phone && (
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>• {item.patient.phone}</Text>
                                                )}
                                            </Space>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                                <EnvironmentOutlined style={{ color: colors.danger, marginTop: '3px' }} />
                                                <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                                    {item.address || item.patient?.address || 'No address'}
                                                </Text>
                                            </div>
                                            <div style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
                                                <Space size={4}>
                                                    <ClockCircleOutlined style={{ color: colors.charts.text, fontSize: '12px' }} />
                                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                                        {dayjs(item.createdAt).format('DD MMM, hh:mm A')}
                                                    </Text>
                                                </Space>
                                                <Space size={4}>
                                                    <ExperimentOutlined style={{ color: colors.charts.text, fontSize: '12px' }} />
                                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                                        {item.test_results?.length || 0} Test(s)
                                                    </Text>
                                                </Space>
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
                    onMarkReached={async (id) => { await markReached(id); setDrawerVisible(false); }}
                    onMarkCollected={async (id, proofData) => { await markCollected(id, proofData); setDrawerVisible(false); }}
                />

                <style>{`
                .agent-pickup-item:hover {
                    background: ${colors.background} !important;
                }
                .agent-pickup-item {
                    border-bottom: 1px solid ${colors.borderLight} !important;
                }
            `}</style>
            </div>
        </div>
    );
};

export default AgentDashboard;
