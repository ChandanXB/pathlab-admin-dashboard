import React from 'react';
import { Form, Input, Select, Divider, Typography, Space, Tabs, Upload, message, Row, Col } from 'antd';
import {
    EnvironmentTwoTone,
    PhoneOutlined,
    MailOutlined,
    LockOutlined,
    CarOutlined,
    UserAddOutlined,
    CompassOutlined,
    FormOutlined,
    UploadOutlined
} from '@ant-design/icons';
import type { CollectionAgent } from '../services/collectionAgentService';
import SharedModal from '@/shared/components/SharedModal';
import { VEHICLE_TYPES, ACCOUNT_STATUSES } from '@/shared/constants/app.constants';
import LocationPicker from '@/shared/components/Maps/LocationPicker';
import colors from '@/styles/colors';

const { Option } = Select;
const { Text } = Typography;

interface AgentFormModalProps {
    visible: boolean;
    editingAgent: CollectionAgent | null;
    form: any;
    onOk: () => void;
    onCancel: () => void;
}

const AgentFormModal: React.FC<AgentFormModalProps> = ({
    visible,
    editingAgent,
    form,
    onOk,
    onCancel,
}) => {
    // Handle changes from the LocationPicker
    const handleLocationChange = (data: { lat: number; lng: number; address: string }) => {
        form.setFieldsValue({
            latitude: data.lat,
            longitude: data.lng,
            address: data.address
        });
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
            return Upload.LIST_IGNORE;
        }
    };

    return (
        <SharedModal
            title={editingAgent ? "Edit Collection Agent" : "Add New Collection Agent"}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText={editingAgent ? "Update" : "Create"}
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ status: 'active' }}
            >
                <Row gutter={24} align="top">
                    <Col span={6}>
                        <Form.Item 
                            name="profile_image" 
                            label="Profile Photo"
                            getValueFromEvent={() => form.getFieldValue('profile_image')}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <Upload
                                maxCount={1}
                                beforeUpload={handleFileUpload}
                                accept="image/*"
                                showUploadList={false}
                                listType="picture-card"
                                className="avatar-uploader"
                                style={{ width: '140px', height: '140px', margin: '0 auto' }}
                            >
                                {form.getFieldValue('profile_image') ? (
                                    <img src={form.getFieldValue('profile_image')} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                ) : (
                                    <Space direction="vertical" size={0}>
                                        <UploadOutlined style={{ fontSize: '24px', color: colors.primary }} />
                                        <div style={{ marginTop: 8, fontSize: '13px', fontWeight: 600 }}>Upload</div>
                                    </Space>
                                )}
                            </Upload>
                        </Form.Item>
                    </Col>
                    
                    <Col span={18}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="name"
                                    label="Full Name"
                                    rules={[{ required: true, message: 'Please enter agent name' }]}
                                >
                                    <Input prefix={<UserAddOutlined style={{ color: colors.primary }} />} placeholder="Agent's full name" size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="phone"
                                    label="Phone Number"
                                    rules={[{ required: true, message: 'Please enter phone number' }]}
                                >
                                    <Input prefix={<PhoneOutlined style={{ color: colors.primary }} />} placeholder="e.g. +91 9876543210" size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="email"
                                    label="Email Address"
                                    rules={[
                                        { required: true, message: 'Please enter email' },
                                        { type: 'email', message: 'Invalid email' }
                                    ]}
                                >
                                    <Input prefix={<MailOutlined style={{ color: colors.primary }} />} type="email" placeholder="example@pathlab.com" size="large" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {!editingAgent && (
                    <Form.Item
                        name="password"
                        label="Login Password"
                        rules={[{ required: true, message: 'Please enter a password' }]}
                    >
                        <Input.Password prefix={<LockOutlined style={{ color: colors.primary }} />} placeholder="Default password for login" size="large" />
                    </Form.Item>
                )}

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="vehicle_type"
                            label="Vehicle Type"
                        >
                            <Select placeholder="Select type" prefix={<CarOutlined style={{ color: colors.primary }} />} size="large">
                                {VEHICLE_TYPES.map(vt => (
                                    <Option key={vt.value} value={vt.value}>{vt.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="vehicle_no"
                            label="Vehicle No."
                        >
                            <Input placeholder="e.g. DL-1234" size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="status"
                            label="Account Status"
                        >
                            <Select size="large">
                                {ACCOUNT_STATUSES.map(as => (
                                    <Option key={as.value} value={as.value}>{as.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider style={{ margin: '8px 0 16px 0' }} orientation={"left" as any} orientationMargin={0}>
                    <Space><EnvironmentTwoTone twoToneColor="#eb2f96" /> Location & Address</Space>
                </Divider>

                {/* Hidden fields for lat/lng state */}
                <Form.Item name="latitude" noStyle><Input type="hidden" /></Form.Item>
                <Form.Item name="longitude" noStyle><Input type="hidden" /></Form.Item>

                <Tabs
                    defaultActiveKey="1"
                    type="card"
                    items={[
                        {
                            key: '1',
                            label: <Space><FormOutlined /> Manual Address</Space>,
                            children: (
                                <div style={{ padding: '16px', background: '#fff', borderRadius: '0 0 8px 8px', border: '1px solid #f0f0f0', borderTop: 'none' }}>
                                    <Form.Item
                                        name="address"
                                        rules={[{ required: true, message: 'Please enter current address' }]}
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Input.TextArea
                                            rows={6}
                                            placeholder="Enter agent's full address here..."
                                            style={{ borderRadius: '8px' }}
                                        />
                                    </Form.Item>
                                    <Text type="secondary" style={{ fontSize: '11px', marginTop: 8, display: 'block' }}>
                                        Tip: You can also pick the exact location from the Map tab for better accuracy.
                                    </Text>
                                </div>
                            )
                        },
                        {
                            key: '2',
                            label: <Space><CompassOutlined /> Select on Map</Space>,
                            children: (
                                <div style={{ padding: '16px', background: '#fff', borderRadius: '0 0 8px 8px', border: '1px solid #f0f0f0', borderTop: 'none' }}>
                                    <LocationPicker
                                        height={300}
                                        value={{
                                            lat: form.getFieldValue('latitude'),
                                            lng: form.getFieldValue('longitude'),
                                            address: form.getFieldValue('address')
                                        }}
                                        onChange={handleLocationChange}
                                    />
                                </div>
                            )
                        }
                    ]}
                />
            </Form>
        </SharedModal>
    );
};

export default AgentFormModal;
