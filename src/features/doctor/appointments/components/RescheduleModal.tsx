import React, { useState, useEffect } from 'react';
import { Modal, Form, DatePicker, TimePicker, Input, Button, message, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { appointmentService } from '../services/appointmentService';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

interface RescheduleModalProps {
    open: boolean;
    appointment: any;
    onClose: () => void;
    onSuccess?: (appointmentId: number, newDate: string, newTime: string) => void;
}



const RescheduleModal: React.FC<RescheduleModalProps> = ({ open, appointment, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && appointment) {
            form.setFieldsValue({
                date: dayjs(appointment.appointment_date),
                time: appointment.appointment_time ? dayjs(appointment.appointment_time, 'hh:mm A') : undefined,
                reason: 'Doctor availability updates'
            });
        }
    }, [open, appointment, form]);

    const handleReschedule = async (values: any) => {
        if (!appointment) return;
        setSubmitting(true);
        try {
            const formattedDate = values.date.format('YYYY-MM-DD');
            const formattedTime = values.time.format('hh:mm A');
            const data = await appointmentService.rescheduleAppointment(appointment.id, {
                date: formattedDate,
                time: formattedTime,
                reason: values.reason
            });
            
            if (data?.success) {
                message.success('Appointment rescheduled and patient notified.');
                if (onSuccess) onSuccess(appointment.id, formattedDate, formattedTime);
                onClose();
            }
        } catch (error: any) {
            console.error('Failed to reschedule:', error);
            const errMsg = error.response?.data?.message || 'Failed to reschedule';
            message.error(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title={<><CalendarOutlined style={{ color: '#f59e0b', marginRight: 8 }} /> Reschedule Appointment</>}
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            centered
        >
            <div style={{ marginBottom: 20 }}>
                <Text type="secondary">
                    Reschedule the appointment for <strong>{appointment?.patient?.full_name}</strong>. An email notification will be sent.
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleReschedule}
            >
                <Form.Item
                    name="date"
                    label="New Date"
                    rules={[{ required: true, message: 'Please select a date' }]}
                >
                    <DatePicker 
                        style={{ width: '100%' }} 
                        size="large"
                        format="DD/MM/YY"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                </Form.Item>

                <Form.Item
                    name="time"
                    label="New Time Slot"
                    rules={[{ required: true, message: 'Please select a time slot' }]}
                >
                    <TimePicker style={{ width: '100%' }} size="large" format="hh:mm A" use12Hours />
                </Form.Item>

                <Form.Item
                    name="reason"
                    label="Reason for Rescheduling"
                    rules={[{ required: true, message: 'Please provide a reason' }]}
                >
                    <TextArea rows={3} placeholder="e.g. Doctor is unavailable" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 30 }}>
                    <Button onClick={onClose} style={{ marginRight: 12 }}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={submitting} style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}>
                        Confirm Reschedule
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RescheduleModal;
