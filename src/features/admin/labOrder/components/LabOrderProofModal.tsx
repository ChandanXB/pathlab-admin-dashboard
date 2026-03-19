import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Row, Col, Upload, message, Divider } from 'antd';
import { CameraOutlined, UploadOutlined } from '@ant-design/icons';
import SharedModal from '@/shared/components/SharedModal';
import { labOrderService } from '../services/labOrderService';

interface LabOrderProofModalProps {
    visible: boolean;
    order: any | null;
    onClose: () => void;
    onSuccess: () => void;
}

const LabOrderProofModal: React.FC<LabOrderProofModalProps> = ({ visible, order, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [sampleFileList, setSampleFileList] = useState<any[]>([]);
    const [paymentFileList, setPaymentFileList] = useState<any[]>([]);

    useEffect(() => {
        if (visible && order) {
            form.setFieldsValue({
                payment_mode: 'cash',
                amount_paid: Math.max(0, order.total_amount - (order.paid_amount || 0))
            });
        } else {
            form.resetFields();
            setSampleFileList([]);
            setPaymentFileList([]);
        }
    }, [visible, order, form]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileUpload = async (file: File, fieldName: string) => {
        try {
            const base64 = await fileToBase64(file);
            form.setFieldsValue({ [fieldName]: base64 });

            const fileItem = {
                uid: '-1',
                name: file.name,
                status: 'done',
                url: base64,
                originFileObj: file
            };

            if (fieldName === 'samplePhoto') {
                setSampleFileList([fileItem]);
            } else {
                setPaymentFileList([fileItem]);
            }

            return false;
        } catch (error) {
            message.error(`Failed to process file`);
            return Upload.LIST_IGNORE;
        }
    };

    const handleRemove = (fieldName: string) => {
        form.setFieldsValue({ [fieldName]: undefined });
        if (fieldName === 'samplePhoto') {
            setSampleFileList([]);
        } else {
            setPaymentFileList([]);
        }
    };

    const handleSubmit = async (values: any) => {
        if (!order) return;
        if (!values.samplePhoto) {
            message.error('Sample photo / Order proof is required.');
            return;
        }

        setSubmitting(true);
        try {
            await labOrderService.uploadCollectionProof(
                order.id,
                values.samplePhoto,
                values.payment_mode,
                values.paymentProof,
                values.amount_paid
            );
            message.success('Collection proofs uploaded successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to upload collection proof');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SharedModal
            title={`Upload Collection Proof (Order: ${order?.order_code})`}
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={submitting}
            okText="Submit Proof"
            width={550}
            centered
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Divider style={{ margin: '8px 0', fontSize: '14px', color: '#888' }}>Capture Sample & Order Slip</Divider>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Form.Item 
                        name="samplePhoto" 
                        rules={[{ required: true, message: 'Sample photo is required' }]}
                        getValueFromEvent={() => {
                            return form.getFieldValue('samplePhoto');
                        }}
                    >
                        <Upload
                            maxCount={1}
                            fileList={sampleFileList}
                            onRemove={() => handleRemove('samplePhoto')}
                            beforeUpload={(file) => handleFileUpload(file, 'samplePhoto')}
                            listType="picture-card"
                            accept="image/*"
                        >
                            {sampleFileList.length === 0 && (
                                <div>
                                    <CameraOutlined style={{ fontSize: 24 }} />
                                    <div style={{ marginTop: 8 }}>Take Photo</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </div>

                <Divider style={{ margin: '8px 0', fontSize: '14px', color: '#888' }}>Payment Collection</Divider>
                
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="payment_mode" label="Payment Mode" rules={[{ required: true }]}>
                            <Select options={[
                                { label: 'Cash', value: 'cash' },
                                { label: 'UPI / QR Code', value: 'upi' },
                                { label: 'Card', value: 'card' },
                                { label: 'Online / App', value: 'online' },
                            ]} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="amount_paid" label="Amount Collected (₹)">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item 
                    name="paymentProof" 
                    label="Payment Screenshot (Optional)"
                    getValueFromEvent={() => {
                        return form.getFieldValue('paymentProof');
                    }}
                >
                    <Upload
                        maxCount={1}
                        fileList={paymentFileList}
                        onRemove={() => handleRemove('paymentProof')}
                        beforeUpload={(file) => handleFileUpload(file, 'paymentProof')}
                        listType="picture-card"
                        accept="image/*"
                    >
                        {paymentFileList.length === 0 && (
                            <div>
                                <UploadOutlined style={{ fontSize: 20 }} />
                                <div style={{ marginTop: 8 }}>Upload Proof</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>
            </Form>
        </SharedModal>
    );
};

export default LabOrderProofModal;
