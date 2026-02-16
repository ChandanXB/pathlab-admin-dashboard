import React from 'react';
import { Typography, Card, Row, Col, Statistic, List, Tag, Badge, Space, Button } from 'antd';
import {
    ExperimentOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CarOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';

const { Title, Text } = Typography;

const AgentDashboard: React.FC = () => {
    const { user } = useAuthStore();

    // Mock data for now
    const stats = {
        pendingPickups: 3,
        completedToday: 5,
        totalPickups: 125,
    };

    const recentTasks = [
        { id: 1, orderCode: 'ORD-12345', patient: 'John Doe', address: '123 Street, City', status: 'pending', priority: 'urgent' },
        { id: 2, orderCode: 'ORD-12346', patient: 'Jane Smith', address: '456 Avenue, City', status: 'pending', priority: 'normal' },
        { id: 3, orderCode: 'ORD-12347', patient: 'Bob Wilson', address: '789 Road, City', status: 'collected', priority: 'normal' },
    ];

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
                title={<Space><ExperimentOutlined /> <Text strong>Today's Assigned Pickups</Text></Space>}
                style={{ marginTop: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                extra={<Button type="link">View All</Button>}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={recentTasks}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button type="primary" size="small" disabled={item.status === 'collected'}>
                                    {item.status === 'pending' ? 'Mark Collected' : 'Collected'}
                                </Button>
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <Text strong>{item.orderCode}</Text>
                                        {item.priority === 'urgent' && <Tag color="error">URGENT</Tag>}
                                        <Badge status={item.status === 'pending' ? 'processing' : 'success'} text={item.status.toUpperCase()} />
                                    </Space>
                                }
                                description={
                                    <div>
                                        <Text strong>{item.patient}</Text>
                                        <br />
                                        <Text type="secondary">{item.address}</Text>
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
