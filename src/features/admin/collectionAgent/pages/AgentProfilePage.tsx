import React, { useState, useEffect } from 'react';
import {
    Typography,
    Tag,
    Space,
    Divider,
    Descriptions,
    Badge,
    Card,
    Tabs,
    List,
    Avatar,
    Empty,
    Row,
    Col,
    Statistic,
    Breadcrumb,
    Button,
    message,
    Spin
} from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    CarOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    BarcodeOutlined,
    InfoCircleOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { collectionAgentService, type CollectionAgent } from '../services/collectionAgentService';

const { Title, Text } = Typography;

const AgentProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [agent, setAgent] = useState<CollectionAgent | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAgentDetails = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await collectionAgentService.getAgentById(Number(id));
            setAgent(response.data);
        } catch (error) {
            message.error('Failed to fetch agent details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgentDetails();
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" tip="Loading Agent Details..." />
            </div>
        );
    }

    if (!agent) {
        return (
            <div style={{ padding: '24px' }}>
                <Empty description="Agent not found" />
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/collection-agents')}>
                    Back to Agents
                </Button>
            </div>
        );
    }

    const stats = {
        total: agent.lab_orders?.length || 0,
        pending: agent.lab_orders?.filter(o => o.status === 'pending').length || 0,
        collected: agent.lab_orders?.filter(o => o.status === 'collected').length || 0,
        completed: agent.lab_orders?.filter(o => o.status === 'completed').length || 0,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'collected': return 'blue';
            case 'completed': return 'green';
            case 'cancelled': return 'red';
            default: return 'default';
        }
    };

    return (
        <div style={{
            padding: '0 0 24px 0',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden'
        }}>
            <div style={{ marginBottom: '16px' }}>
                <Breadcrumb
                    items={[
                        { title: <Link to="/">Dashboard</Link> },
                        { title: <Link to="/collection-agents">Collection Agents</Link> },
                        { title: agent.name },
                    ]}
                />
            </div>

            <Card style={{ marginBottom: '24px', borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} sm={4} md={3} lg={2} style={{ textAlign: 'center' }}>
                        <Avatar
                            size={80}
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#1890ff', boxShadow: '0 4px 12px rgba(24,144,255,0.3)' }}
                        />
                    </Col>
                    <Col xs={24} sm={20} md={13} lg={14}>
                        <Space direction="vertical" size={0}>
                            <Title level={2} style={{ margin: 0 }}>{agent.name}</Title>
                            <Space split={<Divider type="vertical" />} wrap>
                                <Text type="secondary"><BarcodeOutlined /> ID: AG-{agent.id.toString().padStart(4, '0')}</Text>
                                <Tag color={agent.status === 'active' ? 'green' : 'red'}>
                                    {agent.status.toUpperCase()}
                                </Tag>
                            </Space>
                        </Space>
                    </Col>
                    <Col xs={24} md={8} lg={8}>
                        <Row gutter={32} justify="end">
                            <Col>
                                <Statistic title="Total Tasks" value={stats.total} />
                            </Col>
                            <Col>
                                <Statistic title="Pending" value={stats.pending} valueStyle={{ color: '#faad14' }} />
                            </Col>
                            <Col>
                                <Statistic title="Completed" value={stats.completed} valueStyle={{ color: '#52c41a' }} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            <Tabs
                type="card"
                defaultActiveKey="overview"
                items={[
                    {
                        key: 'overview',
                        label: <span><InfoCircleOutlined /> Overview</span>,
                        children: (
                            <Row gutter={[24, 24]}>
                                <Col xs={24} xl={16}>
                                    <Card title="Detailed Information" bordered={false} style={{ borderRadius: '12px' }}>
                                        <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }} bordered size="middle">
                                            <Descriptions.Item label="Full Name">{agent.name}</Descriptions.Item>
                                            <Descriptions.Item label="Phone"><Space><PhoneOutlined /> {agent.phone}</Space></Descriptions.Item>
                                            <Descriptions.Item label="Email"><Space><MailOutlined /> {agent.email || 'N/A'}</Space></Descriptions.Item>
                                            <Descriptions.Item label="Status">
                                                <Badge status={agent.status === 'active' ? 'success' : 'error'} text={agent.status.toUpperCase()} />
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Vehicle Type"><Space><CarOutlined /> {agent.vehicle_type || 'N/A'}</Space></Descriptions.Item>
                                            <Descriptions.Item label="Vehicle No">{agent.vehicle_no || 'N/A'}</Descriptions.Item>
                                            <Descriptions.Item label="Joined On">{dayjs(agent.createdAt).format('DD MMMM YYYY')}</Descriptions.Item>
                                            <Descriptions.Item label="Address" span={2}>
                                                <Space align="start">
                                                    <EnvironmentOutlined style={{ marginTop: '4px', color: '#ff4d4f' }} />
                                                    {agent.address || 'N/A'}
                                                </Space>
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>
                                <Col xs={24} xl={8}>
                                    <Card title="Quick Stats" bordered={false} style={{ borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                                                <Text type="secondary">Collection Efficiency</Text>
                                                <div style={{ fontSize: '24px', fontWeight: 600, color: '#52c41a' }}>
                                                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                                                </div>
                                            </div>
                                            <div style={{ background: '#e6f7ff', padding: '16px', borderRadius: '8px', border: '1px solid #91d5ff' }}>
                                                <Text type="secondary">Active Deliveries</Text>
                                                <div style={{ fontSize: '24px', fontWeight: 600, color: '#1890ff' }}>
                                                    {stats.pending + stats.collected}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        )
                    },
                    {
                        key: 'tasks',
                        label: <span><CheckCircleOutlined /> Assigned Tasks</span>,
                        children: (
                            <Card bordered={false} style={{ borderRadius: '12px' }}>
                                <List
                                    grid={{ gutter: 16, xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                                    dataSource={agent.lab_orders || []}
                                    renderItem={(order: any) => (
                                        <List.Item>
                                            <Card
                                                size="small"
                                                hoverable
                                                style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}
                                                title={
                                                    <Space>
                                                        <BarcodeOutlined />
                                                        <Text strong>{order.order_code}</Text>
                                                    </Space>
                                                }
                                                extra={<Tag color={getStatusColor(order.status)}>{order.status.toUpperCase()}</Tag>}
                                            >
                                                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Space><UserOutlined style={{ color: '#8c8c8c' }} /> <Text>{order.patient?.full_name}</Text></Space>
                                                        <Text strong>₹{order.total_amount}</Text>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Space><ClockCircleOutlined style={{ color: '#8c8c8c' }} /> <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(order.createdAt).format('DD MMM, hh:mm A')}</Text></Space>
                                                        <Tag color={order.payment_status === 'paid' ? 'green' : 'gold'} style={{ fontSize: '10px' }}>{order.payment_status.toUpperCase()}</Tag>
                                                    </div>
                                                </Space>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        )
                    }
                ]}
            />
        </div>
    );
};

export default AgentProfilePage;
