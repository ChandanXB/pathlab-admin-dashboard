import React, { useState } from 'react';
import { Modal, Form, Select, Button, message, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { appointmentService } from '../services/appointmentService';

const { Text } = Typography;
const { Option } = Select;

interface UpdateStatusModalProps {
    open: boolean;
    appointment: any;
    onClose: () => void;
    onSuccess?: (appointmentId: number, newStatus: string) => void;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ open, appointment, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const handleUpdateStatus = async (values: { status: string }) => {
        if (!appointment) return;
        setSubmitting(true);
        try {
            const data = await appointmentService.updateStatus(appointment.id, values.status);
            if (data?.success) {
                message.success('Appointment status updated successfully.');
                if (onSuccess) onSuccess(appointment.id, values.status);
                onClose();
            }
        } catch (error: any) {
            console.error('Failed to update status:', error);
            const errMsg = error.response?.data?.message || 'Failed to update status';
            message.error(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title={<><EditOutlined style={{ color: '#1890ff', marginRight: 8 }} /> Update Appointment Status</>}
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            centered
        >
            <div style={{ marginBottom: 20 }}>
                <Text type="secondary">
                    Update the status for <strong>{appointment?.patient?.full_name}'s</strong> appointment on {appointment ? new Date(appointment.appointment_date).toLocaleDateString() : ''}.
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                initialValues={{ status: appointment?.status || 'scheduled' }}
                onFinish={handleUpdateStatus}
            >
                <Form.Item
                    name="status"
                    label="Current Status"
                    rules={[{ required: true, message: 'Please select a status' }]}
                >
                    <Select size="large">
                        <Option value="scheduled">Scheduled</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="cancelled">Cancelled</Option>
                    </Select>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 30 }}>
                    <Button onClick={onClose} style={{ marginRight: 12 }}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                        Save Status
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateStatusModal;
