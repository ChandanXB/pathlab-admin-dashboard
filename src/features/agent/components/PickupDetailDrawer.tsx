import React, { useState } from 'react';
import { Drawer, Typography, Space, Tag, Divider, Button, Descriptions, Timeline, Card, Row, Col } from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    ExperimentOutlined,
    BarcodeOutlined,
    CheckCircleOutlined,
    CarOutlined,
    SendOutlined,
    FileImageOutlined,
    WalletOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { AgentOrder } from '../services/agentOrderService';
import CollectionProofModal from './CollectionProofModal';

const { Text, Title } = Typography;

interface PickupDetailDrawerProps {
    visible: boolean;
    order: AgentOrder | null;
    onClose: () => void;
    onAccept: (id: number) => any;
    onStartPickup: (id: number) => any;
    onMarkReached: (id: number) => any;
    onMarkCollected: (id: number, proofData: {
        samplePhoto: string;
        paymentMode: 'cash' | 'upi';
        paymentProof?: string;
        amountPaid?: number;
    }) => any;
}

const PickupDetailDrawer: React.FC<PickupDetailDrawerProps> = ({
    visible,
    order,
    onClose,
    onAccept,
    onStartPickup,
    onMarkReached,
    onMarkCollected,
}) => {
    const [proofModalVisible, setProofModalVisible] = useState(false);
    const [submittingProof, setSubmittingProof] = useState(false);

    if (!order) return null;

    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            pending: '#fa8c16',
            collected: '#1890ff',
            processing: '#722ed1',
            completed: '#52c41a',
            cancelled: '#f5222d',
        };
        return map[status] || '#d9d9d9';
    };

    // const getAssignmentStatusLabel = (status: string | null) => {
    //     const map: Record<string, { label: string; color: string }> = {
    //         not_assigned: { label: 'Not Assigned', color: 'default' },
    //         pending: { label: 'Pending Acceptance', color: 'warning' },
    //         accepted: { label: 'Accepted', color: 'processing' },
    //         picking_up: { label: 'En Route', color: 'cyan' },
    //         collected: { label: 'Collected', color: 'success' },
    //     };
    //     return map[status || 'not_assigned'] || { label: status || 'Unknown', color: 'default' };
    // };

    // const assignmentInfo = getAssignmentStatusLabel(order.assignment_status);

    const openGoogleMaps = () => {
        if (order.latitude && order.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`, '_blank');
        } else if (order.address) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address)}`, '_blank');
        }
    };

    const handleProofSubmit = async (orderId: number, proofData: {
        samplePhoto: string;
        paymentMode: 'cash' | 'upi';
        paymentProof?: string;
        amountPaid?: number;
    }) => {
        setSubmittingProof(true);
        try {
            await onMarkCollected(orderId, proofData);
            setProofModalVisible(false);
        } catch (error) {
            console.error('Failed to submit proof:', error);
        } finally {
            setSubmittingProof(false);
        }
    };

    const renderActionButtons = () => {
        const assignStatus = order.assignment_status;

        if (assignStatus === 'pending') {
            return (
                <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    block
                    size="large"
                    onClick={() => onAccept(order.id)}
                    style={{
                        background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                        border: 'none',
                        borderRadius: '12px',
                        height: '48px',
                        fontWeight: 600,
                    }}
                >
                    Accept This Pickup
                </Button>
            );
        }

        if (assignStatus === 'accepted') {
            return (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Button
                        type="primary"
                        icon={<CarOutlined />}
                        block
                        size="large"
                        onClick={() => onStartPickup(order.id)}
                        style={{
                            background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                            border: 'none',
                            borderRadius: '12px',
                            height: '48px',
                            fontWeight: 600,
                        }}
                    >
                        Start Pickup — On My Way
                    </Button>
                </Space>
            );
        }

        if (assignStatus === 'picking_up') {
            return (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Button
                        type="primary"
                        icon={<EnvironmentOutlined />}
                        block
                        size="large"
                        onClick={() => onMarkReached(order.id)}
                        style={{
                            background: 'linear-gradient(135deg, #faad14, #d48806)',
                            border: 'none',
                            borderRadius: '12px',
                            height: '48px',
                            fontWeight: 600,
                        }}
                    >
                        Mark as Reached — I am here
                    </Button>
                </Space>
            );
        }

        if (assignStatus === 'reached') {
            return (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        block
                        size="large"
                        onClick={() => setProofModalVisible(true)}
                        style={{
                            background: 'linear-gradient(135deg, #722ed1, #531dab)',
                            border: 'none',
                            borderRadius: '12px',
                            height: '48px',
                            fontWeight: 600,
                        }}
                    >
                        Mark as Collected
                    </Button>
                </Space>
            );
        }

        if (assignStatus === 'collected' || order.status === 'collected') {
            const hasPhoto = !!order.sample_photo_url;
            const hasPayment = !!(order.payment_mode === 'cash' || order.payment_proof_url);

            return (
                <div style={{
                    textAlign: 'center',
                    padding: '20px 16px',
                    background: '#f6ffed',
                    borderRadius: '16px',
                    border: '1px solid #b7eb8f',
                    boxShadow: '0 2px 8px rgba(82, 196, 26, 0.1)'
                }}>
                    <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                    <div style={{ marginTop: '12px' }}>
                        <Title level={5} style={{ color: '#52c41a', margin: 0 }}>Sample Collected</Title>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Task completed successfully</Text>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <Space size="large">
                        <div style={{ textAlign: 'center' }}>
                            <FileImageOutlined style={{ color: hasPhoto ? '#52c41a' : '#bfbfbf', fontSize: '20px' }} />
                            <div style={{ fontSize: '11px', marginTop: '4px' }}>Photo {hasPhoto ? '✓' : '✗'}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <WalletOutlined style={{ color: hasPayment ? '#1890ff' : '#bfbfbf', fontSize: '20px' }} />
                            <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                Payment {hasPayment ? '✓' : '✗'}
                                {order.payment_mode && ` (${order.payment_mode.toUpperCase()})`}
                            </div>
                        </div>
                    </Space>
                </div>
            );
        }

        return null;
    };

    const getStepStatus = (step: string) => {
        const flow = ['pending', 'accepted', 'picking_up', 'reached', 'collected'];
        const currentIndex = flow.indexOf(order.assignment_status || '');
        const stepIndex = flow.indexOf(step);
        if (order.status === 'collected') {
            if (stepIndex <= flow.indexOf('collected')) return 'finish';
        }
        if (stepIndex < currentIndex) return 'finish';
        if (stepIndex === currentIndex) return 'process';
        return 'wait';
    };

    return (
        <>
            <Drawer
                title={
                    <Space>
                        <BarcodeOutlined style={{ color: '#1890ff' }} />
                        <span>{order.order_code}</span>
                        <Tag color={getStatusColor(order.status)}>{order.status.toUpperCase()}</Tag>
                    </Space>
                }
                open={visible}
                onClose={onClose}
                width={420}
                styles={{ body: { padding: '16px', background: '#fafafa' } }}
            >
                {/* Assignment Status Progress */}
                <Card
                    size="small"
                    style={{ marginBottom: '16px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                    <Text strong style={{ fontSize: '13px', color: '#666', marginBottom: '12px', display: 'block' }}>
                        Pickup Progress
                    </Text>
                    <Timeline
                        items={[
                            {
                                color: getStepStatus('pending') === 'finish' ? '#52c41a' : getStepStatus('pending') === 'process' ? '#faad14' : '#e8e8e8',
                                children: <Text style={{ color: getStepStatus('pending') === 'wait' ? '#bfbfbf' : undefined }}>Assigned to you</Text>
                            },
                            {
                                color: getStepStatus('accepted') === 'finish' ? '#52c41a' : getStepStatus('accepted') === 'process' ? '#1890ff' : '#e8e8e8',
                                children: <Text style={{ color: getStepStatus('accepted') === 'wait' ? '#bfbfbf' : undefined }}>Accepted</Text>
                            },
                            {
                                color: getStepStatus('picking_up') === 'finish' ? '#52c41a' : getStepStatus('picking_up') === 'process' ? '#722ed1' : '#e8e8e8',
                                children: <Text style={{ color: getStepStatus('picking_up') === 'wait' ? '#bfbfbf' : undefined }}>En Route to Patient</Text>
                            },
                            {
                                color: getStepStatus('reached') === 'finish' ? '#52c41a' : getStepStatus('reached') === 'process' ? '#faad14' : '#e8e8e8',
                                children: <Text style={{ color: getStepStatus('reached') === 'wait' ? '#bfbfbf' : undefined }}>Reached Location</Text>
                            },
                            {
                                color: getStepStatus('collected') === 'finish' || getStepStatus('collected') === 'process' ? '#52c41a' : '#e8e8e8',
                                children: <Text style={{ color: getStepStatus('collected') === 'wait' ? '#bfbfbf' : undefined }}>Sample Collected</Text>
                            },
                        ]}
                    />
                </Card>

                {/* Patient Info */}
                <Card
                    size="small"
                    style={{ marginBottom: '16px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                    <Text strong style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>
                        Patient Information
                    </Text>
                    <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c', width: 80 }}>
                        <Descriptions.Item label={<><UserOutlined /> Name</>}>
                            <Text strong>{order.patient?.full_name || 'N/A'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
                            {order.patient?.phone ? (
                                <a href={`tel:${order.patient.phone}`} style={{ color: '#1890ff' }}>
                                    {order.patient.phone}
                                </a>
                            ) : 'N/A'}
                        </Descriptions.Item>
                        {order.patient?.alternate_phone && (
                            <Descriptions.Item label={<><PhoneOutlined /> Alt</>}>
                                <a href={`tel:${order.patient.alternate_phone}`} style={{ color: '#1890ff' }}>
                                    {order.patient.alternate_phone}
                                </a>
                            </Descriptions.Item>
                        )}
                        {order.patient?.email && (
                            <Descriptions.Item label={<><MailOutlined /> Email</>}>
                                {order.patient.email}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Card>

                {/* Pickup Address */}
                <Card
                    size="small"
                    style={{ marginBottom: '16px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                    <Text strong style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>
                        <EnvironmentOutlined /> Pickup Location
                    </Text>
                    <Text>{order.address || order.patient?.address || 'No address provided'}</Text>
                    {(order.address || order.patient?.address || (order.latitude && order.longitude)) && (
                        <Button
                            type="primary"
                            ghost
                            icon={<EnvironmentOutlined />}
                            block
                            style={{ marginTop: '12px', borderRadius: '8px' }}
                            onClick={openGoogleMaps}
                        >
                            Open in Google Maps
                        </Button>
                    )}
                </Card>

                {/* Tests */}
                <Card
                    size="small"
                    style={{ marginBottom: '16px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                    <Text strong style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>
                        <ExperimentOutlined /> Tests to Collect
                    </Text>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {order.test_results?.map((tr: any) => (
                            <div key={tr.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                background: '#f5f5f5',
                                borderRadius: '8px',
                            }}>
                                <div>
                                    <Text strong style={{ fontSize: '13px' }}>{tr.test?.test_name}</Text>
                                    {tr.test?.sample_type && (
                                        <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                                            Sample: {tr.test.sample_type}
                                        </Text>
                                    )}
                                </div>
                                <Tag color={tr.status === 'completed' ? 'success' : 'processing'} style={{ borderRadius: '8px' }}>
                                    {tr.status}
                                </Tag>
                            </div>
                        ))}
                        {(!order.test_results || order.test_results.length === 0) && (
                            <Text type="secondary">No tests specified</Text>
                        )}
                    </Space>
                </Card>

                {/* Order Details */}
                <Card
                    size="small"
                    style={{ marginBottom: '16px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                    <Descriptions column={2} size="small" labelStyle={{ color: '#8c8c8c' }}>
                        <Descriptions.Item label="Priority">
                            <Tag color={order.priority === 'urgent' ? 'error' : order.priority === 'stat' ? 'warning' : 'default'}>
                                {order.priority.toUpperCase()}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment">
                            <Tag color={order.payment_status === 'paid' ? 'success' : 'warning'}>
                                {order.payment_status.toUpperCase()}
                                {order.payment_mode ? ` (${order.payment_mode.toUpperCase()})` : ''}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Total">
                            <Text strong>₹{order.total_amount}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Paid">
                            <Text strong style={{ color: '#52c41a' }}>₹{order.paid_amount || 0}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Collection Proof Display */}
                {(order.sample_photo_url || order.payment_proof_url) && (
                    <Card
                        size="small"
                        title={<Text strong style={{ fontSize: '13px' }}><FileImageOutlined /> Collection & Payment Proof</Text>}
                        style={{ marginBottom: '16px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                    >
                        <Row gutter={[12, 12]}>
                            {order.sample_photo_url && (
                                <Col span={order.payment_proof_url ? 12 : 24}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Sample Photo</Text>
                                        <div style={{ position: 'relative', width: '100%', paddingTop: '75%', background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden' }}>
                                            <img
                                                src={order.sample_photo_url}
                                                alt="Sample"
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={() => window.open(order.sample_photo_url!, '_blank')}
                                            />
                                        </div>
                                    </div>
                                </Col>
                            )}
                            {order.payment_proof_url && (
                                <Col span={order.sample_photo_url ? 12 : 24}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Payment SS</Text>
                                        <div style={{ position: 'relative', width: '100%', paddingTop: '75%', background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden' }}>
                                            <img
                                                src={order.payment_proof_url}
                                                alt="Payment Screenshot"
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={() => window.open(order.payment_proof_url!, '_blank')}
                                            />
                                        </div>
                                    </div>
                                </Col>
                            )}
                        </Row>
                        {order.collected_at && (
                            <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                    Collected on: {dayjs(order.collected_at).format('DD MMM, hh:mm A')}
                                </Text>
                            </div>
                        )}
                    </Card>
                )}

                {/* Action Buttons */}
                <div style={{ marginTop: '8px' }}>
                    {renderActionButtons()}
                </div>
            </Drawer>

            {/* Collection Proof Modal */}
            <CollectionProofModal
                visible={proofModalVisible}
                order={order}
                onClose={() => setProofModalVisible(false)}
                onSubmit={handleProofSubmit}
                submitting={submittingProof}
            />
        </>
    );
};

export default PickupDetailDrawer;
