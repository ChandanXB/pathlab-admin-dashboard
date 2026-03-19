import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Space, Tag, Input, message } from 'antd';
import { MedicineBoxOutlined, SearchOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import apiClient from '@/config/apiClient';
import colors from '@/styles/colors';

const { Title, Text } = Typography;

const ConsultationManager: React.FC = () => {
    const [consultations, setConsultations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchConsultations = async () => {
            try {
                const res = await apiClient.get('/appointments/all');
                if (res.data?.success) {
                    setConsultations(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch consultations:', err);
                message.error('Failed to load consultations.');
            } finally {
                setLoading(false);
            }
        };

        fetchConsultations();
    }, []);

    const filteredConsultations = consultations.filter((cons) => {
        const searchTerm = searchText.toLowerCase();
        return (
            cons.patient?.full_name?.toLowerCase().includes(searchTerm) ||
            cons.patient?.patient_code?.toLowerCase().includes(searchTerm) ||
            cons.doctor?.name?.toLowerCase().includes(searchTerm) ||
            cons.doctor?.specialty?.toLowerCase().includes(searchTerm)
        );
    });

    const columns = [
        {
            title: 'Consultation ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (id: number) => <Text strong>C-{id.toString().padStart(4, '0')}</Text>,
        },
        {
            title: 'Patient',
            key: 'patient',
            width: 200,
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong><UserOutlined style={{ marginRight: 6 }} />{record.patient?.full_name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.patient?.patient_code}</Text>
                </Space>
            ),
        },
        {
            title: 'Assigned Doctor',
            key: 'doctor',
            width: 200,
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong><MedicineBoxOutlined style={{ marginRight: 6 }} />Dr. {record.doctor?.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.doctor?.specialty}</Text>
                </Space>
            ),
        },
        {
            title: 'Date & Time',
            key: 'datetime',
            width: 160,
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <CalendarOutlined style={{ color: colors.primary }} />
                        <Text strong style={{ whiteSpace: 'nowrap' }}>{new Date(record.appointment_date).toLocaleDateString()}</Text>
                    </Space>
                    <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>{record.appointment_time}</Text>
                </Space>
            ),
        },
        {
            title: 'Precaution Status',
            key: 'precaution',
            width: 140,
            render: (_: any, record: any) => {
                if (record.precaution) {
                    return <Tag color="green" style={{ margin: 0, whiteSpace: 'nowrap' }}>Provided</Tag>;
                }
                return <Tag color="warning" style={{ margin: 0, whiteSpace: 'nowrap' }}>Pending</Tag>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                const color = status === 'scheduled' ? 'blue' : status === 'completed' ? 'green' : 'red';
                return <Tag color={color} style={{ margin: 0, whiteSpace: 'nowrap' }}>{status.toUpperCase()}</Tag>;
            },
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Consultations</Title>
                    <Text type="secondary">Monitor patient-doctor appointments and precaution statuses.</Text>
                </div>
            </div>

            <Card bordered={false} className="shadow-sm" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '12px' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start' }}>
                    <Input
                        placeholder="Search by patient or doctor name / ID..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 350 }}
                        allowClear
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredConsultations}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 15 }}
                    scroll={{ x: 'max-content', y: 500 }}
                    size="middle"
                />
            </Card>
        </div>
    );
};

export default ConsultationManager;
