import React from 'react';
import {
    Typography,
    Row,
    Col,
    Breadcrumb,
    Spin
} from 'antd';
import {
    CreditCardOutlined,
    UserOutlined,
    ExperimentOutlined,
    FileTextOutlined
} from '@ant-design/icons';

import StatCard from '@/shared/components/StatCard';
import { useDashboardStats } from '../hooks/useDashboardStats';
import {
    OrderStatusDistribution,
    WeeklyOrderTrend,
    OperationsEfficiency,
    RevenueTrends
} from '../components/AdminCharts';
import '@/styles/features/dashboard.css';

const { Title } = Typography;

const Dashboard: React.FC = () => {
    const { stats, loading, error } = useDashboardStats();

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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <Spin size="large" tip="Loading Intelligence Data..." />
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <Breadcrumb items={[
                    { title: 'Home' },
                    { title: 'Dashboard' }
                ]} />
                <Title level={2} style={{ marginTop: 8 }}>Admin Analytics</Title>
            </div>

            {/* Stats Section */}
            <Row gutter={[24, 24]}>
                {statsCards.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <StatCard data={stat} />
                    </Col>
                ))}
            </Row>

            {/* Charts Section */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={8}>
                    <OrderStatusDistribution statusCounts={stats.statusCounts} recentOrders={stats.recentOrders} />
                </Col>
                <Col xs={24} lg={8}>
                    <WeeklyOrderTrend statusCounts={stats.statusCounts} recentOrders={stats.recentOrders} />
                </Col>
                <Col xs={24} lg={8}>
                    <OperationsEfficiency
                        statusCounts={stats.statusCounts}
                        recentOrders={stats.recentOrders}
                        isError={!!error}
                    />
                </Col>
            </Row>

            {/* Bottom Row - Revenue Analytics */}
            <Row gutter={[24, 24]} style={{ marginTop: 24, marginBottom: 24 }}>
                <Col span={24}>
                    <RevenueTrends
                        statusCounts={stats.statusCounts}
                        recentOrders={stats.recentOrders}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
