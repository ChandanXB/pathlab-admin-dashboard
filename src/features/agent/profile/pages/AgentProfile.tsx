import React from 'react';
import { Typography, Card, Descriptions, Tag, Avatar, Row, Col, Statistic, Divider, Space, Spin, message, Upload, Button, Modal } from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    CarOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExperimentOutlined,
    IdcardOutlined,
    EditOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useAgentOrders } from '../../hooks/useAgentOrders';
import { agentOrderService } from '../../services/agentOrderService';
import colors from '@/styles/colors';
import { formatName } from '@/shared/utils/nameUtils';

const { Title, Text } = Typography;

const AgentProfile: React.FC = () => {
    const { user } = useAuthStore();
    const { profile, stats, loading, refresh } = useAgentOrders();
    const [uploading, setUploading] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);

    const handleUpload = (file: File) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setPreviewImage(reader.result as string);
        };
        return false; // Prevent automatic upload
    };

    const confirmUpload = async () => {
        if (!user?.agentId || !previewImage) return;
        
        setUploading(true);
        try {
            const res = await agentOrderService.updateAgentProfile(user.agentId!, { 
                profile_image: previewImage 
            });
            if (res.success) {
                message.success('Profile image updated successfully');
                refresh();
                setPreviewImage(null);
            } else {
                message.error('Failed to update image');
            }
        } catch (error) {
            message.error('Failed to process image');
        } finally {
            setUploading(false);
        }
    };

    if (loading && !profile) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 0, width: '100%', maxWidth: 1200, margin: '0 auto' }}>
            {/* Profile Header Card */}
            <Card
                style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    boxShadow: `0 4px 16px ${colors.cardShadow}`,
                }}
                styles={{ body: { padding: 0 } }}
            >
                {/* Banner */}
                <div style={{
                    background: `linear-gradient(135deg, ${colors.info} 0%, ${colors.layout.agentSidebarEnd} 60%, ${colors.textDark} 100%)`,
                    padding: '32px 28px 48px',
                    position: 'relative',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Avatar
                                size={72}
                                icon={<UserOutlined />}
                                src={profile?.profile_image}
                                style={{
                                    background: `${colors.white}${colors.alpha.badgeBg}`,
                                    border: `3px solid ${colors.white}${colors.alpha.badgeGlow}`,
                                    fontSize: '32px',
                                }}
                            />
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                beforeUpload={handleUpload}
                                disabled={uploading}
                            >
                                <Button 
                                    size="small"
                                    icon={<EditOutlined />} 
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: -10,
                                        borderRadius: '50%',
                                        width: '28px',
                                        height: '28px',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                />
                            </Upload>
                        </div>
                        <div>
                            <Title level={3} style={{ color: colors.white, margin: 0 }}>
                                {formatName(user?.name || profile?.name) || 'Agent'}
                            </Title>
                            <Space>
                                <Tag color={`${colors.white}${colors.alpha.badgeBg}`} style={{ color: colors.white, borderRadius: '8px', border: 'none' }}>
                                    <IdcardOutlined /> Collection Agent
                                </Tag>
                                <Tag color={profile?.status === 'active' ? colors.success : colors.status.pending} style={{ borderRadius: '8px' }}>
                                    {profile?.status?.toUpperCase() || 'ACTIVE'}
                                </Tag>
                            </Space>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div style={{
                    padding: '20px 28px',
                    background: colors.background,
                    borderTop: `1px solid ${colors.borderLight}`,
                }}>
                    <Row gutter={[24, 16]}>
                        <Col xs={8}>
                            <Statistic
                                title={<Text style={{ fontSize: '12px' }}>Total Assigned</Text>}
                                value={stats.totalAssigned}
                                prefix={<ExperimentOutlined style={{ color: colors.status.processing }} />}
                                valueStyle={{ fontSize: '22px', fontWeight: 700 }}
                            />
                        </Col>
                        <Col xs={8}>
                            <Statistic
                                title={<Text style={{ fontSize: '12px' }}>In Progress</Text>}
                                value={stats.activePickups + stats.pendingPickups}
                                prefix={<ClockCircleOutlined style={{ color: colors.status.pending }} />}
                                valueStyle={{ fontSize: '22px', fontWeight: 700 }}
                            />
                        </Col>
                        <Col xs={8}>
                            <Statistic
                                title={<Text style={{ fontSize: '12px' }}>Collected Today</Text>}
                                value={stats.collectedToday}
                                prefix={<CheckCircleOutlined style={{ color: colors.success }} />}
                                valueStyle={{ fontSize: '22px', fontWeight: 700 }}
                            />
                        </Col>
                    </Row>
                </div>
            </Card>

            {/* Contact Info */}
            <Card
                title={
                    <Space><UserOutlined style={{ color: colors.info }} /><Text strong>Contact Information</Text></Space>
                }
                style={{ borderRadius: '16px', marginBottom: '20px', boxShadow: `0 2px 8px ${colors.cardShadow}` }}
            >
                <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ color: colors.charts.text, fontWeight: 500 }}>
                    <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
                        <Text strong>{profile?.phone || user?.email || 'N/A'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<><MailOutlined /> Email</>}>
                        <Text>{profile?.email || user?.email || 'N/A'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<><EnvironmentOutlined /> Address</>} span={2}>
                        <Text>{formatName(profile?.address) || 'Not set'}</Text>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Vehicle Info */}
            <Card
                title={
                    <Space><CarOutlined style={{ color: colors.info }} /><Text strong>Vehicle Information</Text></Space>
                }
                style={{ borderRadius: '16px', boxShadow: `0 2px 8px ${colors.cardShadow}` }}
            >
                <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ color: colors.charts.text, fontWeight: 500 }}>
                    <Descriptions.Item label="Vehicle Type">
                        <Tag color="blue" style={{ borderRadius: '8px' }}>
                            {formatName(profile?.vehicle_type) || 'Not set'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Vehicle Number">
                        <Text strong style={{ fontSize: '16px', letterSpacing: '1px' }}>
                            {profile?.vehicle_no?.toUpperCase() || 'Not set'}
                        </Text>
                    </Descriptions.Item>
                </Descriptions>
                {profile?.latitude && profile?.longitude && (
                    <>
                        <Divider style={{ margin: '12px 0' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            <EnvironmentOutlined /> Last known location: {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
                        </Text>
                    </>
                )}
            </Card>

            <Modal
                title="Confirm Profile Photo"
                open={!!previewImage}
                onOk={confirmUpload}
                confirmLoading={uploading}
                onCancel={() => setPreviewImage(null)}
                okText="Upload Photo"
                okButtonProps={{ type: 'primary', icon: <UploadOutlined /> }}
                centered
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                        Are you sure you want to set this as your new profile picture?
                    </Text>
                    <Avatar 
                        size={150} 
                        src={previewImage} 
                        style={{ border: `3px solid ${colors.info}` }}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default AgentProfile;
