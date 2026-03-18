import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Statistic, Button, Space, Table, Tag, message } from 'antd';
import {
    UserOutlined,
    CheckCircleOutlined,
    MedicineBoxOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import colors from '@/styles/colors';
import apiClient from '@/config/apiClient';

const { Title, Text } = Typography;

const DoctorDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await apiClient.get('/appointments/doctor');
                if (res.data?.success) {
                    setAppointments(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch appointments:', err);
                message.error('Failed to load appointments.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const columns = [
        {
            title: 'Patient Name',
            dataIndex: ['patient', 'full_name'],
            key: 'patientName',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Date & Time',
            key: 'datetime',
            render: (_: any, record: any) => (
                <Space>
                    <CalendarOutlined />
                    <Text>{new Date(record.appointment_date).toLocaleDateString()} at {record.appointment_time}</Text>
                </Space>
            ),
        },
        {
            title: 'Concern',
            dataIndex: 'notes',
            key: 'notes',
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const color = status === 'scheduled' ? 'blue' : status === 'completed' ? 'green' : 'red';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Button type="link" size="small">View Details</Button>
            ),
        },
    ];

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
                            title="Total Appointments"
                            value={appointments.length}
                            prefix={<CalendarOutlined style={{ color: colors.info }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm" style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Total Patients"
                            value={new Set(appointments.map(a => a.patient_id)).size}
                            prefix={<UserOutlined style={{ color: colors.success }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm" style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Completed Today"
                            value={appointments.filter(a => a.status === 'completed' && new Date(a.appointment_date).toDateString() === new Date().toDateString()).length}
                            prefix={<CheckCircleOutlined style={{ color: colors.warning }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm" style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Upcoming Today"
                            value={appointments.filter(a => a.status === 'scheduled' && new Date(a.appointment_date).toDateString() === new Date().toDateString()).length}
                            prefix={<MedicineBoxOutlined style={{ color: colors.danger }} />}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card
                        title="Upcoming Consultations"
                        bordered={false}
                        className="shadow-sm"
                        style={{ borderRadius: 12 }}
                    >
                        <Table
                            dataSource={appointments}
                            columns={columns}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                        />
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
