import React, { useState } from 'react';
import { Form, DatePicker, InputNumber, Row, Col, Divider, Select, Spin, Empty, Input, Upload, message, Button, Typography } from 'antd';
import { colors } from '@/styles/colors';
import { patientService } from '../../patients/services/patientService';
import type { Patient } from '../../patients/types/patient.types';
import { SearchOutlined, UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import SharedModal from '@/shared/components/SharedModal';


interface RegisterPregnancyModalProps {
    open: boolean;
    onCancel: () => void;
    onFinish: (values: any) => Promise<boolean>;
}

const RegisterPregnancyModal: React.FC<RegisterPregnancyModalProps> = ({
    open,
    onCancel,
    onFinish
}) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [searching, setSearching] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [fileList, setFileList] = useState<any[]>([]);

    const gravida = Form.useWatch('gravida', form);

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

    const handleSearch = async (value: string) => {
        if (value.length < 3) return;
        try {
            setSearching(true);
            const data = await patientService.searchPatients(value);
            setPatients(data);
        } catch (error) {
            console.error('Failed to search patients', error);
        } finally {
            setSearching(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            const success = await onFinish({
                ...values,
                lmp_date: values.lmp_date.format('YYYY-MM-DD')
            });
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
            title="Enroll ANC Patient"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={submitting}
            centered
            width={650}
            okText="Start Journey"
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    gravida: 1,
                    para: 0,
                    abortions: 0,
                    living_children: 0,
                    risk_level: 'Low'
                }}
                style={{ marginTop: '20px' }}
            >
                <Form.Item
                    name="mother_patient_id"
                    label="Select Patient (Mother)"
                    rules={[{ required: true, message: 'Please select a patient' }]}
                    help="Search by name, phone or patient code (type 3+ characters)"
                >
                    <Select
                        showSearch
                        placeholder="Search for an existing patient..."
                        defaultActiveFirstOption={false}
                        suffixIcon={<SearchOutlined />}
                        filterOption={false}
                        onSearch={handleSearch}
                        loading={searching}
                        notFoundContent={searching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No patients found" />}
                        style={{ width: '100%' }}
                    >
                        {patients.map(p => (
                            <Select.Option key={p.id} value={p.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{p.full_name} ({p.patient_code})</span>
                                    <span style={{ color: colors.ui.label, fontSize: '12px' }}>{p.phone}</span>
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="lmp_date"
                            label="Last Menstrual Period (LMP)"
                            rules={[{ required: true, message: 'LMP date is required' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="risk_level" label="Risk Assessment Level">
                            <Select
                                options={[
                                    { value: 'Low', label: 'Low Risk' },
                                    { value: 'Medium', label: 'Medium Risk' },
                                    { value: 'High', label: 'High Risk' },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider plain style={{ margin: '8px 0 16px' }}>
                    <span style={{ fontSize: '12px', color: colors.ui.label }}>OBSTETRIC HISTORY (G/P/A/L)</span>
                </Divider>

                <Row gutter={12}>
                    <Col span={6}>
                        <Form.Item name="gravida" label="Gravida (G)">
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="para" label="Para (P)">
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="abortions" label="Abortion (A)">
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="living_children" label="Living (L)">
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="previous_complications" label="Previous Complications (Optional)">
                    <Input.TextArea rows={3} placeholder="Any historical clinical details or complications..." />
                </Form.Item>

                <Divider plain style={{ margin: '8px 0 16px' }}>
                    <span style={{ fontSize: '12px', color: colors.ui.label }}>
                        {gravida > 1 ? 'PREVIOUS PREGNANCY SUMMARY (REQUIRED)' : 'DOCUMENT UPLOADS'}
                    </span>
                </Divider>

                {gravida > 1 && (
                    <div style={{ marginBottom: '16px', padding: '10px', background: '#fff7e6', borderRadius: '8px', border: '1px solid #ffe7ba' }}>
                        <Typography.Text style={{ fontSize: '12px', color: '#d46b08' }}>
                            <FileTextOutlined /> Since this is not the first pregnancy, please upload a report or summary of the previous clinical journey.
                        </Typography.Text>
                    </div>
                )}

                <Form.Item 
                    name="report_url" 
                    label="Clinical Report / Past Summary"
                    extra="Upload a past pregnancy report or a current diagnostic summary (Image or PDF)"
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
                        listType="picture"
                        accept="image/*,application/pdf"
                    >
                        <Button icon={<UploadOutlined />} style={{ borderRadius: '8px' }}>Select Report File</Button>
                    </Upload>
                </Form.Item>
                <Form.Item name="report_name" hidden><Input /></Form.Item>
            </Form>
        </SharedModal>
    );
};

export default RegisterPregnancyModal;
