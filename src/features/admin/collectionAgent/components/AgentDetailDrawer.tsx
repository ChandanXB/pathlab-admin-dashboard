import React from 'react';
import {
    Drawer,
    Typography,
    Tag,
    Space,
    Divider,
    Descriptions,
    Card,
    Tabs,
    List,
    Avatar,
    Empty,
    Row,
    Col,
    Statistic
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
    InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { CollectionAgent } from '../services/collectionAgentService';

const { Title, Text } = Typography;

interface AgentDetailDrawerProps {
    visible: boolean;
    agent: CollectionAgent | null;
    onClose: () => void;
}

const AgentDetailDrawer: React.FC<AgentDetailDrawerProps> = ({ visible, agent, onClose }) => {
    if (!agent) return null;

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
        <Drawer
            title={
                <Space>
                    {agent.profile_image ? (
                        <Avatar src={agent.profile_image} size="large" />
                    ) : (
                        <Avatar icon={<UserOutlined />} size="large" style={{ backgroundColor: '#1890ff' }} />
                    )}
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>{agent.name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>ID: AG-{agent.id.toString().padStart(4, '0')}</Text>
                    </div>
                </Space>
            }
            placement="right"
            width={550}
            onClose={onClose}
            open={visible}
            bodyStyle={{ padding: '0px' }}
        >
            {/* Header Status Bar */}
            <div style={{ padding: '16px 24px', background: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Statistic
                            title="Total Tasks"
                            value={stats.total}
                            valueStyle={{ fontSize: '18px', fontWeight: 600 }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: '#faad14' }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Collected"
                            value={stats.collected}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: '#1890ff' }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Completed"
                            value={stats.completed}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: '#52c41a' }}
                        />
                    </Col>
                </Row>
            </div>

            <Tabs
                defaultActiveKey="overview"
                style={{ padding: '0 24px' }}
                items={[
                    {
                        key: 'overview',
                        label: (
                            <span>
                                <InfoCircleOutlined />
                                Overview
                            </span>
                        ),
                        children: (
                            <div style={{ paddingTop: '16px', paddingBottom: '24px' }}>
                                <Descriptions title="Basic Information" column={1} bordered size="small">
                                    <Descriptions.Item label="Full Name">{agent.name}</Descriptions.Item>
                                    <Descriptions.Item label="Phone Number">
                                        <Space><PhoneOutlined /> {agent.phone}</Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email Address">
                                        <Space><MailOutlined /> {agent.email || 'N/A'}</Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        <Tag color={agent.status === 'active' ? 'green' : 'red'}>
                                            {agent.status.toUpperCase()}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>

                                <Divider style={{ margin: '24px 0' }} />

                                <Descriptions title="Vehicle Details" column={1} bordered size="small">
                                    <Descriptions.Item label="Vehicle Type">
                                        <Space><CarOutlined /> {agent.vehicle_type || 'N/A'}</Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Vehicle No">
                                        {agent.vehicle_no || 'N/A'}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Divider style={{ margin: '24px 0' }} />

                                <Descriptions title="Current Address" column={1} bordered size="small">
                                    <Descriptions.Item label="Address">
                                        <Space align="start">
                                            <EnvironmentOutlined style={{ marginTop: '4px' }} />
                                            {agent.address || 'N/A'}
                                        </Space>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        )
                    },
                    {
                        key: 'tasks',
                        label: (
                            <span>
                                <CheckCircleOutlined />
                                Assigned Tasks
                            </span>
                        ),
                        children: (
                            <div style={{ paddingTop: '16px', paddingBottom: '24px' }}>
                                <Title level={5}>Assigned Lab Orders</Title>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={agent.lab_orders || []}
                                    locale={{ emptyText: <Empty description="No tasks assigned yet" /> }}
                                    renderItem={(order: any) => (
                                        <Card
                                            size="small"
                                            style={{ marginBottom: '12px', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                                            hoverable
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Space direction="vertical" size={2}>
                                                    <Space>
                                                        <BarcodeOutlined style={{ color: '#8c8c8c' }} />
                                                        <Text strong>{order.order_code}</Text>
                                                        <Tag color={getStatusColor(order.status)} style={{ borderRadius: '10px' }}>
                                                            {order.status.toUpperCase()}
                                                        </Tag>
                                                    </Space>
                                                    <Space>
                                                        <UserOutlined style={{ color: '#8c8c8c' }} />
                                                        <Text style={{ fontSize: '13px' }}>{order.patient?.full_name || 'N/A'}</Text>
                                                    </Space>
                                                    <Space>
                                                        <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            {dayjs(order.createdAt).format('DD MMM, hh:mm A')}
                                                        </Text>
                                                    </Space>
                                                </Space>
                                                <div style={{ textAlign: 'right' }}>
                                                    <Text strong style={{ display: 'block' }}>₹{order.total_amount}</Text>
                                                    <Text type="secondary" style={{ fontSize: '11px' }}>{order.payment_status.toUpperCase()}</Text>
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                />
                            </div>
                        )
                    }
                ]}
            />
        </Drawer>
    );
};

export default AgentDetailDrawer;
