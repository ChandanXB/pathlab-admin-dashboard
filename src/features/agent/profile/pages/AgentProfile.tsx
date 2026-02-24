import React from 'react';
import { Typography, Card, Descriptions, Tag, Avatar, Row, Col, Statistic, Divider, Space, Spin } from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    CarOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExperimentOutlined,
    IdcardOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useAgentOrders } from '../../hooks/useAgentOrders';

const { Title, Text } = Typography;

const AgentProfile: React.FC = () => {
    const { user } = useAuthStore();
    const { profile, stats, loading } = useAgentOrders();

    if (loading && !profile) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '4px', maxWidth: 800, margin: '0 auto' }}>
            {/* Profile Header Card */}
            <Card
                style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}
                styles={{ body: { padding: 0 } }}
            >
                {/* Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 60%, #0050b3 100%)',
                    padding: '32px 28px 48px',
                    position: 'relative',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Avatar
                            size={72}
                            icon={<UserOutlined />}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: '3px solid rgba(255,255,255,0.4)',
                                fontSize: '32px',
                            }}
                        />
                        <div>
                            <Title level={3} style={{ color: '#fff', margin: 0 }}>
                                {user?.name || profile?.name || 'Agent'}
                            </Title>
                            <Space>
                                <Tag color="rgba(255,255,255,0.25)" style={{ color: '#fff', borderRadius: '8px', border: 'none' }}>
                                    <IdcardOutlined /> Collection Agent
                                </Tag>
                                <Tag color={profile?.status === 'active' ? '#52c41a' : '#faad14'} style={{ borderRadius: '8px' }}>
                                    {profile?.status?.toUpperCase() || 'ACTIVE'}
                                </Tag>
                            </Space>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div style={{
                    padding: '20px 28px',
                    background: '#fafafa',
                    borderTop: '1px solid #f0f0f0',
                }}>
                    <Row gutter={[24, 16]}>
                        <Col xs={8}>
                            <Statistic
                                title={<Text style={{ fontSize: '12px' }}>Total Assigned</Text>}
                                value={stats.totalAssigned}
                                prefix={<ExperimentOutlined style={{ color: '#722ed1' }} />}
                                valueStyle={{ fontSize: '22px', fontWeight: 700 }}
                            />
                        </Col>
                        <Col xs={8}>
                            <Statistic
                                title={<Text style={{ fontSize: '12px' }}>In Progress</Text>}
                                value={stats.activePickups + stats.pendingPickups}
                                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                                valueStyle={{ fontSize: '22px', fontWeight: 700 }}
                            />
                        </Col>
                        <Col xs={8}>
                            <Statistic
                                title={<Text style={{ fontSize: '12px' }}>Collected Today</Text>}
                                value={stats.collectedToday}
                                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ fontSize: '22px', fontWeight: 700 }}
                            />
                        </Col>
                    </Row>
                </div>
            </Card>

            {/* Contact Info */}
            <Card
                title={
                    <Space><UserOutlined style={{ color: '#1890ff' }} /><Text strong>Contact Information</Text></Space>
                }
                style={{ borderRadius: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
                <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ color: '#8c8c8c', fontWeight: 500 }}>
                    <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
                        <Text strong>{profile?.phone || user?.email || 'N/A'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<><MailOutlined /> Email</>}>
                        <Text>{profile?.email || user?.email || 'N/A'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<><EnvironmentOutlined /> Address</>} span={2}>
                        <Text>{profile?.address || 'Not set'}</Text>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Vehicle Info */}
            <Card
                title={
                    <Space><CarOutlined style={{ color: '#1890ff' }} /><Text strong>Vehicle Information</Text></Space>
                }
                style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
                <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ color: '#8c8c8c', fontWeight: 500 }}>
                    <Descriptions.Item label="Vehicle Type">
                        <Tag color="blue" style={{ borderRadius: '8px' }}>
                            {profile?.vehicle_type || 'Not set'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Vehicle Number">
                        <Text strong style={{ fontSize: '16px', letterSpacing: '1px' }}>
                            {profile?.vehicle_no || 'Not set'}
                        </Text>
                    </Descriptions.Item>
                </Descriptions>
                {profile?.latitude && profile?.longitude && (
                    <>
                        <Divider style={{ margin: '12px 0' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            <EnvironmentOutlined /> Last known location: {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
                        </Text>
                    </>
                )}
            </Card>
        </div>
    );
};

export default AgentProfile;
