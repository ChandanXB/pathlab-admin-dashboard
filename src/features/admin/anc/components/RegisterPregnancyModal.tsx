import React, { useState } from 'react';
import { Form, DatePicker, InputNumber, Row, Col, Divider, Select, Spin, Empty, Input, Upload, message, Button, Typography } from 'antd';
import { colors } from '@/styles/colors';
import { patientService } from '../../patients/services/patientService';
import type { Patient } from '../../patients/types/patient.types';
import { SearchOutlined, UploadOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import SharedModal from '@/shared/components/SharedModal';
import PatientFormModal from '../../patients/components/PatientFormModal';


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
    const [searchQuery, setSearchQuery] = useState('');

    // New patient modal states
    const [quickAddVisible, setQuickAddVisible] = useState(false);
    const [quickAddForm] = Form.useForm();

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
        setSearchQuery(value);
        if (value.length < 2) {
            setPatients([]);
            return;
        }
        try {
            setSearching(true);
            // Specifically search for Female patients for ANC Care
            const data = await patientService.searchPatients(value, 'Female');
            setPatients(data);
        } catch (error) {
            console.error('Failed to search patients', error);
        } finally {
            setSearching(false);
        }
    };

    const handleQuickAddPatient = async (values: any) => {
        try {
            const response = await patientService.createPatient(values);
            if (response.success) {
                message.success('Patient registered successfully');
                const newPatient = response.data;
                setPatients(prev => [newPatient, ...prev]);
                form.setFieldsValue({ mother_patient_id: newPatient.id });
                setQuickAddVisible(false);
                quickAddForm.resetFields();
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to register patient');
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
                        placeholder="Search for a female patient..."
                        defaultActiveFirstOption={false}
                        suffixIcon={<SearchOutlined />}
                        filterOption={false}
                        onSearch={handleSearch}
                        loading={searching}
                        optionLabelProp="label"
                        notFoundContent={
                            searching ? (
                                <Spin size="small" />
                            ) : searchQuery ? (
                                <div style={{ padding: '12px', textAlign: 'center' }}>
                                    <div style={{ marginBottom: '8px', color: '#888' }}>
                                        No patient found for "{searchQuery}"
                                    </div>
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            quickAddForm.setFieldsValue({ 
                                                full_name: searchQuery,
                                                gender: 'Female' 
                                            });
                                            setQuickAddVisible(true);
                                        }}
                                        style={{ borderRadius: '6px' }}
                                    >
                                        Add New Patient
                                    </Button>
                                </div>
                            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Type to search patients" />
                        }
                        style={{ width: '100%', borderRadius: '8px' }}
                    >
                        {patients.map(p => (
                            <Select.Option key={p.id} value={p.id} label={`${p.full_name} (${p.patient_code})`}>
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

            {/* Quick Add Patient Modal */}
            <PatientFormModal
                visible={quickAddVisible}
                editingPatient={null}
                form={quickAddForm}
                onSubmit={handleQuickAddPatient}
                onCancel={() => setQuickAddVisible(false)}
            />
        </SharedModal>
    );
};

export default RegisterPregnancyModal;
