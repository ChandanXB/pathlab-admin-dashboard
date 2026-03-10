import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Form, Input, Select, Row, Col, Spin, InputNumber, Divider, DatePicker, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SharedModal from '@/shared/components/SharedModal';
import { PRIORITIES, PAYMENT_STATUSES } from '@/shared/constants/app.constants';
import type { LabOrder } from '../types/labOrder.types';
import { patientService } from '@/features/admin/patients/services/patientService';
import { labTestService } from '@/features/admin/labTests/services/labTestService';
import PatientFormModal from '@/features/admin/patients/components/PatientFormModal';
import debounce from 'lodash/debounce';

const { TextArea } = Input;

interface LabOrderFormModalProps {
    visible: boolean;
    editingOrder: LabOrder | null;
    form: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    submitting?: boolean;
}

const LabOrderFormModal: React.FC<LabOrderFormModalProps> = ({
    visible,
    editingOrder,
    form,
    onSubmit,
    onCancel,
    submitting = false,
}) => {
    const [fetchingPatients, setFetchingPatients] = useState(false);
    const [patientOptions, setPatientOptions] = useState<{ label: string; value: number }[]>([]);
    const [testOptions, setTestOptions] = useState<{ label: string; value: number; price: number }[]>([]);
    const [fetchingTests, setFetchingTests] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [patientModalVisible, setPatientModalVisible] = useState(false);
    const [patientForm] = Form.useForm();

    // Fetch tests on mount
    useEffect(() => {
        setFetchingTests(true);
        labTestService.getTests({ limit: 1000 }).then(res => {
            const options = res.data.map((t: any) => ({
                label: `${t.test_name} (${t.test_code}) - ₹${t.price}`,
                value: t.id,
                price: Number(t.price)
            }));
            setTestOptions(options);
            setFetchingTests(false);
        });
    }, []);

    // Patient search logic
    const fetchPatientRef = useRef(0);
    const debounceFetcher = useMemo(() => {
        const loadOptions = (value: string) => {
            if (!value) {
                setPatientOptions([]);
                return;
            }
            fetchPatientRef.current += 1;
            const fetchId = fetchPatientRef.current;
            setFetchingPatients(true);

            patientService.searchPatients(value).then((patients) => {
                if (fetchId !== fetchPatientRef.current) return;
                const options = Array.isArray(patients) ? patients.map(p => ({
                    label: `${p.full_name} (${p.patient_code})`,
                    value: p.id,
                })) : [];
                setPatientOptions(options);
                setFetchingPatients(false);
            });
        };
        return debounce(loadOptions, 800);
    }, []);

    const onPatientSearch = (value: string) => {
        setSearchQuery(value);
        debounceFetcher(value);
    };

    const handleAddPatientSubmit = async (values: any) => {
        try {
            const res = await patientService.createPatient(values);
            if (res.success) {
                message.success('Patient added successfully');
                const newPatient = res.data;
                const newOption = {
                    label: `${newPatient.full_name} (${newPatient.patient_code})`,
                    value: newPatient.id,
                };
                setPatientOptions(prev => [newOption, ...prev]);
                form.setFieldsValue({ patient_id: newPatient.id });
                setPatientModalVisible(false);
                patientForm.resetFields();
            }
        } catch (error) {
            message.error('Failed to add patient');
        }
    };

    // Auto-calculate total amount when tests change
    const handleTestsChange = (testIds: number[]) => {
        const total = testIds.reduce((sum, id) => {
            const test = testOptions.find(t => t.value === id);
            return sum + (test?.price || 0);
        }, 0);
        form.setFieldsValue({ total_amount: total });
    };

    useEffect(() => {
        if (editingOrder && editingOrder.patient) {
            setPatientOptions([{
                label: `${editingOrder.patient.full_name} (${editingOrder.patient?.patient_code})`,
                value: editingOrder.patient_id
            }]);

            if (editingOrder.test_results) {
                const initialTestIds = editingOrder.test_results.map(tr => tr.test_id);
                form.setFieldsValue({ test_ids: initialTestIds });
            }
        }
    }, [editingOrder, form]);

    return (
        <SharedModal
            title={editingOrder ? 'Edit Lab Order' : 'Create New Lab Order'}
            open={visible}
            onOk={() => form.submit()}
            onCancel={onCancel}
            width={800}
            okText={editingOrder ? 'Update Order' : 'Create Order'}
            confirmLoading={submitting}
        >
            <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{
                priority: 'normal',
                payment_status: 'unpaid',
                order_source: 'walk_in',
                order_type: 'lab_visit'
            }}>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="patient_id"
                            label="Select Patient"
                            rules={[{ required: true, message: 'Please select a patient' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Search by name or code"
                                notFoundContent={
                                    fetchingPatients ? (
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
                                                    patientForm.setFieldsValue({ full_name: searchQuery });
                                                    setPatientModalVisible(true);
                                                }}
                                            >
                                                Add New Patient
                                            </Button>
                                        </div>
                                    ) : null
                                }
                                filterOption={false}
                                onSearch={onPatientSearch}
                                options={patientOptions}
                                disabled={!!editingOrder}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="test_ids"
                    label="Select Lab Tests"
                    rules={[{ required: true, message: 'At least one test is required' }]}
                >
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Choose tests to include in this order"
                        options={testOptions}
                        loading={fetchingTests}
                        onChange={handleTestsChange}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>

                <Divider style={{ fontSize: '14px', color: '#888' }}>Order Details</Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="priority" label="Priority">
                            <Select options={[...PRIORITIES]} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="payment_status" label="Payment Status">
                            <Select options={[...PAYMENT_STATUSES]} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="total_amount" label="Total Amount (₹)">
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value!.replace(/\₹\s?|(,*)/g, '')}
                                precision={2}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="paid_amount" label="Paid Amount (₹)">
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value!.replace(/\₹\s?|(,*)/g, '')}
                                precision={2}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider style={{ margin: '12px 0' }}>Schedule Details</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="scheduled_date" label="Scheduled Collection Date">
                            <DatePicker style={{ width: '100%' }} placeholder="Select date" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="scheduled_time" label="Scheduled Collection Slot">
                            <Select placeholder="Select time slot" options={[
                                { label: '07:00 AM - 08:00 AM', value: '07:00 AM - 08:00 AM' },
                                { label: '08:00 AM - 09:00 AM', value: '08:00 AM - 09:00 AM' },
                                { label: '09:00 AM - 10:00 AM', value: '09:00 AM - 10:00 AM' },
                                { label: '10:00 AM - 11:00 AM', value: '10:00 AM - 11:00 AM' },
                                { label: '11:00 AM - 12:00 PM', value: '11:00 AM - 12:00 PM' },
                                { label: '12:00 PM - 01:00 PM', value: '12:00 PM - 01:00 PM' },
                                { label: '01:00 PM - 02:00 PM', value: '01:00 PM - 02:00 PM' },
                                { label: '02:00 PM - 03:00 PM', value: '02:00 PM - 03:00 PM' },
                                { label: '03:00 PM - 04:00 PM', value: '03:00 PM - 04:00 PM' },
                                { label: '04:00 PM - 05:00 PM', value: '04:00 PM - 05:00 PM' },
                                { label: '05:00 PM - 06:00 PM', value: '05:00 PM - 06:00 PM' },
                                { label: '06:00 PM - 07:00 PM', value: '06:00 PM - 07:00 PM' },
                                { label: '07:00 PM - 08:00 PM', value: '07:00 PM - 08:00 PM' },
                            ]} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="order_source" label="Order Source">
                            <Select options={[
                                { label: 'Walk-in', value: 'walk_in' },
                                { label: 'Website', value: 'website' },
                                { label: 'Mobile App', value: 'mobile_app' },
                                { label: 'Doctor Referral', value: 'doctor_referral' },
                            ]} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="order_type" label="Order Type">
                            <Select options={[
                                { label: 'Lab Visit', value: 'lab_visit' },
                                { label: 'Home Collection', value: 'home_collection' },
                            ]} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="address" label="Pickup / Collection Address">
                    <Input placeholder="Enter address for home collection" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="email" label="Contact Email (for Reports)">
                            <Input placeholder="Direct report email" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="alternate_phone" label="Alternate Phone">
                            <Input placeholder="Secondary contact number" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="notes" label="Special Instructions / Notes">
                    <TextArea rows={3} placeholder="Add any specific instructions for the lab technician..." />
                </Form.Item>
            </Form>

            <PatientFormModal
                visible={patientModalVisible}
                editingPatient={null}
                form={patientForm}
                onSubmit={handleAddPatientSubmit}
                onCancel={() => {
                    setPatientModalVisible(false);
                    patientForm.resetFields();
                }}
            />
        </SharedModal>
    );
};

export default LabOrderFormModal;
