import React, { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Space, Button, Input, message } from 'antd';
import { CalendarOutlined, SearchOutlined, PhoneOutlined, FileTextOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import colors from '@/styles/colors';
import { appointmentService } from '../../appointments/services/appointmentService';
import PrecautionModal from '../../appointments/components/PrecautionModal';

const { Title, Text } = Typography;

const DoctorPatients: React.FC = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [precautionModal, setPrecautionModal] = useState<{ visible: boolean; appointment: any }>({ visible: false, appointment: null });

    const handlePrecautionSuccess = (appointmentId: number, precaution: string) => {
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, precaution } : a));
    };

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await appointmentService.getDoctorAppointments();
                if (data?.success) {
                    setAppointments(data.data);
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
            width: 160,
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
            width: 140,
            render: (_: any, record: any) => (
                <Space>
                    <PhoneOutlined />
                    <Text style={{ whiteSpace: 'nowrap' }}>{record.patient?.phone || 'N/A'}</Text>
                </Space>
            ),
        },
        {
            title: 'Appointment Time',
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
            title: 'Concern / Notes',
            key: 'notes',
            width: '35%',
            render: (_: any, record: any) => {
                const text = record.notes || '';
                const parts = text.split('Attached Report:');
                const mainNote = parts[0]?.trim() || 'No notes provided';
                const fileUrl = parts[1]?.trim();

                return (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Text>{mainNote}</Text>
                        {fileUrl && (
                            <Button 
                                type="dashed" 
                                size="small" 
                                icon={<FileTextOutlined />}
                                onClick={() => window.open(fileUrl, '_blank')}
                                style={{ color: colors.primary, borderColor: colors.primary }}
                            >
                                View Attached Report
                            </Button>
                        )}
                        {record.precaution && (
                            <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                                <Text strong style={{ color: '#389e0d', display: 'block', marginBottom: 2 }}><SafetyCertificateOutlined /> Doctor Precaution:</Text>
                                <Text type="secondary">{record.precaution}</Text>
                            </div>
                        )}
                    </Space>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                const color = status === 'scheduled' ? 'blue' : status === 'completed' ? 'green' : 'red';
                return <Tag color={color} style={{ whiteSpace: 'nowrap', margin: 0 }}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 160,
            render: (_: any, record: any) => (
                <Space direction="vertical">
                    <Button type="default" size="small" block>Update Status</Button>
                    <Button 
                        type="primary" 
                        size="small" 
                        block
                        icon={<SafetyCertificateOutlined />}
                        onClick={() => setPrecautionModal({ visible: true, appointment: record })}
                    >
                        {record.precaution ? 'Edit Precaution' : 'Add Precaution'}
                    </Button>
                </Space>
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

            <PrecautionModal
                open={precautionModal.visible}
                appointment={precautionModal.appointment}
                onClose={() => setPrecautionModal({ visible: false, appointment: null })}
                onSuccess={handlePrecautionSuccess}
            />
        </div>
    );
};

export default DoctorPatients;
