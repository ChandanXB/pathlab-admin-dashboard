import React, { useState } from 'react';
import { Form, DatePicker, InputNumber, Input, Row, Col, Divider, Select } from 'antd';
import dayjs from 'dayjs';
import { colors } from '@/styles/colors';
import SharedModal from '@/shared/components/SharedModal';

interface LogVisitModalProps {
    open: boolean;
    onCancel: () => void;
    onFinish: (values: any) => Promise<boolean>;
    currentWeeks: number;
}

const LogVisitModal: React.FC<LogVisitModalProps> = ({
    open,
    onCancel,
    onFinish,
    currentWeeks
}) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            const success = await onFinish(values);
            if (success) {
                form.resetFields();
                onCancel();
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SharedModal
            title="Log Antenatal Visit"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={submitting}
            centered
            width={600}
            okText="Save Visit"
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    visit_date: dayjs(),
                    gestational_age_weeks: currentWeeks,
                    fetal_movement: 'Normal'
                }}
                style={{ marginTop: '20px' }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="visit_date"
                            label="Visit Date"
                            rules={[{ required: true, message: 'Please select visit date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="gestational_age_weeks"
                            label="Gestational Age (Weeks)"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <InputNumber min={1} max={42} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider plain style={{ margin: '8px 0 16px' }}>
                    <span style={{ fontSize: '12px', color: colors.ui.label }}>VITALS</span>
                </Divider>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="weight_kg" label="Weight (kg)">
                            <InputNumber precision={1} step={0.1} style={{ width: '100%' }} placeholder="0.0" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="bp_systolic" label="BP Systolic">
                            <InputNumber min={60} max={220} style={{ width: '100%' }} placeholder="120" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="bp_diastolic" label="BP Diastolic">
                            <InputNumber min={40} max={140} style={{ width: '100%' }} placeholder="80" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="fundal_height" label="Fundal Height (cm / symphysis)">
                            <Input placeholder="e.g. 24cm" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="fetal_movement" label="Fetal Movement">
                            <Select
                                options={[
                                    { value: 'Normal', label: 'Normal' },
                                    { value: 'Increased', label: 'Increased' },
                                    { value: 'Decreased', label: 'Decreased' },
                                    { value: 'None', label: 'None' },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="notes" label="Clinical Notes / Observations">
                    <Input.TextArea rows={3} placeholder="Any specific complications or advice..." />
                </Form.Item>
            </Form>
        </SharedModal>
    );
};

export default LogVisitModal;
