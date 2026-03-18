import React, { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Space, Button, Input, message } from 'antd';
import { CalendarOutlined, SearchOutlined, PhoneOutlined } from '@ant-design/icons';
import apiClient from '@/config/apiClient';
import colors from '@/styles/colors';

const { Title, Text } = Typography;

const DoctorPatients: React.FC = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await apiClient.get('/appointments/doctor');
                if (res.data?.success) {
                    setAppointments(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch appointments:', err);
                message.error('Failed to load patient appointments.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const filteredAppointments = appointments.filter(apt => 
        apt.patient?.full_name?.toLowerCase().includes(searchText.toLowerCase()) || 
        apt.patient?.patient_code?.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Patient Details',
            key: 'patient',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.patient?.full_name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.patient?.patient_code}</Text>
                </Space>
            ),
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_: any, record: any) => (
                <Space>
                    <PhoneOutlined />
                    <Text>{record.patient?.phone}</Text>
                </Space>
            ),
        },
        {
            title: 'Appointment Time',
            key: 'datetime',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <CalendarOutlined style={{ color: colors.primary }} />
                        <Text strong>{new Date(record.appointment_date).toLocaleDateString()}</Text>
                    </Space>
                    <Text type="secondary">{record.appointment_time}</Text>
                </Space>
            ),
        },
        {
            title: 'Concern / Notes',
            dataIndex: 'notes',
            key: 'notes',
            width: '30%',
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
                <Button type="primary" size="small">Update Status</Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '0 0 24px 0', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>My Patients & Appointments</Title>
                <Text type="secondary">Manage your consultation requests and upcoming patient visits.</Text>
            </div>

            <Card styles={{ body: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' } }} style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 12 }} className="shadow-sm">
                <div style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="Search by patient name, ID or concern..."
                        prefix={<SearchOutlined />}
                        style={{ width: 350 }}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                    />
                </div>

                <div style={{ flex: 1, overflow: 'auto' }}>
                    <Table
                        columns={columns}
                        dataSource={filteredAppointments}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </Card>
        </div>
    );
};

export default DoctorPatients;
