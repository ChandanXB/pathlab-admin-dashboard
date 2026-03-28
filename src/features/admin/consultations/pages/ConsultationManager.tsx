import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Space, Tag, Input, message, Image, Button } from 'antd';
import { MedicineBoxOutlined, SearchOutlined, UserOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import apiClient from '@/config/apiClient';
import colors from '@/styles/colors';
import { formatName, formatDoctorName } from '@/shared/utils/nameUtils';

const { Title, Text } = Typography;

interface ConsultationManagerProps {
    hideHeader?: boolean;
}

const ConsultationManager: React.FC<ConsultationManagerProps> = ({ hideHeader = false }) => {
    const [consultations, setConsultations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const isMobile = screenSize < 768;

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            title: isMobile ? 'ID' : 'Consultation ID',
            dataIndex: 'id',
            key: 'id',
            width: isMobile ? 80 : 100,
            render: (id: number) => <Text strong>C-{id.toString().padStart(4, '0')}</Text>,
        },
        {
            title: 'Patient',
            key: 'patient',
            width: 200,
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong><UserOutlined style={{ marginRight: 6 }} />{formatName(record.patient?.full_name)}</Text>
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
                    <Text strong><MedicineBoxOutlined style={{ marginRight: 6 }} />{formatDoctorName(record.doctor?.name)}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatName(record.doctor?.specialty)}</Text>
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
            title: 'Patient Report',
            key: 'report',
            width: 140,
            render: (_: any, record: any) => {
                const extractReportUrl = (notes?: string) => {
                    if (!notes) return null;
                    const match = notes.match(/Attached Report:\s*(https?:\/\/[^\s]+)/);
                    return match ? match[1] : null;
                };
                const url = extractReportUrl(record.notes);
                if (url) {
                    if (url.toLowerCase().endsWith('.pdf')) {
                        return (
                            <Button type="link" size="small" onClick={() => window.open(url, '_blank')} style={{ fontWeight: 500, padding: 0 }}>
                                <FileTextOutlined style={{ marginRight: 4 }} /> View PDF
                            </Button>
                        );
                    }
                    return (
                        <div style={{ background: '#fff', padding: '2px', borderRadius: '6px', border: '1px solid #f0f0f0', display: 'inline-flex' }}>
                            <Image
                                src={url}
                                width={48}
                                height={36}
                                style={{ objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                                fallback="https://via.placeholder.com/48?text=Img"
                            />
                        </div>
                    );
                }
                return <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>-</Text>;
            },
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
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: hideHeader ? '0px' : (isMobile ? '12px' : '24px'), 
            height: '100%' 
        }}>
            {!hideHeader && (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'flex-start' : 'center', 
                    marginBottom: isMobile ? 12 : 24,
                    gap: isMobile ? 8 : 0
                }}>
                    <div>
                        <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>Consultations</Title>
                        {!isMobile && <Text type="secondary">Monitor patient-doctor appointments and precaution statuses.</Text>}
                    </div>
                </div>
            )}

            <Card 
                bordered={false} 
                className="shadow-sm" 
                style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '12px' }}
                styles={{ body: { padding: isMobile ? '12px' : '24px', flex: 1, display: 'flex', flexDirection: 'column' } }}
            >
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start' }}>
                    <Input
                        placeholder="Search consultations..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: isMobile ? '100%' : 350 }}
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
