import React, { useState, useEffect } from 'react';
import {
    Typography,
    Card,
    Row,
    Col,
    Button,
    Space,
    Breadcrumb,
    Divider,
    theme
} from 'antd';
import {
    UserOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    CreditCardOutlined
} from '@ant-design/icons';

// Externalized Resources
import colors from '@/styles/colors';
import { systemHealthMetrics, quickActions } from '@/shared/data/dashboardData';
import StatCard from '@/shared/components/StatCard';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const stats = {
        totalPatients: 0,
        activeTests: 0,
        pendingReports: 0,
        totalRevenue: 0
    };

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const statsCards = [
        {
            title: 'Total Patients',
            value: stats.totalPatients.toLocaleString(),
            trend: '+0%',
            isUp: true,
            icon: <UserOutlined style={{ fontSize: 24 }} />,
            color: '#e6f7ff',
            iconColor: '#1890ff'
        },
        {
            title: 'Active Tests',
            value: stats.activeTests.toLocaleString(),
            trend: '+0%',
            isUp: true,
            icon: <ExperimentOutlined style={{ fontSize: 24 }} />,
            color: '#f6ffed',
            iconColor: '#52c41a'
        },
        {
            title: 'Pending Reports',
            value: stats.pendingReports.toLocaleString(),
            trend: '-0%',
            isUp: false,
            icon: <FileTextOutlined style={{ fontSize: 24 }} />,
            color: '#fff1f0',
            iconColor: '#ff4d4f'
        },
        {
            title: 'Total Revenue',
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            trend: '+0%',
            isUp: true,
            icon: <CreditCardOutlined style={{ fontSize: 24 }} />,
            color: '#fffbe6',
            iconColor: '#faad14'
        }
    ];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', height: '100%', overflow: 'auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Breadcrumb items={[
                    { title: 'Home' },
                    { title: 'Dashboard' }
                ]} />
                <Title level={2} style={{ marginTop: 8 }}>Dashboard Overview</Title>
            </div>

            {/* Stats Section */}
            <Row gutter={[24, 24]}>
                {statsCards.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <StatCard data={stat} />
                    </Col>
                ))}
            </Row>

            {/* Content Section */}
            <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <Card
                        title={<Text strong style={{ fontSize: screenSize < 576 ? 16 : 18 }}>Recent Activity</Text>}
                        bordered={false}
                        style={{ borderRadius: 16, boxShadow: `0 4px 12px ${colors.cardShadow}` }}
                    >
                        <div style={{ padding: '40px 0', textAlign: 'center' }}>
                            <ExperimentOutlined style={{ fontSize: 48, color: colors.primary, opacity: 0.2 }} />
                            <div style={{ marginTop: 16, color: '#888' }}>Activity monitoring will appear here</div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title={<Text strong style={{ fontSize: screenSize < 576 ? 16 : 18 }}>System Health</Text>}
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            boxShadow: `0 4px 12px ${colors.cardShadow}`,
                            height: '100%',
                            marginTop: screenSize < 992 ? 16 : 0
                        }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                            {systemHealthMetrics.map((metric, idx) => (
                                <div key={idx}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text>{metric.label}</Text>
                                        <Text strong>{metric.value}</Text>
                                    </div>
                                    <div style={{ height: 8, background: colors.background, borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{ width: `${metric.percent}%`, height: '100%', background: metric.color }} />
                                    </div>
                                </div>
                            ))}

                            <Divider style={{ margin: '12px 0' }} />

                            <div style={{ padding: '4px 0' }}>
                                <Text strong>Quick Actions</Text>
                                <Row gutter={[8, 8]} style={{ marginTop: 12 }}>
                                    {quickActions.map((action, idx) => (
                                        <Col xs={12} sm={6} lg={12} key={idx}>
                                            <Button block style={{ borderRadius: 8, fontSize: screenSize < 576 ? 12 : 14 }}>
                                                {action.label}
                                            </Button>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .stat-card:hover {
                    transform: translateY(-5px);
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.05) !important;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
