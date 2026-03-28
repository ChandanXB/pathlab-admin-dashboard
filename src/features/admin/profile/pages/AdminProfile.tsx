import React, { useState, useEffect } from 'react';
import { 
    Typography, 
    Card, 
    Descriptions, 
    Avatar, 
    Row, 
    Col, 
    Space, 
    Spin, 
    message, 
    Upload, 
    Button, 
    Modal, 
    Form, 
    Input,
    Tag,
    Switch
} from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EditOutlined,
    UploadOutlined,
    SaveOutlined,
    CloseOutlined,
    IdcardOutlined,
    CreditCardOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/features/auth/services/authService';
import colors from '@/styles/colors';
import { formatName } from '@/shared/utils/nameUtils';

const { Title, Text } = Typography;

const AdminProfile: React.FC = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                is_razorpay_enabled: user.is_razorpay_enabled ?? true,
            });
        }
    }, [user, form]);

    const handleUpload = (file: File) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must be smaller than 2MB!');
            return false;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setPreviewImage(reader.result as string);
        };
        return false; // Prevent automatic upload
    };

    const confirmUpload = async () => {
        if (!user?.id || !previewImage) return;
        
        setUploading(true);
        try {
            const res = await authService.updateProfile({ 
                profile_image: previewImage 
            });
            if (res.success) {
                message.success('Profile image updated successfully');
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

    const handleUpdate = async (values: any) => {
        setLoading(true);
        try {
            const res = await authService.updateProfile(values);
            if (res.success) {
                message.success('Profile updated successfully');
                setIsEditing(false);
            } else {
                message.error(res.message || 'Failed to update profile');
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 0, width: '100%', maxWidth: 1000, margin: '0 auto' }}>
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
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.layout.adminGlow} 100%)`,
                    padding: '32px 28px 48px',
                    position: 'relative',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <Avatar
                                size={96}
                                icon={<UserOutlined />}
                                src={user?.profile_image}
                                style={{
                                    background: `${colors.white}${colors.alpha.badgeBg}`,
                                    border: `3px solid ${colors.white}${colors.alpha.badgeGlow}`,
                                    fontSize: '48px',
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
                                        right: -5,
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }}
                                />
                            </Upload>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Title level={2} style={{ color: colors.white, margin: 0 }}>
                                {formatName(user?.name) || 'Administrator'}
                            </Title>
                            <Space wrap>
                                <Tag color={`${colors.white}${colors.alpha.badgeBg}`} style={{ color: colors.white, borderRadius: '8px', border: 'none' }}>
                                    <IdcardOutlined /> {formatName(user?.role?.name) || 'Administrator'}
                                </Tag>
                                <Tag color={colors.success} style={{ borderRadius: '8px' }}>
                                    ACTIVE
                                </Tag>
                            </Space>
                        </div>
                        {!isEditing && (
                            <Button 
                                icon={<EditOutlined />} 
                                onClick={() => setIsEditing(true)}
                                style={{ borderRadius: '8px', fontWeight: 600 }}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                <div style={{ padding: '24px 28px' }}>
                    {!isEditing ? (
                        <Row gutter={[12, 12]}>
                            {[
                                { icon: <UserOutlined />, label: 'FULL NAME', value: formatName(user.name), color: colors.primary, strong: true },
                                { icon: <MailOutlined />, label: 'EMAIL ADDRESS', value: user.email, color: colors.primary, strong: false },
                                { icon: <PhoneOutlined />, label: 'PHONE NUMBER', value: user.phone || 'Not provided', color: colors.primary, strong: false },
                                { icon: <CreditCardOutlined />, label: 'RAZORPAY PAYMENT', tag: true, color: colors.primary }
                            ].map((item, index) => (
                                <Col key={index} xs={24} sm={12} md={6}>
                                    <div style={{ 
                                        background: '#fafafa', 
                                        padding: '12px 16px', 
                                        borderRadius: '12px', 
                                        border: '1px solid #f0f0f0',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                    }}>
                                        <Space style={{ color: item.color, fontSize: '10px' }}>
                                            {item.icon}
                                            <Text type="secondary" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.02em' }}>{item.label}</Text>
                                        </Space>
                                        {item.tag ? (
                                            <div style={{ marginTop: 2 }}>
                                                <Tag color={user.is_razorpay_enabled ? 'green' : 'red'} style={{ borderRadius: '4px', margin: 0, fontSize: '11px' }}>
                                                    {user.is_razorpay_enabled ? 'ENABLED' : 'DISABLED'}
                                                </Tag>
                                            </div>
                                        ) : (
                                            <Text strong={item.strong} style={{ fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.value}
                                            </Text>
                                        )}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleUpdate}
                            initialValues={{
                                name: user.name,
                                email: user.email,
                                phone: user.phone,
                            }}
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="name"
                                        label="Full Name"
                                        rules={[{ required: true, message: 'Please enter your name' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Full Name" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="email"
                                        label="Email Address"
                                        rules={[
                                            { required: true, message: 'Please enter your email' },
                                            { type: 'email', message: 'Please enter a valid email' }
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="Email Address" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="phone"
                                        label="Phone Number"
                                    >
                                        <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="is_razorpay_enabled"
                                        label="Razorpay Payment Status"
                                        valuePropName="checked"
                                        help="Enable or disable Razorpay as a payment option for consultations"
                                    >
                                        <Switch 
                                            checkedChildren="Enabled" 
                                            unCheckedChildren="Disabled" 
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Space style={{ marginTop: 16 }}>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                    style={{ borderRadius: '8px' }}
                                >
                                    Save Changes
                                </Button>
                                <Button 
                                    icon={<CloseOutlined />} 
                                    onClick={() => setIsEditing(false)}
                                    style={{ borderRadius: '8px' }}
                                >
                                    Cancel
                                </Button>
                            </Space>
                        </Form>
                    )}
                </div>
            </Card>

            <Card
                title={<Space><IdcardOutlined style={{ color: colors.primary }} /><Text strong>Account Information</Text></Space>}
                style={{ borderRadius: '16px', boxShadow: `0 2px 8px ${colors.cardShadow}` }}
            >
                 <Descriptions column={1}>
                    <Descriptions.Item label="Account ID">
                        <Tag style={{ fontFamily: 'monospace' }}>ADMIN-{user.id.toString().padStart(4, '0')}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Role Persistence">
                        <Text type="secondary">System Administrator Access</Text>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Modal
                title="Update Profile Picture"
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
                        Are you sure you want to update your profile picture?
                    </Text>
                    <Avatar 
                        size={150} 
                        src={previewImage} 
                        style={{ border: `3px solid ${colors.primary}`, background: colors.background }}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default AdminProfile;
