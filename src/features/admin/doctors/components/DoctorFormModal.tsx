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
            width={850}
            centered={true}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ status: 'active' }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 16px' }}>
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter doctor name' }]}
                    >
                        <Input placeholder="Dr. John Doe" />
                    </Form.Item>

                    <Form.Item
                        name="specialty"
                        label="Specialty"
                        rules={[{ required: true, message: 'Please enter specialty' }]}
                    >
                        <Input placeholder="e.g. Cardiologist" />
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

                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                        getValueFromEvent={(e) => {
                            let val = e.target.value.replace(/[^\d+]/g, '');
                            if (val.startsWith('+91')) return val.slice(0, 13);
                            if (val.startsWith('91')) return val.slice(0, 12);
                            return val.slice(0, 10);
                        }}
                    >
                        <Input placeholder="9999999999" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email Address (Login ID)"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Invalid email' }
                        ]}
                    >
                        <Input type="email" placeholder="doctor@example.com" />
                    </Form.Item>

                    <Form.Item
                        name="experience_years"
                        label="Experience (Years)"
                    >
                        <Input type="number" placeholder="e.g. 10" />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: editingDoctor ? '1fr' : '2fr 1fr', gap: '0 16px' }}>
                    <Form.Item
                        name="address"
                        label="Clinic Address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <Input placeholder="Clinic or Hospital Address" />
                    </Form.Item>

                    {!editingDoctor && (
                        <Form.Item
                            name="password"
                            label="Login Password"
                            rules={[{ required: true, message: 'Please set a login password' }]}
                        >
                            <Input.Password placeholder="Default password for first login" />
                        </Form.Item>
                    )}
                </div>

                <Form.Item
                    name="bio"
                    label="About Doctor"
                >
                    <Input.TextArea rows={3} placeholder="Brief description about the doctor..." />
                </Form.Item>
            </Form>
        </SharedModal>
    );
};

export default DoctorFormModal;
