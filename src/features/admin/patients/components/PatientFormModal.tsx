import React from 'react';
import { Form, Input, Select, DatePicker, Row, Col } from 'antd';
import SharedModal from '@/shared/components/SharedModal';
import { GENDER_OPTIONS } from '../types/patient.types';
import type { Patient } from '../types/patient.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface PatientFormModalProps {
    visible: boolean;
    editingPatient: Patient | null;
    form: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

const PatientFormModal: React.FC<PatientFormModalProps> = ({
    visible,
    editingPatient,
    form,
    onSubmit,
    onCancel,
}) => {
    return (
        <SharedModal
            title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
            open={visible}
            onOk={() => form.submit()}
            onCancel={onCancel}
            width={800}
            okText={editingPatient ? 'Update' : 'Create'}
        >
            <Form form={form} layout="vertical" onFinish={onSubmit}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="full_name"
                            label="Full Name"
                            rules={[{ required: true, message: 'Please enter full name' }]}
                        >
                            <Input placeholder="e.g., John Doe" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="gender"
                            label="Gender"
                            rules={[{ required: true, message: 'Please select gender' }]}
                        >
                            <Select placeholder="Select gender">
                                {GENDER_OPTIONS.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="dob"
                            label="Date of Birth"
                            rules={[{ required: true, message: 'Please select date of birth' }]}
                            getValueProps={(value) => ({
                                value: value ? dayjs(value) : undefined,
                            })}
                            normalize={(value) => (value ? value.format('YYYY-MM-DD') : '')}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format="DD MMM YYYY"
                                placeholder="Select DOB"
                                disabledDate={(current) => current && current > dayjs().endOf('day')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="phone"
                            label="Phone Number"
                            rules={[
                                { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit phone number' },
                            ]}
                        >
                            <Input placeholder="e.g., 9876543210" maxLength={10} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="address" label="Address">
                    <TextArea rows={2} placeholder="Enter patient address..." />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="emergency_contact" label="Emergency Contact Name">
                            <Input placeholder="e.g., Jane Doe" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="emergency_phone"
                            label="Emergency Contact Phone"
                            rules={[
                                {
                                    pattern: /^[0-9]{10}$/,
                                    message: 'Please enter valid 10-digit phone number',
                                },
                            ]}
                        >
                            <Input placeholder="e.g., 9876543210" maxLength={10} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </SharedModal>
    );
};

export default PatientFormModal;
