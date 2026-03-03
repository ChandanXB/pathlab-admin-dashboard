import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Tag, Divider, Typography, Space, List, Card, Empty, Button, Tabs, Spin } from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    FilePdfOutlined,
    HistoryOutlined,
    MedicineBoxOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Patient } from '../types/patient.types';
import { labOrderService } from '../../labOrder/services/labOrderService';
import type { LabOrder } from '../../labOrder/types/labOrder.types';

const { Title, Text } = Typography;

interface PatientDetailDrawerProps {
    visible: boolean;
    patient: Patient | null;
    onClose: () => void;
}

const PatientDetailDrawer: React.FC<PatientDetailDrawerProps> = ({ visible, patient, onClose }) => {
    const [orders, setOrders] = useState<LabOrder[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && patient) {
            fetchPatientHistory();
        } else {
            setOrders([]);
        }
    }, [visible, patient]);

    const fetchPatientHistory = async () => {
        if (!patient) return;
        setLoading(true);
        try {
            const response = await labOrderService.getOrders({
                patient_id: patient.id,
                limit: 100 // Get all history
            });
            if (response.success) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch patient history:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAge = (dob: string): number => {
        return dayjs().diff(dayjs(dob), 'year');
    };

    if (!patient) return null;

    return (
        <Drawer
            title={
                <Space>
                    <UserOutlined />
                    <span>Patient Health Profile</span>
                </Space>
            }
            placement="right"
            onClose={onClose}
            open={visible}
            width={650}
            styles={{ body: { padding: '24px' } }}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Patient Header Card */}
                <Card style={{ background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '50%' }}>
                            <UserOutlined style={{ fontSize: '32px', color: '#fff' }} />
                        </div>
                        <div>
                            <Title level={3} style={{ margin: 0, color: '#fff' }}>{patient.full_name}</Title>
                            <Space split={<Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />}>
                                <Text style={{ color: 'rgba(255,255,255,0.85)' }}>{patient.gender}</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.85)' }}>{calculateAge(patient.dob)} Years</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>ID: {patient.patient_code}</Text>
                            </Space>
                        </div>
                    </div>
                </Card>

                <Tabs defaultActiveKey="info">
                    <Tabs.TabPane
                        tab={<Space><UserOutlined />Personal Info</Space>}
                        key="info"
                    >
                        <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}>
                            <Descriptions.Item label="Contact Number">
                                <Space>
                                    <PhoneOutlined />
                                    {patient.phone || 'N/A'}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Date of Birth">
                                <Space>
                                    <CalendarOutlined />
                                    {dayjs(patient.dob).format('DD MMMM YYYY')}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Address">
                                <Space align="start">
                                    <EnvironmentOutlined style={{ marginTop: 4 }} />
                                    {patient.address || 'No address provided'}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Emergency Contact">
                                <Space direction="vertical" size={0}>
                                    <Text strong>{patient.emergency_contact || 'N/A'}</Text>
                                    {patient.emergency_phone && <Text type="secondary">{patient.emergency_phone}</Text>}
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
                    </Tabs.TabPane>

                    <Tabs.TabPane
                        tab={<Space><HistoryOutlined />Lab History & Reports</Space>}
                        key="history"
                    >
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}><Spin tip="Fetching history..." /></div>
                        ) : orders.length > 0 ? (
                            <List
                                itemLayout="vertical"
                                dataSource={orders}
                                renderItem={(order) => (
                                    <Card
                                        size="small"
                                        style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
                                        title={
                                            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                                <Space>
                                                    <MedicineBoxOutlined />
                                                    <Text strong>{order.order_code}</Text>
                                                </Space>
                                                <Tag color={order.status === 'completed' ? 'success' : 'processing'}>
                                                    {order.status.toUpperCase()}
                                                </Tag>
                                            </Space>
                                        }
                                        extra={<Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(order.createdAt).format('DD MMM YYYY')}</Text>}
                                    >
                                        {/* Show reports for this order */}
                                        {order.report_urls && order.report_urls.length > 0 ? (
                                            <div style={{ marginTop: 8 }}>
                                                <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Uploaded Reports</Text>
                                                <List
                                                    size="small"
                                                    dataSource={order.report_urls}
                                                    renderItem={(url, idx) => (
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '8px 12px',
                                                            background: '#f0f5ff',
                                                            borderRadius: '6px',
                                                            marginTop: 8,
                                                            border: '1px solid #adc6ff'
                                                        }}>
                                                            <Space>
                                                                <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                                                                <Text style={{ fontSize: '13px' }}>Report #{idx + 1}</Text>
                                                            </Space>
                                                            <Button
                                                                type="link"
                                                                size="small"
                                                                icon={<EyeOutlined />}
                                                                onClick={() => window.open(url, '_blank')}
                                                            >
                                                                View
                                                            </Button>
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        ) : (
                                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No reports uploaded for this order yet" />
                                        )}

                                        {/* Show summary of tests */}
                                        <div style={{ marginTop: 12 }}>
                                            <Text type="secondary" style={{ fontSize: '11px' }}>TESTS INCLUDED:</Text>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                                {order.test_results?.map(tr => (
                                                    <Tag key={tr.id} style={{ fontSize: '10px' }}>{tr.test?.test_name}</Tag>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            />
                        ) : (
                            <Empty description="No lab order history found for this patient" />
                        )}
                    </Tabs.TabPane>
                </Tabs>
            </Space>
        </Drawer>
    );
};

export default PatientDetailDrawer;
