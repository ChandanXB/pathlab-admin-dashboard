import React from 'react';
import { Drawer, Descriptions, Tag, Divider, Typography, Space, List, Badge, Empty, Card, Row, Col, Image } from 'antd';
import {
    UserOutlined,
    EnvironmentOutlined,
    ExperimentOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    CreditCardOutlined,
    BarcodeOutlined,
    PhoneOutlined,
    UserAddOutlined,
    GlobalOutlined,
    ShopOutlined,
    FileImageOutlined
} from '@ant-design/icons';
import type { LabOrder } from '../types/labOrder.types';
import { ORDER_STATUSES, PRIORITIES } from '@/shared/constants/app.constants';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface LabOrderDetailDrawerProps {
    visible: boolean;
    order: LabOrder | null;
    onClose: () => void;
}

const LabOrderDetailDrawer: React.FC<LabOrderDetailDrawerProps> = ({ visible, order, onClose }) => {

    if (!order) return null;

    const getStatusColor = (status: string) => {
        const found = ORDER_STATUSES.find(s => s.value === status);
        return found ? found.color : 'default';
    };

    const getStatusLabel = (status: string) => {
        const found = ORDER_STATUSES.find(s => s.value === status);
        return found ? found.label : status;
    };

    const getPriorityTag = (priority: string) => {
        const found = PRIORITIES.find(p => p.value === priority);
        return (
            <Tag color={found?.color || 'default'}>
                {found?.label || priority}
            </Tag>
        );
    };

    const displayAddress = () => {
        // 1. Direct order address (New system)
        if (order.address) return order.address;

        // 2. Legacy fallback: Check if address is hidden in notes with specific delimiter
        if (order.notes && order.notes.includes('| Address:')) {
            const parts = order.notes.split('| Address:');
            return parts[parts.length - 1].trim();
        }

        // 3. Last resort: Patient's default address
        return order.patient?.address || 'N/A';
    };

    const displayNotes = () => {
        if (!order.notes) return null;

        // If it's a legacy note containing a hidden address, strip the address part for display
        if (order.notes.includes('| Address:')) {
            const parts = order.notes.split('| Address:');
            const cleanNotes = parts.slice(0, -1).join('| Address:').trim();
            return cleanNotes || null;
        }

        return order.notes;
    };

    return (
        <Drawer
            title={
                <Space>
                    <BarcodeOutlined />
                    <span>Order Details: {order.order_code}</span>
                </Space>
            }
            placement="right"
            onClose={onClose}
            open={visible}
            width={550}
            headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
            bodyStyle={{ padding: '24px' }}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                        <Title level={4} style={{ margin: 0, color: '#262626' }}>{order.order_code}</Title>
                        <Text type="secondary" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 4 }}>
                            <CalendarOutlined /> Created on {dayjs(order.createdAt).format('DD MMM YYYY, hh:mm A')}
                        </Text>

                        {(order.scheduled_date || order.scheduled_time) && (
                            <div style={{
                                marginTop: 12,
                                padding: '10px 14px',
                                background: '#f6ffed',
                                border: '1px solid #b7eb8f',
                                borderRadius: '8px',
                                maxWidth: 'fit-content'
                            }}>
                                <Text strong style={{ color: '#52c41a', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginBottom: 4 }}>
                                    <ClockCircleOutlined /> SCHEDULED COLLECTION
                                </Text>
                                <Space direction="vertical" size={2}>
                                    {order.scheduled_date && (
                                        <Text style={{ fontSize: '13px', color: '#595959' }}>
                                            Date: <span style={{ fontWeight: 600 }}>{dayjs(order.scheduled_date).format('DD MMM YYYY')}</span>
                                        </Text>
                                    )}
                                    {order.scheduled_time && (
                                        <Text style={{ fontSize: '13px', color: '#595959' }}>
                                            Slot: <span style={{ fontWeight: 600 }}>{order.scheduled_time}</span>
                                        </Text>
                                    )}
                                </Space>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', paddingLeft: 16 }}>
                        <Tag color={getStatusColor(order.status)} style={{ margin: 0, padding: '4px 16px', borderRadius: '20px', fontWeight: 600, fontSize: '13px' }}>
                            {getStatusLabel(order.status).toUpperCase()}
                        </Tag>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end' }}>
                            <Tag color="cyan" icon={<GlobalOutlined />} style={{ borderRadius: '6px', margin: 0 }}>
                                {order.order_source?.replace('_', ' ').toUpperCase() || 'WALK-IN'}
                            </Tag>
                            <Tag color="blue" icon={<ShopOutlined />} style={{ borderRadius: '6px', margin: 0 }}>
                                {order.order_type?.replace('_', ' ').toUpperCase() || 'LAB VISIT'}
                            </Tag>
                        </div>

                        {order.order_type === 'home_collection' && order.assignment_status &&
                            order.assignment_status !== 'not_assigned' && order.assignment_status !== order.status && (
                                <Tag color="purple" style={{ margin: 0, borderRadius: '6px', fontWeight: 500 }}>
                                    AGENT: {order.assignment_status.toUpperCase()}
                                </Tag>
                            )}

                        <div style={{ marginTop: 2 }}>
                            {getPriorityTag(order.priority)}
                        </div>
                    </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Patient Information */}
                <div>
                    <Title level={5}><UserOutlined /> Patient Details</Title>
                    <Card size="small" style={{ borderRadius: '8px', background: '#fafafa' }}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Full Name">
                                <Text strong>{order.patient?.full_name || 'N/A'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Patient Code">
                                <Tag color="blue">{order.patient?.patient_code || 'N/A'}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Contact">
                                <Space direction="vertical" size={0}>
                                    <Text><PhoneOutlined /> {order.patient?.phone || 'N/A'}</Text>
                                    {(order.patient as any)?.alternate_phone && (
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Alt: {(order.patient as any).alternate_phone}</Text>
                                    )}
                                </Space>
                            </Descriptions.Item>
                            {(order.patient as any)?.email && (
                                <Descriptions.Item label="Email">
                                    <Text>{(order.patient as any).email}</Text>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Pickup Address">
                                <Space direction="vertical" size={0}>
                                    <div><EnvironmentOutlined /> {displayAddress()}</div>
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </div>

                {/* Collection Agent Info */}
                <div>
                    <Title level={5}><UserAddOutlined /> Assigned Agent</Title>
                    <Card
                        size="small"
                        style={{
                            borderRadius: '8px',
                            background: order.collection_agent ? '#f6ffed' : '#fff7e6',
                            border: order.collection_agent ? '1px solid #b7eb8f' : '1px solid #ffd591'
                        }}
                    >
                        {order.collection_agent ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text strong>{order.collection_agent.name}</Text>
                                    <br />
                                    <Text type="secondary"><PhoneOutlined /> {order.collection_agent.phone}</Text>
                                </div>
                                <Tag color="success">SELECTED</Tag>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                <Text type="warning" strong>No Agent Assigned Yet</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '11px' }}>Use the "Assign Agent" icon in the table to link an agent.</Text>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Appointment Information */}
                {order.appointment && (
                    <div>
                        <Title level={5}><CalendarOutlined /> Appointment Slot</Title>
                        <Card size="small" style={{ borderRadius: '8px', background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                            <Space size="large">
                                <Space direction="vertical" size={0}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>DATE</Text>
                                    <Text strong>{dayjs(order.appointment.appointment_date).format('DD MMM YYYY')}</Text>
                                </Space>
                                <Divider type="vertical" style={{ height: '40px' }} />
                                <Space direction="vertical" size={0}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>TIME</Text>
                                    <Text strong>{dayjs(`2000-01-01 ${order.appointment.appointment_time}`).format('hh:mm A')}</Text>
                                </Space>
                            </Space>
                        </Card>
                    </div>
                )}

                {/* Tests Information */}
                <div>
                    <Title level={5}><ExperimentOutlined /> Tests Ordered</Title>
                    <List
                        size="small"
                        bordered
                        dataSource={order.test_results || []}
                        locale={{ emptyText: <Empty description="No tests found" /> }}
                        style={{ borderRadius: '8px' }}
                        renderItem={(item) => (
                            <List.Item>
                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <Space>
                                        <Badge status="processing" color="#1890ff" />
                                        <span>{item.test?.test_name}</span>
                                        {item.test?.category?.category_name && (
                                            <Tag color="cyan">{item.test.category.category_name}</Tag>
                                        )}
                                    </Space>
                                    <Text type="secondary">₹{item.test?.price}</Text>
                                </Space>
                            </List.Item>
                        )}
                    />
                </div>

                {/* Payment Information */}
                <div>
                    <Title level={5}><CreditCardOutlined /> Payment & Billing</Title>
                    <Card size="small" style={{ borderRadius: '8px' }}>
                        <Descriptions column={2} size="small" layout="horizontal">
                            <Descriptions.Item label="Total Amount">
                                <Text strong>₹{order.total_amount}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Badge status={order.payment_status === 'paid' ? 'success' : 'warning'} text={order.payment_status.toUpperCase()} />
                            </Descriptions.Item>
                            <Descriptions.Item label="Paid Amount">
                                <Text strong style={{ color: '#52c41a' }}>₹{order.paid_amount || 0}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mode">
                                <Tag color="blue">{order.payment_mode?.toUpperCase() || 'N/A'}</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </div>

                {/* Additional Notes */}
                {displayNotes() && (
                    <div>
                        <Title level={5}><FileTextOutlined /> Additional Notes</Title>
                        <div style={{ padding: '12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px' }}>
                            <Text>{displayNotes()}</Text>
                        </div>
                    </div>
                )}

                {/* Collection Proof Details */}
                {(order.sample_photo_url || order.payment_proof_url) && (
                    <div>
                        <Divider style={{ margin: '12px 0' }} />
                        <Title level={5}><FileImageOutlined /> Collection & Payment Proof</Title>
                        <Row gutter={[16, 16]}>
                            {order.sample_photo_url && (
                                <Col span={12}>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: '12px' }}>SAMPLE PHOTO</Text>
                                    <Image
                                        src={order.sample_photo_url}
                                        alt="Sample"
                                        style={{ width: '100%', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                                    />
                                </Col>
                            )}
                            {order.payment_proof_url && (
                                <Col span={12}>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: '12px' }}>PAYMENT SS (UPI)</Text>
                                    <div style={{ background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                                        <Image
                                            src={order.payment_proof_url}
                                            alt="Payment Screenshot"
                                            style={{ width: '100%', borderRadius: '4px' }}
                                        />
                                    </div>
                                </Col>
                            )}
                        </Row>
                        {order.collected_at && (
                            <div style={{ marginTop: 12 }}>
                                <Badge color="green" text={`Collected on ${dayjs(order.collected_at).format('DD MMM YYYY, hh:mm A')}`} />
                            </div>
                        )}
                        {(order as any).reached_at && (
                            <div style={{ marginTop: 4 }}>
                                <Badge color="gold" text={`Reached Location at ${dayjs((order as any).reached_at).format('hh:mm A')}`} />
                            </div>
                        )}
                    </div>
                )}
            </Space>
        </Drawer>
    );
};

export default LabOrderDetailDrawer;
