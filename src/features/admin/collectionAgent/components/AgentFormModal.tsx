import React from 'react';
import { Form, Input, Select, Divider, Typography, Space, Tabs, Upload, message } from 'antd';
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
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <Form.Item 
                        name="profile_image" 
                        label="Profile Photo"
                        getValueFromEvent={() => {
                            // AntD Upload throws an event, we ignore it and return the string we set manually
                            return form.getFieldValue('profile_image');
                        }}
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
                                <img src={form.getFieldValue('profile_image')} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            ) : (
                                <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                            )}
                        </Upload>
                    </Form.Item>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Form.Item
                            name="name"
                            label="Full Name"
                            rules={[{ required: true, message: 'Please enter agent name' }]}
                        >
                        <Input prefix={<UserAddOutlined style={{ color: '#bfbfbf' }} />} placeholder="Agent's full name" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                        <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} placeholder="e.g. +91 9876543210" />
                    </Form.Item>
                        <Form.Item
                            name="email"
                            label="Email Address"
                            rules={[
                                { required: true, message: 'Please enter email' },
                                { type: 'email', message: 'Invalid email' }
                            ]}
                        >
                            <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} type="email" placeholder="example@pathlab.com" />
                        </Form.Item>
                    </div>
                </div>

                {!editingAgent && (
                    <Form.Item
                        name="password"
                        label="Login Password"
                        rules={[{ required: true, message: 'Please enter a password' }]}
                    >
                        <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Default password for login" />
                    </Form.Item>
                )}

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="vehicle_type"
                        label="Vehicle Type"
                        style={{ flex: 1 }}
                    >
                        <Select placeholder="Select type" prefix={<CarOutlined style={{ color: '#bfbfbf' }} />}>
                            {VEHICLE_TYPES.map(vt => (
                                <Option key={vt.value} value={vt.value}>{vt.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="vehicle_no"
                        label="Vehicle No."
                        style={{ flex: 1 }}
                    >
                        <Input placeholder="e.g. DL-1234" />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Account Status"
                        style={{ flex: 1 }}
                    >
                        <Select>
                            {ACCOUNT_STATUSES.map(as => (
                                <Option key={as.value} value={as.value}>{as.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

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
