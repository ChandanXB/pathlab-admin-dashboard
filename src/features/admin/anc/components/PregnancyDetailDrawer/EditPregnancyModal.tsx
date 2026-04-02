import React, { useState, useEffect } from 'react';
import { Form, DatePicker, InputNumber, Row, Col, Divider, Select, Upload, Button, message, Input } from 'antd';
import dayjs from 'dayjs';
import { colors } from '@/styles/colors';
import type { Pregnancy } from '../../services/ancService';
import SharedModal from '@/shared/components/SharedModal';
import { UploadOutlined } from '@ant-design/icons';

interface EditPregnancyModalProps {
    open: boolean;
    onCancel: () => void;
    data: Pregnancy | null;
    onFinish: (id: number, values: any) => Promise<boolean>;
}

const EditPregnancyModal: React.FC<EditPregnancyModalProps> = ({
    open,
    onCancel,
    data,
    onFinish
}) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        if (open && data) {
            form.setFieldsValue({
                lmp_date: dayjs(data.lmp_date),
                edd_date: dayjs(data.edd_date),
                gravida: data.gravida,
                para: data.para,
                abortions: data.abortions,
                living_children: data.living_children,
                risk_level: data.risk_level || 'Low',
                previous_complications: data.previous_complications,
                report_url: data.report_url,
                report_name: data.report_name
            });

            if (data.report_url) {
                setFileList([{
                    uid: '-1',
                    name: data.report_name || 'Existing Report',
                    status: 'done',
                    url: data.report_url
                }]);
            } else {
                setFileList([]);
            }
        }
    }, [open, data, form]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileUpload = async (file: File) => {
        try {
            const base64 = await fileToBase64(file);
            form.setFieldsValue({ report_url: base64, report_name: file.name });
            setFileList([{
                uid: '-1',
                name: file.name,
                status: 'done',
                url: base64
            }]);
            return false;
        } catch (error) {
            message.error('Failed to process report file');
            return Upload.LIST_IGNORE;
        }
    };

    const handleSubmit = async () => {
        try {
            if (!data) return;
            const values = await form.validateFields();
            setSubmitting(true);
            const success = await onFinish(data.id, {
                ...values,
                lmp_date: values.lmp_date.format('YYYY-MM-DD'),
                edd_date: values.edd_date.format('YYYY-MM-DD')
            });
            if (success) {
                onCancel();
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SharedModal
            title="Edit Pregnancy Profile"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={submitting}
            centered
            width={600}
            okText="Update Profile"
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: '20px' }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="lmp_date"
                            label="Last Menstrual Period (LMP)"
                            rules={[{ required: true, message: 'Please select LMP date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="edd_date"
                            label="Estimated Date of Delivery (EDD)"
                            rules={[{ required: true, message: 'Please select EDD date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider plain style={{ margin: '8px 0 16px' }}>
                    <span style={{ fontSize: '12px', color: colors.ui.label }}>CLINICAL HISTORY (G/P/A/L)</span>
                </Divider>

                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name="gravida" label="Gravida (G)" rules={[{ required: true }]}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="para" label="Para (P)" rules={[{ required: true }]}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="abortions" label="Abortion (A)" rules={[{ required: true }]}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="living_children" label="Living (L)" rules={[{ required: true }]}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="previous_complications" label="Previous Complications (Optional)">
                    <Input.TextArea rows={2} placeholder="Any historical clinical details or complications..." />
                </Form.Item>

                <Divider style={{ margin: '16px 0' }} />

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="risk_level" label="Risk Assessment Level">
                            <Select
                                options={[
                                    { value: 'Low', label: 'Low Risk' },
                                    { value: 'Medium', label: 'Medium Risk' },
                                    { value: 'High', label: 'High Risk' },
                                ]}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="report_url" 
                            label="Clinical Report"
                            getValueFromEvent={() => form.getFieldValue('report_url')}
                        >
                            <Upload
                                maxCount={1}
                                fileList={fileList}
                                beforeUpload={handleFileUpload}
                                onRemove={() => {
                                    setFileList([]);
                                    form.setFieldsValue({ report_url: undefined, report_name: undefined });
                                }}
                                listType="text"
                                accept="image/*,application/pdf"
                            >
                                <Button icon={<UploadOutlined />} style={{ borderRadius: '8px' }}>Update Report</Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item name="report_name" hidden><Input /></Form.Item>
                    </Col>
                </Row>
            </Form>
        </SharedModal>
    );
};

export default EditPregnancyModal;
