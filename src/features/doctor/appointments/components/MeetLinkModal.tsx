import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Typography, DatePicker, TimePicker, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { VideoCameraOutlined } from '@ant-design/icons';
import { appointmentService } from '../services/appointmentService';

const { Text } = Typography;

interface MeetLinkModalProps {
    open: boolean;
    appointment: any;
    onClose: () => void;
    onSuccess?: (meetLink: string, newDate: string, newTime: string) => void;
}

const MeetLinkModal: React.FC<MeetLinkModalProps> = ({ open, appointment, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    // Read directly from the DB logic we piped through
    const getSavedLink = () => appointment?.doctor?.meet_link || '';

    const handleSendLink = async (values: { meet_link: string; date?: any; time?: any }) => {
        if (!appointment) return;
        setSubmitting(true);
        try {
            const payload = {
                meet_link: values.meet_link,
                date: values.date ? values.date.format('YYYY-MM-DD') : undefined,
                time: values.time ? values.time.format('hh:mm A') : undefined,
            };

            const data = await appointmentService.sendMeetLink(appointment.id, payload);
            if (data?.success) {
                message.success('Meet link saved and sent to the patient via email.');
                if (onSuccess) onSuccess(values.meet_link, payload.date, payload.time);
                onClose();
            }
        } catch (error: any) {
            console.error('Failed to send meet link:', error);
            const errMsg = error.response?.data?.message || 'Failed to send meet link';
            message.error(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title={<><VideoCameraOutlined style={{ color: '#1890ff', marginRight: 8 }} /> Send Google Meet Link</>}
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            centered
        >
            <div style={{ marginBottom: 20 }}>
                <Text type="secondary">
                    Send a consultation link to <strong>{appointment?.patient?.full_name}</strong>. You can adjust the scheduled date and time if needed.
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                initialValues={{ 
                    meet_link: getSavedLink(),
                    date: appointment?.appointment_date ? dayjs(appointment.appointment_date) : undefined,
                    time: appointment?.appointment_time ? dayjs(appointment.appointment_time, 'hh:mm A') : undefined,
                }}
                onFinish={handleSendLink}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="date"
                            label="Scheduled Date"
                            rules={[{ required: true, message: 'Please select a date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} size="large" format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="time"
                            label="Scheduled Time"
                            rules={[{ required: true, message: 'Please select a time' }]}
                        >
                            <TimePicker style={{ width: '100%' }} size="large" format="hh:mm A" use12Hours />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="meet_link"
                    label="Google Meet URL"
                    rules={[
                        { required: true, message: 'Please provide a valid Google Meet link' },
                        { type: 'url', message: 'Please enter a valid URL (e.g., https://meet.google.com/...)' }
                    ]}
                >
                    <Input 
                        placeholder="https://meet.google.com/xxx-yyy-zzz" 
                        size="large"
                        prefix={<VideoCameraOutlined style={{ color: '#aaa', marginRight: 8 }} />}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 30 }}>
                    <Button onClick={onClose} style={{ marginRight: 12 }}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                        Send Email Link
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default MeetLinkModal;
