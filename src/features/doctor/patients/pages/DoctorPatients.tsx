import React, { useEffect, useState } from 'react';
import type { MenuProps } from 'antd';
import { Card, Typography, Tag, Space, Button, Input, message, Dropdown } from 'antd';
import { CalendarOutlined, SearchOutlined, PhoneOutlined, FileTextOutlined, SafetyCertificateOutlined, VideoCameraOutlined, DownOutlined, EditOutlined, CloseCircleOutlined } from '@ant-design/icons';
import colors from '@/styles/colors';
import { appointmentService } from '../../appointments/services/appointmentService';
import PrecautionModal from '../../appointments/components/PrecautionModal';
import MeetLinkModal from '../../appointments/components/MeetLinkModal';
import UpdateStatusModal from '../../appointments/components/UpdateStatusModal';
import RescheduleModal from '../../appointments/components/RescheduleModal';
import CancelModal from '../../appointments/components/CancelModal';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';

const { Title, Text } = Typography;

const DoctorPatients: React.FC = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [precautionModal, setPrecautionModal] = useState<{ visible: boolean; appointment: any }>({ visible: false, appointment: null });
    const [meetLinkModal, setMeetLinkModal] = useState<{ visible: boolean; appointment: any }>({ visible: false, appointment: null });
    const [statusModal, setStatusModal] = useState<{ visible: boolean; appointment: any }>({ visible: false, appointment: null });
    const [rescheduleModal, setRescheduleModal] = useState<{ visible: boolean; appointment: any }>({ visible: false, appointment: null });
    const [cancelModal, setCancelModal] = useState<{ visible: boolean; appointment: any }>({ visible: false, appointment: null });

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {
        setPage(1);
    }, [searchText]);

    const handlePrecautionSuccess = (appointmentId: number, precaution: string) => {
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, precaution } : a));
    };

    const handleMeetLinkSuccess = (meetLink: string, newDate?: string, newTime?: string) => {
        setAppointments(prev => prev.map(a => {
            const isTarget = a.id === meetLinkModal.appointment?.id;
            return {
                ...a,
                doctor: { ...a.doctor, meet_link: meetLink },
                appointment_date: isTarget && newDate ? newDate : a.appointment_date,
                appointment_time: isTarget && newTime ? newTime : a.appointment_time
            };
        }));
    };

    const handleStatusSuccess = (appointmentId: number, newStatus: string) => {
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a));
    };

    const handleRescheduleSuccess = (appointmentId: number, newDate: string, newTime: string) => {
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, appointment_date: newDate, appointment_time: newTime, status: 'scheduled' } : a));
    };

    const handleCancelSuccess = (appointmentId: number) => {
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' } : a));
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

    const filteredAppointments = [...appointments]
        .filter(apt => 
            apt.patient?.full_name?.toLowerCase().includes(searchText.toLowerCase()) || 
            apt.patient?.patient_code?.toLowerCase().includes(searchText.toLowerCase()) ||
            apt.notes?.toLowerCase().includes(searchText.toLowerCase())
        )
        .sort((a, b) => {
            const timeA = new Date(`${new Date(a.appointment_date).toDateString()} ${a.appointment_time}`).getTime();
            const timeB = new Date(`${new Date(b.appointment_date).toDateString()} ${b.appointment_time}`).getTime();
            return timeB - timeA; // Descending order (newest first)
        });

    const displayedAppointments = filteredAppointments.slice(0, page * PAGE_SIZE);

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
            width: 140,
            render: (_: any, record: any) => {
                const items: MenuProps['items'] = [
                    {
                        key: 'status',
                        label: 'Update Status',
                        icon: <EditOutlined />,
                        onClick: () => setStatusModal({ visible: true, appointment: record })
                    },
                    {
                        key: 'precaution',
                        label: record.precaution ? 'Edit Precaution' : 'Add Precaution',
                        icon: <SafetyCertificateOutlined />,
                        onClick: () => setPrecautionModal({ visible: true, appointment: record })
                    },
                    {
                        key: 'meet_link',
                        label: 'Send Meet Link',
                        icon: <VideoCameraOutlined style={{ color: colors.primary }} />,
                        onClick: () => setMeetLinkModal({ visible: true, appointment: record })
                    }
                ];

                if (record.status === 'scheduled') {
                    items.push({ type: 'divider' });
                    items.push({
                        key: 'reschedule',
                        label: 'Reschedule',
                        icon: <CalendarOutlined style={{ color: '#f59e0b' }} />,
                        onClick: () => setRescheduleModal({ visible: true, appointment: record })
                    });
                    items.push({
                        key: 'cancel',
                        label: 'Cancel',
                        icon: <CloseCircleOutlined style={{ color: '#ef4444' }} />,
                        danger: true,
                        onClick: () => setCancelModal({ visible: true, appointment: record })
                    });
                }

                return (
                    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                        <Button type="primary" ghost size="small">
                            Actions <DownOutlined />
                        </Button>
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ marginBottom: 24, flexShrink: 0 }}>
                <Title level={2} style={{ margin: 0 }}>My Patients & Appointments</Title>
                <Text type="secondary">Manage your consultation requests and upcoming patient visits.</Text>
            </div>

            <Card styles={{ body: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }} style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', minHeight: 0 }} className="shadow-sm">
                <div style={{ marginBottom: 16, flexShrink: 0 }}>
                    <Input
                        placeholder="Search by patient name, ID or concern..."
                        prefix={<SearchOutlined />}
                        style={{ width: 350 }}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                    />
                </div>

                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <InfiniteScrollTable
                        columns={columns}
                        dataSource={displayedAppointments}
                        rowKey="id"
                        loading={loading}
                        hasMore={displayedAppointments.length < filteredAppointments.length}
                        next={() => setPage(p => p + 1)}
                        scroll={{ y: 'calc(100vh - 380px)' }}
                    />
                </div>
            </Card>

            <PrecautionModal
                open={precautionModal.visible}
                appointment={precautionModal.appointment}
                onClose={() => setPrecautionModal({ visible: false, appointment: null })}
                onSuccess={handlePrecautionSuccess}
            />

            <MeetLinkModal
                open={meetLinkModal.visible}
                appointment={meetLinkModal.appointment}
                onClose={() => setMeetLinkModal({ visible: false, appointment: null })}
                onSuccess={handleMeetLinkSuccess}
            />

            <UpdateStatusModal
                open={statusModal.visible}
                appointment={statusModal.appointment}
                onClose={() => setStatusModal({ visible: false, appointment: null })}
                onSuccess={handleStatusSuccess}
            />

            <RescheduleModal
                open={rescheduleModal.visible}
                appointment={rescheduleModal.appointment}
                onClose={() => setRescheduleModal({ visible: false, appointment: null })}
                onSuccess={handleRescheduleSuccess}
            />

            <CancelModal
                open={cancelModal.visible}
                appointment={cancelModal.appointment}
                onClose={() => setCancelModal({ visible: false, appointment: null })}
                onSuccess={handleCancelSuccess}
            />
        </div>
    );
};

export default DoctorPatients;
