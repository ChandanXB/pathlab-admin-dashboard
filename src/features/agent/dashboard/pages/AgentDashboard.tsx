import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Statistic, List, Tag, Badge, Space, Button, message } from 'antd';
import {
    ExperimentOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CarOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import apiClient from '@/config/apiClient';
import { useAuthStore } from '@/store/authStore';

const { Title, Text } = Typography;

const AgentDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        pendingPickups: 0,
        completedToday: 0,
        totalPickups: 0
    });
    const [assignedTasks, setAssignedTasks] = useState<any[]>([]);

    useEffect(() => {
        if (user?.agentId) {
            fetchDashboardData();
            startLocationTracking();
        }
    }, [user?.agentId]);

    const fetchDashboardData = async () => {
        if (!user?.agentId) return;
        setLoading(true);
        try {
            const [ordersRes] = await Promise.all([
                apiClient.get(`/lab-orders?agent_id=${user.agentId}`)
            ]);

            const orders = ordersRes.data.data;
            setAssignedTasks(orders.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled'));

            // Set stats based on real data
            setStats({
                pendingPickups: orders.filter((o: any) => o.assignment_status === 'pending').length,
                completedToday: orders.filter((o: any) => o.status === 'collected').length,
                totalPickups: orders.length
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const startLocationTracking = () => {
        if (!navigator.geolocation) return;

        const updateLocation = () => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        await apiClient.put(`/collection-agents/${user?.agentId}/location`, { latitude, longitude });
                        console.log('Location updated');
                    } catch (e) {
                        console.error('Failed to update agent location', e);
                    }
                },
                (err) => console.error('Geolocation error', err),
                { enableHighAccuracy: true }
            );
        };

        // Update every 1 minute
        updateLocation();
        const interval = setInterval(updateLocation, 60000);
        return () => clearInterval(interval);
    };

    const handleAcceptAssignment = async (id: number) => {
        try {
            await apiClient.put(`/lab-orders/${id}/assignment-status`, { assignment_status: 'accepted' });
            message.success('Pickup accepted!');
            fetchDashboardData();
        } catch (error) {
            message.error('Failed to accept assignment');
        }
    };

    const handleMarkCollected = async (id: number) => {
        try {
            await apiClient.put(`/lab-orders/${id}`, { status: 'collected' });
            await apiClient.put(`/lab-orders/${id}/assignment-status`, { assignment_status: 'collected' });
            message.success('Sample marked as collected');
            fetchDashboardData();
        } catch (error) {
            message.error('Failed to update status');
        }
    };

    return (
        <div style={{ padding: '4px' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={3}>Welcome back, {user?.name}!</Title>
                <Text type="secondary">Here is an overview of your collection tasks today.</Text>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Current Tasks"
                            value={stats.pendingPickups}
                            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Completed Today"
                            value={stats.completedToday}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="My Vehicle"
                            value="DL-12C-4567"
                            prefix={<CarOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={<Space><ExperimentOutlined /> <Text strong>Active Assignments</Text></Space>}
                style={{ marginTop: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                loading={loading}
                extra={<Button type="link" href="/agent/pickups">View History</Button>}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={assignedTasks}
                    locale={{ emptyText: 'No assigned tasks for today.' }}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                item.assignment_status === 'pending' ? (
                                    <Button type="primary" size="small" onClick={() => handleAcceptAssignment(item.id)} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                                        Accept Pickup
                                    </Button>
                                ) : (
                                    <Button type="primary" size="small" disabled={item.status === 'collected'} onClick={() => handleMarkCollected(item.id)}>
                                        {item.status === 'collected' ? 'Collected' : 'Mark Collected'}
                                    </Button>
                                )
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <Text strong>{item.order_code}</Text>
                                        {item.priority === 'urgent' && <Tag color="error">URGENT</Tag>}
                                        <Tag color={
                                            item.assignment_status === 'pending' ? 'gold' :
                                                item.assignment_status === 'accepted' ? 'processing' : 'success'
                                        }>
                                            {item.assignment_status?.toUpperCase() || 'ASSIGNED'}
                                        </Tag>
                                    </Space>
                                }
                                description={
                                    <div>
                                        <Text strong>{item.patient?.full_name}</Text>
                                        <br />
                                        <Text type="secondary"><EnvironmentOutlined /> {item.address}</Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default AgentDashboard;
