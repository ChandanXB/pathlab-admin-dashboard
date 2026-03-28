import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Statistic, Button, Space, Table, Tag, message, Tooltip } from 'antd';
import {
    UserOutlined,
    CheckCircleOutlined,
    MedicineBoxOutlined,
    CalendarOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import colors from '@/styles/colors';
import apiClient from '@/config/apiClient';

const { Title, Text } = Typography;

const DoctorDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
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
            width: 150,
            render: (status: string) => {
                const color = status === 'scheduled' ? 'blue' : status === 'completed' ? 'green' : 'red';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            align: 'right' as const,
            render: () => (
                <Button type="link" size="small" onClick={() => navigate('/doctor/patients')}>View Details</Button>
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
                            title="Pending Consultations"
                            value={appointments.filter(a => !a.precaution).length}
                            prefix={<MedicineBoxOutlined style={{ color: colors.warning }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm" style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Precautions Given"
                            value={appointments.filter(a => !!a.precaution).length}
                            prefix={<CheckCircleOutlined style={{ color: colors.success }} />}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card
                        title="Recent Consultations"
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
                    <WeeklyConsultationTrend appointments={appointments} />
                </Col>
            </Row>
        </div>
    );
};

const WeeklyConsultationTrend: React.FC<{ appointments: any[] }> = ({ appointments }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const weeklyData = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d;
        });

        appointments.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const index = last7Days.findIndex(d => 
                d.getDate() === orderDate.getDate() && 
                d.getMonth() === orderDate.getMonth() && 
                d.getFullYear() === orderDate.getFullYear()
            );
            if (index !== -1) {
                counts[6 - index]++;
            }
        });

        const sortedDays = last7Days.reverse().map(d => days[d.getDay()]);
        return { counts, labels: sortedDays };
    }, [appointments]);

    const maxCount = Math.max(...weeklyData.counts, 1);

    return (
        <Card
            title={<Space><BarChartOutlined style={{ color: colors.info }} /> Consultation Activity</Space>}
            bordered={false}
            className="shadow-sm"
            style={{ borderRadius: 12, height: '100%' }}
        >
            <div style={{ height: 260, display: 'flex', alignItems: 'flex-end', gap: '8%', padding: '10px 0 20px' }}>
                {weeklyData.counts.map((count, i) => {
                    const heightPct = Math.max((count / maxCount) * 100, 5);
                    return (
                        <Tooltip key={i} title={`${weeklyData.labels[i]}: ${count} Consultations`}>
                            <div style={{
                                flex: 1,
                                height: `${heightPct}%`,
                                background: i === 6 ? `linear-gradient(to top, ${colors.primary}, ${colors.info})` : `${colors.primary}20`,
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                position: 'relative'
                            }} />
                        </Tooltip>
                    );
                })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid #f0f0f0`, paddingTop: 12 }}>
                {weeklyData.labels.map((label, i) => (
                    <Text key={i} type="secondary" style={{ fontSize: 10, fontWeight: i === 6 ? 700 : 400 }}>{label}</Text>
                ))}
            </div>
        </Card>
    );
};

export default DoctorDashboard;
