import React from 'react';
import { Row, Col, Card, Typography, Statistic, Button, Space } from 'antd';
import {
    UserOutlined,
    CheckCircleOutlined,
    MedicineBoxOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import colors from '@/styles/colors';

const { Title, Text } = Typography;

const DoctorDashboard: React.FC = () => {
    const { user } = useAuthStore();

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Welcome, Dr. {user?.name}</Title>
                <Text type="secondary">Here is an overview of your medical practice.</Text>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm" style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Hospital Patients"
                            value={56}
                            prefix={<MedicineBoxOutlined style={{ color: colors.info }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm" style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Total Patients"
                            value={124}
                            prefix={<UserOutlined style={{ color: colors.success }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm" style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Completed Today"
                            value={3}
                            prefix={<CheckCircleOutlined style={{ color: colors.warning }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm" style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Pending Reports"
                            value={5}
                            prefix={<MedicineBoxOutlined style={{ color: colors.danger }} />}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card
                        title="Recent Activity"
                        bordered={false}
                        className="shadow-sm"
                        style={{ borderRadius: 12 }}
                    >
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Text type="secondary">Patient interaction history will appear here.</Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Quick Actions" bordered={false} className="shadow-sm" style={{ borderRadius: 12 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button block size="large">Write Prescription</Button>
                            <Button block size="large">View Lab Reports</Button>
                            <Button block size="large">Update Availability</Button>
                            <Button block size="large">Messaging Hub</Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DoctorDashboard;
