import React from 'react';
import { Form, Input, Select } from 'antd';
import type { Doctor } from '../types/doctor.types';
import SharedModal from '@/shared/components/SharedModal';
import { ACCOUNT_STATUSES } from '@/shared/constants/app.constants';

const { Option } = Select;

interface DoctorFormModalProps {
    visible: boolean;
    editingDoctor: Doctor | null;
    form: any;
    onOk: () => void;
    onCancel: () => void;
}

const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
    visible,
    editingDoctor,
    form,
    onOk,
    onCancel,
}) => {
    return (
        <SharedModal
            title={editingDoctor ? "Edit Doctor" : "Onboard New Doctor"}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText={editingDoctor ? "Update" : "Onboard"}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ status: 'active' }}
            >
                <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter doctor name' }]}
                >
                    <Input placeholder="Dr. John Doe" />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="specialty"
                        label="Specialty"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Please enter specialty' }]}
                    >
                        <Input placeholder="e.g. Cardiologist" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        style={{ flex: 1 }}
                    >
                        <Select>
                            {ACCOUNT_STATUSES.map(as => (
                                <Option key={as.value} value={as.value}>{as.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                        <Input placeholder="9999999999" />
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
                        <Input type="email" placeholder="doctor@example.com" />
                    </Form.Item>
                </div>

                {!editingDoctor && (
                    <Form.Item
                        name="password"
                        label="Login Password"
                        rules={[{ required: true, message: 'Please set a login password' }]}
                    >
                        <Input.Password placeholder="Default password for first login" />
                    </Form.Item>
                )}
            </Form>
        </SharedModal>
    );
};

export default DoctorFormModal;
