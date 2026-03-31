import React, { useState } from 'react';
import { Form, Select, Input, Alert } from 'antd';
import { colors } from '@/styles/colors';
import SharedModal from '@/shared/components/SharedModal';
import { AlertOutlined } from '@ant-design/icons';

interface LogRiskModalProps {
    open: boolean;
    onCancel: () => void;
    onFinish: (values: any) => Promise<boolean>;
    currentRisk?: string;
}

const LogRiskModal: React.FC<LogRiskModalProps> = ({
    open,
    onCancel,
    onFinish,
    currentRisk = 'Low'
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
            title="Update Risk Assessment"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={submitting}
            centered
            width={500}
            okText="Update Assessment"
        >
            <div style={{ padding: '4px 0' }}>
                <Alert
                    message={`Current Status: ${currentRisk} Risk`}
                    type={currentRisk === 'High' ? 'error' : currentRisk === 'Medium' ? 'warning' : 'info'}
                    showIcon
                    icon={<AlertOutlined />}
                    style={{ marginBottom: '24px', borderRadius: '8px' }}
                />

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        risk_level: currentRisk
                    }}
                >
                    <Form.Item
                        name="risk_level"
                        label="New Risk Level"
                        rules={[{ required: true, message: 'Please select a risk level' }]}
                    >
                        <Select
                            options={[
                                { value: 'Low', label: 'Low Risk' },
                                { value: 'Medium', label: 'Medium Risk' },
                                { value: 'High', label: 'High Risk' },
                            ]}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="assessment_notes"
                        label="Reason for Change / Clinical Assessment"
                        rules={[{ required: true, message: 'Please provide clinical justification' }]}
                        help="Explain why the risk level is being updated (e.g. 'Patient developed high BP')"
                    >
                        <Input.TextArea rows={4} placeholder="Enter clinical assessment details..." />
                    </Form.Item>
                </Form>
            </div>
        </SharedModal>
    );
};

export default LogRiskModal;
