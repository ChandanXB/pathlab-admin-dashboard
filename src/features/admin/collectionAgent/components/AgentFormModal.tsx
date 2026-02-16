import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import type { CollectionAgent } from '../services/collectionAgentService';

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
        <Modal
            title={editingAgent ? "Edit Collection Agent" : "Add New Collection Agent"}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText={editingAgent ? "Update" : "Create"}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ status: 'active' }}
            >
                <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter agent name' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email Address (Login ID)"
                    rules={[
                        { required: true, message: 'Please enter email' },
                        { type: 'email', message: 'Invalid email' }
                    ]}
                >
                    <Input type="email" />
                </Form.Item>

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
                            <Option value="Bike">Bike</Option>
                            <Option value="Scooter">Scooter</Option>
                            <Option value="Car">Car</Option>
                            <Option value="Cycle">Cycle</Option>
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
                    name="status"
                    label="Status"
                >
                    <Select>
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AgentFormModal;
