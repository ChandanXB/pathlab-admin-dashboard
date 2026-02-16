import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Form, Input, Select, Row, Col, Spin, InputNumber, Divider } from 'antd';
import SharedModal from '@/shared/components/SharedModal';
import { ORDER_STATUSES, PRIORITIES, PAYMENT_STATUSES } from '@/shared/constants/labOrder.constants';
import type { LabOrder } from '../types/labOrder.types';
import { patientService } from '@/features/admin/patients/services/patientService';
import { labTestService } from '@/features/admin/labTests/services/labTestService';
import debounce from 'lodash/debounce';

const { TextArea } = Input;

interface LabOrderFormModalProps {
    visible: boolean;
    editingOrder: LabOrder | null;
    form: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

const LabOrderFormModal: React.FC<LabOrderFormModalProps> = ({
    visible,
    editingOrder,
    form,
    onSubmit,
    onCancel,
}) => {
    const [fetchingPatients, setFetchingPatients] = useState(false);
    const [patientOptions, setPatientOptions] = useState<{ label: string; value: number }[]>([]);
    const [testOptions, setTestOptions] = useState<{ label: string; value: number; price: number }[]>([]);
    const [fetchingTests, setFetchingTests] = useState(false);

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
            fetchPatientRef.current += 1;
            const fetchId = fetchPatientRef.current;
            setFetchingPatients(true);

            patientService.searchPatients(value).then((patients) => {
                if (fetchId !== fetchPatientRef.current) return;
                setPatientOptions(patients.map(p => ({
                    label: `${p.full_name} (${p.patient_code})`,
                    value: p.id,
                })));
                setFetchingPatients(false);
            });
        };
        return debounce(loadOptions, 800);
    }, []);

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
        >
            <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{ priority: 'normal', status: 'pending', payment_status: 'unpaid' }}>
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
                                notFoundContent={fetchingPatients ? <Spin size="small" /> : null}
                                filterOption={false}
                                onSearch={debounceFetcher}
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
                    <Col span={8}>
                        <Form.Item name="priority" label="Priority">
                            <Select options={[...PRIORITIES]} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="status" label="Status">
                            <Select options={[...ORDER_STATUSES]} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
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

                <Form.Item name="notes" label="Special Instructions / Notes">
                    <TextArea rows={3} placeholder="Add any specific instructions for the lab technician..." />
                </Form.Item>
            </Form>
        </SharedModal>
    );
};

export default LabOrderFormModal;
