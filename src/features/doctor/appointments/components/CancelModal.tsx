import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Typography } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { appointmentService } from '../services/appointmentService';

const { Text } = Typography;
const { TextArea } = Input;

interface CancelModalProps {
    open: boolean;
    appointment: any;
    onClose: () => void;
    onSuccess?: (appointmentId: number) => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ open, appointment, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && appointment) {
            form.setFieldsValue({
                reason: 'Operational reasons'
            });
        }
    }, [open, appointment, form]);

    const handleCancel = async (values: any) => {
        if (!appointment) return;
        setSubmitting(true);
        try {
            const data = await appointmentService.cancelAppointment(appointment.id, {
                reason: values.reason
            });
            
            if (data?.success) {
                message.success('Appointment cancelled and patient notified.');
                if (onSuccess) onSuccess(appointment.id);
                onClose();
            }
        } catch (error: any) {
            console.error('Failed to cancel:', error);
            const errMsg = error.response?.data?.message || 'Failed to cancel appointment';
            message.error(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title={<><CloseCircleOutlined style={{ color: '#ef4444', marginRight: 8 }} /> Cancel Appointment</>}
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            centered
        >
            <div style={{ marginBottom: 20 }}>
                <Text type="secondary">
                    You are electing to cancel the appointment for <strong>{appointment?.patient?.full_name}</strong> on {appointment ? new Date(appointment.appointment_date).toLocaleDateString() : ''}. An email notification will be sent.
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleCancel}
            >
                <Form.Item
                    name="reason"
                    label="Reason for Cancellation"
                    rules={[{ required: true, message: 'Please provide a reason' }]}
                >
                    <TextArea rows={3} placeholder="e.g. Doctor is not available, clinic closed" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 30 }}>
                    <Button onClick={onClose} style={{ marginRight: 12 }}>Back</Button>
                    <Button type="primary" htmlType="submit" loading={submitting} danger>
                        Confirm Cancellation
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CancelModal;
