import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Tag, Divider, Typography, Space, List, Badge, Empty, Card, Select } from 'antd';
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
    UserAddOutlined
} from '@ant-design/icons';
import type { LabOrder } from '../types/labOrder.types';
import { ORDER_STATUSES, PRIORITIES } from '@/shared/constants/labOrder.constants';
import { collectionAgentService, type CollectionAgent } from '@/features/admin/collectionAgent/services/collectionAgentService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface LabOrderDetailDrawerProps {
    visible: boolean;
    order: LabOrder | null;
    onClose: () => void;
    onAssignAgent?: (orderId: number, agentId: number | null) => Promise<any>;
}

const LabOrderDetailDrawer: React.FC<LabOrderDetailDrawerProps> = ({ visible, order, onClose, onAssignAgent }) => {
    const [agents, setAgents] = useState<CollectionAgent[]>([]);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchAgents();
        }
    }, [visible]);

    const fetchAgents = async () => {
        try {
            const response = await collectionAgentService.getAgents({ status: 'active' });
            setAgents(response.data);
        } catch (error) {
            console.error('Failed to fetch agents', error);
        }
    };

    const handleAssign = async (agentId: number | null) => {
        if (!order || !onAssignAgent) return;
        try {
            setAssigning(true);
            await onAssignAgent(order.id, agentId);
        } finally {
            setAssigning(false);
        }
    };

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
        // 1. Check for dedicated order address (New system)
        if (order.address) return order.address;

        // 2. Check for patient profile address
        if (order.patient?.address) return order.patient.address;

        // 3. Fallback: Check if address is hidden in notes (Old orders)
        if (order.notes && order.notes.includes('| Address:')) {
            const parts = order.notes.split('| Address:');
            return parts[parts.length - 1].trim();
        }

        return 'N/A';
    };

    const displayNotes = () => {
        if (!order.notes) return null;

        // Remove the address part if it exists in the notes
        if (order.notes.includes('| Address:')) {
            const parts = order.notes.split('| Address:');
            // Join everything before the last address marker (if there was text before it)
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
            width={600}
            headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
            bodyStyle={{ padding: '24px' }}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Space direction="vertical" size={4}>
                        <Title level={4} style={{ margin: 0 }}>ORD-{order.order_code.split('-').pop()}</Title>
                        <Text type="secondary">
                            <ClockCircleOutlined /> Created on {dayjs(order.createdAt).format('DD MMM YYYY, hh:mm A')}
                        </Text>
                    </Space>
                    <Space direction="vertical" align="end" size={4}>
                        <Tag color={getStatusColor(order.status)} style={{ margin: 0, borderRadius: '12px' }}>
                            {getStatusLabel(order.status).toUpperCase()}
                        </Tag>
                        {getPriorityTag(order.priority)}
                    </Space>
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
                                <Space>
                                    <PhoneOutlined /> {order.patient?.phone || 'N/A'}
                                </Space>
                            </Descriptions.Item>

                            {/* Priority 1: New dedicated Order Address (Collection Address) */}
                            {order.address && (
                                <Descriptions.Item label="Pickup Address">
                                    <Tag color="processing" icon={<EnvironmentOutlined />}>COLLECTION POINT</Tag>
                                    <div style={{ marginTop: '4px', fontWeight: 600, color: '#004aad' }}>{order.address}</div>
                                </Descriptions.Item>
                            )}

                            {/* Priority 2: Patient Profile Address */}
                            <Descriptions.Item label="Patient Address">
                                <Space direction="vertical" size={0}>
                                    <div><EnvironmentOutlined /> {order.patient?.address || 'N/A'}</div>
                                    {/* Only show fallback if it exists AND is actually different from profile address */}
                                    {!order.address &&
                                        order.notes?.includes('| Address:') &&
                                        displayAddress() !== order.patient?.address && (
                                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                                Note: Pickup requested at "{displayAddress()}"
                                            </Text>
                                        )}
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
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
                            <Descriptions.Item label="Total">
                                <Text strong>₹{order.total_amount}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={order.payment_status === 'paid' ? 'success' : 'warning'} style={{ margin: 0 }}>
                                    {order.payment_status.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Paid">
                                <Text>₹{order.paid_amount || 0}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Balance">
                                <Text type="danger" strong>₹{Number(order.total_amount) - Number(order.paid_amount || 0)}</Text>
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

                <Divider style={{ margin: '12px 0' }} />

                {/* Collection Agent Assignment */}
                <div>
                    <Title level={5}><UserAddOutlined /> Collection Agent Assignment</Title>
                    <Card
                        size="small"
                        style={{
                            borderRadius: '8px',
                            background: order.collection_agent ? '#f6ffed' : '#fff7e6',
                            border: order.collection_agent ? '1px solid #b7eb8f' : '1px solid #ffd591'
                        }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {order.collection_agent ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <Text strong>{order.collection_agent.name}</Text>
                                        <br />
                                        <Text type="secondary"><PhoneOutlined /> {order.collection_agent.phone}</Text>
                                    </div>
                                    <Tag color="success">ASSIGNED</Tag>
                                </div>
                            ) : (
                                <Text type="warning" strong>No agent assigned for sample pickup</Text>
                            )}

                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                    {order.collection_agent ? 'Change Agent' : 'Assign Agent'}
                                </Text>
                                <Select
                                    placeholder="Select a collection agent"
                                    style={{ width: '100%' }}
                                    loading={assigning}
                                    value={order.collection_agent_id || undefined}
                                    onChange={handleAssign}
                                    allowClear
                                >
                                    {agents.map(agent => (
                                        <Option key={agent.id} value={agent.id}>
                                            {agent.name} ({agent.phone})
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </Space>
                    </Card>
                </div>
            </Space>
        </Drawer>
    );
};

export default LabOrderDetailDrawer;
