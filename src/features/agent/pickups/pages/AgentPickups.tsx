import React, { useState, useEffect } from 'react';
import { Typography, Card, Table, Tag, Button, Space, message, Modal } from 'antd';
import {
    EnvironmentOutlined,
    PhoneOutlined,
    CheckOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/config/apiClient';
import dayjs from 'dayjs';

const { Text } = Typography;

const AgentPickups: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const { user } = useAuthStore();

    const fetchMyOrders = async () => {
        if (!user?.agentId) return;
        setLoading(true);
        try {
            const response = await apiClient.get(`/lab-orders?agent_id=${user.agentId}`);
            setOrders(response.data.data);
        } catch (error) {
            message.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();
    }, [user?.agentId]);

    const handleAcceptAssignment = async (id: number) => {
        try {
            await apiClient.put(`/lab-orders/${id}/assignment-status`, { assignment_status: 'accepted' });
            message.success('Pickup accepted!');
            fetchMyOrders();
        } catch (error) {
            message.error('Failed to accept assignment');
        }
    };

    const handleMarkCollected = async (id: number) => {
        try {
            await apiClient.put(`/lab-orders/${id}`, { status: 'collected' });
            await apiClient.put(`/lab-orders/${id}/assignment-status`, { assignment_status: 'collected' });
            message.success('Sample marked as collected');
            fetchMyOrders();
        } catch (error) {
            message.error('Failed to update status');
        }
    };

    const columns = [
        {
            title: 'Order Info',
            key: 'order',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.order_code}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(record.createdAt).format('DD MMM, hh:mm A')}</Text>
                </Space>
            )
        },
        {
            title: 'Patient & Address',
            key: 'patient',
            render: (_: any, record: any) => (
                <div>
                    <Text strong>{record.patient?.full_name}</Text>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                        <EnvironmentOutlined style={{ color: '#ff4d4f' }} /> {record.address || 'No address provided'}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                        <PhoneOutlined /> {record.patient?.phone || 'N/A'}
                    </div>
                </div>
            )
        },
        {
            title: 'Status',
            key: 'status',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={4}>
                    <Tag color={record.status === 'collected' ? 'green' : 'gold'}>
                        {record.status.toUpperCase()}
                    </Tag>
                    {record.assignment_status && (
                        <Tag color={
                            record.assignment_status === 'pending' ? 'warning' :
                                record.assignment_status === 'accepted' ? 'processing' : 'success'
                        } style={{ fontSize: '10px' }}>
                            {record.assignment_status.toUpperCase()}
                        </Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    {record.assignment_status === 'pending' ? (
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => handleAcceptAssignment(record.id)}
                            style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Accept
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            disabled={record.status === 'collected'}
                            onClick={() => handleMarkCollected(record.id)}
                        >
                            Collected
                        </Button>
                    )}
                    <Button
                        size="small"
                        icon={<InfoCircleOutlined />}
                        onClick={() => Modal.info({
                            title: 'Order Details',
                            content: (
                                <div style={{ marginTop: 16 }}>
                                    <Text strong>Tests Included:</Text>
                                    <ul>
                                        {record.test_results?.map((tr: any) => (
                                            <li key={tr.id}>{tr.test?.test_name}</li>
                                        ))}
                                    </ul>
                                    <Text strong>Notes:</Text>
                                    <p>{record.notes || 'No special notes'}</p>
                                </div>
                            )
                        })}
                    />
                </Space>
            )
        }
    ];

    return (
        <Card title="My Assigned Pickups" style={{ borderRadius: 12 }}>
            <Table
                columns={columns}
                dataSource={orders}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />
        </Card>
    );
};

export default AgentPickups;
