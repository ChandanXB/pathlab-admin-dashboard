import React from 'react';
import { Form, Input, Select } from 'antd';
import type { CollectionAgent } from '../services/collectionAgentService';
import SharedModal from '@/shared/components/SharedModal';
import { VEHICLE_TYPES, ACCOUNT_STATUSES } from '@/shared/constants/app.constants';

const { Option } = Select;

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
                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="name"
                        label="Full Name"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Please enter agent name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email Address (Login ID)"
                        style={{ flex: 1 }}
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Invalid email' }
                        ]}
                    >
                        <Input type="email" />
                    </Form.Item>
                </div>

                {!editingAgent && (
                    <Form.Item
                        name="password"
                        label="Login Password"
                        rules={[{ required: true, message: 'Please enter a password for the agent account' }]}
                    >
                        <Input.Password placeholder="Default password for login" />
                    </Form.Item>
                )}

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="vehicle_type"
                        label="Vehicle Type"
                        style={{ flex: 1 }}
                    >
                        <Select placeholder="Select type">
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
                </div>

                <Form.Item
                    name="address"
                    label="Current Address"
                    rules={[{ required: true, message: 'Please enter current address' }]}
                >
                    <Input.TextArea rows={3} placeholder="Enter full address" style={{ borderRadius: '8px' }} />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Status"
                >
                    <Select>
                        {ACCOUNT_STATUSES.map(as => (
                            <Option key={as.value} value={as.value}>{as.label}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </SharedModal>
    );
};

export default AgentFormModal;
