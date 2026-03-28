import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Divider, Spin, message, Row, Col, Space, Button, Form, Input, Upload, Tabs } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined, EditOutlined, UploadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { doctorService } from '@/features/admin/doctors/services/doctorService';
import colors from '@/styles/colors';
import type { Doctor } from '@/features/admin/doctors/types/doctor.types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatDoctorName = (name: string) => {
    if (!name) return 'Doctor';
    let cleanName = name.trim();
    // Handle redundant Dr. prefix
    if (/^dr\.?\s+/i.test(cleanName)) {
        cleanName = cleanName.replace(/^dr\.?\s+/i, '');
    }
    return `Dr. ${toTitleCase(cleanName)}`;
};

const DoctorProfile: React.FC = () => {
    const { user, updateUser } = useAuthStore();
    const [profile, setProfile] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    const fetchProfile = async () => {
        if (!user?.doctorId) return;
        setLoading(true);
        try {
            const res = await doctorService.getDoctorById(user.doctorId);
            if (res?.success) {
                setProfile(res.data);
            }
        } catch (err) {
            message.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user?.doctorId]);

    const handleTabChange = (key: string) => {
        if (key === 'edit' && profile) {
            form.setFieldsValue({
                name: toTitleCase(profile.name.replace(/^dr\.?\s+/i, '')),
                email: profile.email,
                phone: profile.phone,
                specialty: toTitleCase(profile.specialty || ''),
                experience_years: profile.experience_years,
                address: profile.address,
                bio: profile.bio,
                profile_image: profile.profile_image
            });
        }
        setActiveTab(key);
    };

    const handleEditClick = () => {
        handleTabChange('edit');
    };

    const handleUpdateSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!user?.doctorId) return;
            setSaving(true);
            const res = await doctorService.updateDoctor(user.doctorId, {
                ...values,
                name: toTitleCase(values.name),
                specialty: values.specialty ? toTitleCase(values.specialty) : values.specialty
            });
            if (res.success) {
                message.success('Profile updated successfully');
                setActiveTab('overview');
                fetchProfile();
                updateUser({ 
                    ...user, 
                    name: toTitleCase(values.name), 
                    email: values.email 
                });
            }
        } catch (error: any) {
            if (error.errorFields) return; // Validation failed
            message.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileUpload = async (file: File) => {
        try {
            const base64 = await fileToBase64(file);
            form.setFieldsValue({ profile_image: base64 });
            return false;
        } catch (error) {
            message.error('Failed to process image');
            return false;
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
        <div style={{ padding: '4px', width: '100%' }}>
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
                    background: `linear-gradient(135deg, ${colors.primary} 0%, #004d40 100%)`,
                    padding: '32px 28px 48px',
                    position: 'relative',
                }}>
                    <Button 
                        type="primary" 
                        shape="round" 
                        icon={<EditOutlined />} 
                        onClick={handleEditClick}
                        style={{ position: 'absolute', top: 24, right: 24, backgroundColor: 'rgba(255,255,255,0.2)', border: 'none' }}
                    >
                        Edit Profile
                    </Button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <Avatar
                            size={84}
                            icon={<UserOutlined />}
                            src={profile?.profile_image}
                            style={{
                                background: `${colors.white}${colors.alpha.badgeBg}`,
                                border: `3px solid ${colors.white}${colors.alpha.badgeGlow}`,
                                fontSize: '40px',
                            }}
                        />
                        <div>
                            <Title level={2} style={{ color: colors.white, margin: 0, fontWeight: 700 }}>
                                {formatDoctorName(profile?.name || user?.name || '')}
                            </Title>
                             <Space align="center" style={{ marginTop: 8 }}>
                                <Text style={{ color: colors.white, opacity: 0.9, fontSize: 16 }}>
                                    {profile?.specialty ? toTitleCase(profile.specialty) : 'General Practitioner'}
                                </Text>
                            </Space>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div style={{ background: colors.background }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        style={{ padding: '0 24px' }}
                        items={[
                            {
                                key: 'overview',
                                label: 'Overview',
                                children: (
                                    <div style={{ padding: '16px 4px 24px' }}>
                                        <Title level={5} style={{ marginBottom: 16 }}>
                                            <UserOutlined style={{ marginRight: 8, color: colors.primary }} />
                                            Contact Settings
                                        </Title>
                                        <Row gutter={[24, 16]}>
                                            <Col xs={24} md={12}>
                                                <Card size="small" variant="borderless" style={{ background: '#fafafa', borderRadius: 8 }}>
                                                    <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>EMAIL</Text>
                                                    <Space><MailOutlined style={{ color: '#8c8c8c' }} /><Text strong>{profile?.email}</Text></Space>
                                                </Card>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Card size="small" variant="borderless" style={{ background: '#fafafa', borderRadius: 8 }}>
                                                    <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>PHONE</Text>
                                                    <Space><PhoneOutlined style={{ color: '#8c8c8c' }} /><Text strong>{profile?.phone}</Text></Space>
                                                </Card>
                                            </Col>
                                        </Row>

                                        <Divider />

                                        <Title level={5} style={{ marginBottom: 16 }}>
                                            <SafetyCertificateOutlined style={{ marginRight: 8, color: colors.primary }} />
                                            Professional Summary
                                        </Title>
                                        <Row gutter={[24, 16]}>
                                            <Col xs={24} md={12}>
                                                <Text type="secondary" style={{ fontSize: 13 }}>Experience</Text>
                                                <div style={{ marginTop: 4, fontWeight: 600 }}>{profile?.experience_years ? `${profile.experience_years} Years` : 'Not Specified'}</div>
                                            </Col>
                                        </Row>
                                        <div style={{ marginTop: 16 }}>
                                            <Text type="secondary" style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>Bio</Text>
                                            <Paragraph style={{ color: colors.textDark, lineHeight: 1.6, background: '#fafafa', padding: 12, borderRadius: 8 }}>
                                                {profile?.bio || 'No professional biography provided yet.'}
                                            </Paragraph>
                                        </div>

                                        <Divider />

                                        <Title level={5} style={{ marginBottom: 16 }}>
                                            <HomeOutlined style={{ marginRight: 8, color: colors.primary }} />
                                            Address
                                        </Title>
                                        <Paragraph style={{ color: colors.textDark }}>
                                            {profile?.address || 'No clinic or resident address specified.'}
                                        </Paragraph>
                                    </div>
                                )
                            },
                            {
                                key: 'edit',
                                label: 'Edit Profile',
                                children: (
                                    <div style={{ padding: '16px 4px 24px' }}>
                                        <Form form={form} layout="vertical" onFinish={handleUpdateSubmit}>
                                            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 16 }}>
                                                <Form.Item 
                                                    name="profile_image" 
                                                    label="Profile Photo"
                                                    style={{ margin: 0 }}
                                                    getValueFromEvent={() => form.getFieldValue('profile_image')}
                                                >
                                                    <Upload
                                                        maxCount={1}
                                                        beforeUpload={handleFileUpload}
                                                        accept="image/*"
                                                        showUploadList={false}
                                                        listType="picture-card"
                                                        style={{ width: '100px', height: '100px' }}
                                                    >
                                                        {form.getFieldValue('profile_image') ? (
                                                            <div style={{ overflow: 'hidden', height: '100%', width: '100%' }}>
                                                                <img src={form.getFieldValue('profile_image')} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <UploadOutlined />
                                                                <div style={{ marginTop: 8 }}>Upload</div>
                                                            </div>
                                                        )}
                                                    </Upload>
                                                </Form.Item>
                                                <div style={{ flex: 1 }}>
                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
                                                                <Input />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item label="Specialty" name="specialty">
                                                                <Input />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </div>

                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item label="Experience (Years)" name="experience_years">
                                                        <Input type="number" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            
                                            <Form.Item label="Address" name="address">
                                                <Input />
                                            </Form.Item>
                                            
                                            <Form.Item label="Biography" name="bio">
                                                <TextArea rows={4} maxLength={500} showCount />
                                            </Form.Item>

                                            <div style={{ textAlign: 'right', marginTop: '32px' }}>
                                                <Button style={{ marginRight: 12 }} onClick={() => setActiveTab('overview')}>
                                                    Cancel
                                                </Button>
                                                <Button type="primary" htmlType="submit" loading={saving}>
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </Card>
        </div>
    );
};

export default DoctorProfile;
