import React, { useState, useRef, useEffect } from 'react';
import {
    Modal,
    Steps,
    Button,
    Typography,
    Space,
    Upload,
    message,
    Image,
    Alert,
    Radio,
    InputNumber,
    Divider,
    Card,
} from 'antd';
import {
    CameraOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    UploadOutlined,
    SafetyCertificateOutlined,
    WalletOutlined,
    MobileOutlined,
} from '@ant-design/icons';
import type { AgentOrder } from '../services/agentOrderService';

const { Text } = Typography;

interface CollectionProofModalProps {
    visible: boolean;
    order: AgentOrder | null;
    onClose: () => void;
    onSubmit: (orderId: number, proofData: {
        samplePhoto: string;
        paymentMode: 'cash' | 'upi';
        paymentProof?: string;
        amountPaid?: number;
    }) => void;
    submitting?: boolean;
}

const CollectionProofModal: React.FC<CollectionProofModalProps> = ({
    visible,
    order,
    onClose,
    onSubmit,
    submitting = false,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [samplePhoto, setSamplePhoto] = useState<string | null>(null);

    // Payment states
    const [paymentMode, setPaymentMode] = useState<'cash' | 'upi'>('upi');
    const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
    const [amountPaid, setAmountPaid] = useState<number>(0);

    // Camera refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [cameraActive, setCameraActive] = useState(false);

    // Set initial amount from order total
    useEffect(() => {
        if (order) {
            setAmountPaid(Number(order.total_amount) - Number(order.paid_amount));
        }
    }, [order]);

    // Reset state when modal closes
    useEffect(() => {
        if (!visible) {
            setCurrentStep(0);
            setSamplePhoto(null);
            setPaymentScreenshot(null);
            setCameraActive(false);
            stopCamera();
        }
    }, [visible]);

    // --- Camera Methods ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraActive(true);
        } catch (error) {
            message.error('Unable to access camera. Please allow camera permissions.');
            console.error('Camera error:', error);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    };

    const capturePhoto = (isSample: boolean) => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            if (isSample) {
                setSamplePhoto(dataUrl);
            } else {
                setPaymentScreenshot(dataUrl);
            }
            stopCamera();
        }
    };

    const handleFileUpload = (file: File, isSample: boolean) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (isSample) {
                setSamplePhoto(result);
            } else {
                setPaymentScreenshot(result);
            }
        };
        reader.readAsDataURL(file);
        return false; // prevent antd auto upload
    };

    // --- Navigation ---
    const handleNext = () => {
        if (currentStep === 0 && !samplePhoto) {
            message.warning('Please capture or upload a sample photo first');
            return;
        }
        setCurrentStep(1);
    };

    const handleBack = () => {
        setCurrentStep(0);
    };

    const handleFinalSubmit = () => {
        if (!samplePhoto) {
            message.warning('Sample photo is required');
            setCurrentStep(0);
            return;
        }

        if (paymentMode === 'upi' && !paymentScreenshot) {
            message.warning('UPI payment screenshot is required');
            return;
        }

        if (paymentMode === 'cash' && (!amountPaid || amountPaid <= 0)) {
            message.warning('Please enter the manual paid amount');
            return;
        }

        if (order) {
            onSubmit(order.id, {
                samplePhoto,
                paymentMode,
                paymentProof: paymentScreenshot || undefined,
                amountPaid: amountPaid,
            });
        }
    };

    if (!order) return null;

    return (
        <Modal
            title={
                <Space align="center">
                    <SafetyCertificateOutlined style={{ color: '#722ed1', fontSize: '20px' }} />
                    <span style={{ fontWeight: 700, fontSize: '16px' }}>Collection & Payment</span>
                    <span style={{ color: '#8c8c8c', fontWeight: 400, fontSize: '13px' }}>
                        — {order.order_code}
                    </span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width={520}
            footer={null}
            destroyOnClose
            centered={false}
            style={{ top: 20 }}
            styles={{
                body: { padding: '12px 24px' },
                mask: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.45)' },
            }}
        >
            {/* Steps Progress */}
            <Steps
                current={currentStep}
                size="small"
                style={{ marginBottom: '16px' }}
                items={[
                    {
                        title: 'Sample Photo',
                        icon: <CameraOutlined />,
                        description: samplePhoto ? 'Captured ✓' : 'Required',
                    },
                    {
                        title: 'Payment Info',
                        icon: <WalletOutlined />,
                        description: 'UPI/Cash',
                    },
                ]}
            />

            {/* Step 1: Sample Photo */}
            {currentStep === 0 && (
                <div>
                    <Alert
                        message="Take a clear photo of the collected sample tubes/containers."
                        type="info"
                        showIcon
                        style={{ marginBottom: '16px', borderRadius: '8px' }}
                    />

                    {!samplePhoto && !cameraActive && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '32px 16px',
                            background: '#fafafa',
                            borderRadius: '12px',
                            border: '2px dashed #d9d9d9',
                        }}>
                            <CameraOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
                            <Text type="secondary">Choose how to add sample photo</Text>
                            <Space size="middle">
                                <Button
                                    type="primary"
                                    icon={<CameraOutlined />}
                                    size="large"
                                    onClick={startCamera}
                                    style={{
                                        background: 'linear-gradient(135deg, #722ed1, #531dab)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        height: '44px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Open Camera
                                </Button>
                                <Upload
                                    showUploadList={false}
                                    beforeUpload={(file) => handleFileUpload(file, true)}
                                    accept="image/*"
                                >
                                    <Button
                                        icon={<UploadOutlined />}
                                        size="large"
                                        style={{ borderRadius: '10px', height: '44px', fontWeight: 600 }}
                                    >
                                        Upload Photo
                                    </Button>
                                </Upload>
                            </Space>
                        </div>
                    )}

                    {cameraActive && !samplePhoto && (
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                <Button shape="circle" danger onClick={stopCamera} style={{ width: '44px', height: '44px' }}>✕</Button>
                                <Button type="primary" shape="circle" onClick={() => capturePhoto(true)} style={{ width: '60px', height: '60px', background: '#fff', border: '4px solid #722ed1' }}>
                                    <CameraOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                                </Button>
                            </div>
                        </div>
                    )}

                    {samplePhoto && (
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#f0f0f0' }}>
                            <Image src={samplePhoto} alt="Sample photo" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} preview={false} />
                            <Button shape="circle" danger icon={<DeleteOutlined />} onClick={() => { setSamplePhoto(null); setCameraActive(false); }} style={{ position: 'absolute', top: '8px', right: '8px' }} />
                        </div>
                    )}

                    <Button type="primary" block size="large" onClick={handleNext} disabled={!samplePhoto} style={{ marginTop: '20px', borderRadius: '10px', height: '48px', fontWeight: 600, background: samplePhoto ? 'linear-gradient(135deg, #722ed1, #531dab)' : undefined, border: 'none' }}>
                        Next — Payment Confirmation →
                    </Button>
                </div>
            )}

            {/* Step 2: Payment Confirmation */}
            {currentStep === 1 && (
                <div>
                    <Card size="small" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Total Amount To Pay:</Text>
                            <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>₹{Number(order.total_amount) - Number(order.paid_amount)}</Text>
                        </div>
                    </Card>

                    <Text strong style={{ display: 'block', marginBottom: '12px' }}>Select Payment Mode:</Text>
                    <Radio.Group
                        value={paymentMode}
                        onChange={e => setPaymentMode(e.target.value)}
                        style={{ width: '100%', marginBottom: '20px' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Radio.Button value="upi" style={{ width: '100%', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
                                <MobileOutlined /> UPI / Online Payment SS
                            </Radio.Button>
                            <Radio.Button value="cash" style={{ width: '100%', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
                                <WalletOutlined /> Cash Collection
                            </Radio.Button>
                        </Space>
                    </Radio.Group>

                    {paymentMode === 'upi' && (
                        <div>
                            {!paymentScreenshot && !cameraActive && (
                                <div style={{ textAlign: 'center', padding: '24px', background: '#f9f9f9', borderRadius: '10px', border: '1px dashed #d9d9d9' }}>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>Upload Payment Screenshot</Text>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Button icon={<CameraOutlined />} onClick={startCamera}>Capture SS with Camera</Button>
                                        <Text type="secondary">or</Text>
                                        <Upload showUploadList={false} beforeUpload={file => handleFileUpload(file, false)} accept="image/*">
                                            <Button icon={<UploadOutlined />}>Upload from Gallery</Button>
                                        </Upload>
                                    </Space>
                                </div>
                            )}

                            {cameraActive && !paymentScreenshot && (
                                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block', maxHeight: '200px', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <Button danger size="small" onClick={stopCamera}>Cancel</Button>
                                        <Button type="primary" size="small" onClick={() => capturePhoto(false)}>Capture</Button>
                                    </div>
                                </div>
                            )}

                            {paymentScreenshot && (
                                <div style={{ position: 'relative', textAlign: 'center' }}>
                                    <Image src={paymentScreenshot} style={{ maxHeight: '200px', borderRadius: '8px' }} />
                                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setPaymentScreenshot(null)} style={{ position: 'absolute', top: 5, right: 5 }} />
                                </div>
                            )}

                            <div style={{ marginTop: '16px' }}>
                                <Text type="secondary">Confirm Paid Amount:</Text>
                                <InputNumber
                                    min={0}
                                    prefix="₹"
                                    style={{ width: '100%', marginTop: '4px' }}
                                    value={amountPaid}
                                    onChange={val => setAmountPaid(val || 0)}
                                />
                            </div>
                        </div>
                    )}

                    {paymentMode === 'cash' && (
                        <div>
                            <Alert message="Collecting cash from patient? Please enter the amount below." type="warning" showIcon style={{ marginBottom: '16px' }} />
                            <Text strong>Enter Collected Cash Amount:</Text>
                            <InputNumber
                                min={0}
                                size="large"
                                prefix="₹"
                                style={{ width: '100%', marginTop: '8px' }}
                                value={amountPaid}
                                onChange={val => setAmountPaid(val || 0)}
                            />
                            <Divider />
                        </div>
                    )}

                    <Space style={{ width: '100%', marginTop: '24px' }} size="middle">
                        <Button size="large" onClick={handleBack} style={{ borderRadius: '10px', height: '48px', flex: 1 }}>← Back</Button>
                        <Button
                            type="primary"
                            size="large"
                            block
                            loading={submitting}
                            onClick={handleFinalSubmit}
                            style={{ borderRadius: '10px', height: '48px', flex: 2, background: 'linear-gradient(135deg, #52c41a, #389e0d)', border: 'none', fontWeight: 700 }}
                        >
                            <CheckCircleOutlined /> Confirm & Submit
                        </Button>
                    </Space>
                </div>
            )}
        </Modal>
    );
};

export default CollectionProofModal;
