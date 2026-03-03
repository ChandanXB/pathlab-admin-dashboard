import React, { useState, useEffect, useRef } from 'react';
import {
    Button, Typography, Space, message, Card, Row, Col,
    Form, Input, Select, Tooltip, Tag, Image, Progress
} from 'antd';
import SharedModal from '../../../../shared/components/SharedModal';
import {
    FilePdfOutlined, CloudUploadOutlined,
    EditOutlined, RobotOutlined, PlusOutlined,
    FileImageOutlined, InboxOutlined
} from '@ant-design/icons';
import type { LabOrder } from '../types/labOrder.types';
import { labOrderService } from '../services/labOrderService';

const { Text } = Typography;

interface ReportUploadModalProps {
    visible: boolean;
    order: LabOrder | null;
    onClose: () => void;
    onUpload: (orderId: number, files: string[], results: any) => Promise<any>;
}

const ReportUploadModal: React.FC<ReportUploadModalProps> = ({ visible, order, onClose, onUpload }) => {
    const [fileList, setFileList] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [form] = Form.useForm();
    const [previewContent, setPreviewContent] = useState<string>('');
    const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'none'>('none');
    const [previewMime, setPreviewMime] = useState('');
    const [extracting, setExtracting] = useState(false);
    const [extractionProgress, setExtractionProgress] = useState(0);
    const [activeFileIndex, setActiveFileIndex] = useState<number>(-1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let interval: any;
        if (extracting) {
            setExtractionProgress(5);
            interval = setInterval(() => {
                setExtractionProgress(prev => {
                    if (prev >= 95) return 95;
                    return prev + Math.random() * 15;
                });
            }, 800);
        } else {
            setExtractionProgress(0);
        }
        return () => clearInterval(interval);
    }, [extracting]);

    useEffect(() => {
        if (visible && order) {
            const results: any = {};
            order.test_results?.forEach(tr => {
                results[tr.id] = {
                    value: tr.result_value || '',
                    status: tr.clinical_status || 'normal'
                };
            });
            form.setFieldsValue({ results });
            setFileList([]);
            setPreviewType('none');
            setPreviewContent('');
            setActiveFileIndex(-1);
        }
    }, [visible, order, form]);

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

    const loadPreview = async (file: any, index: number) => {
        const rawFile = file.originFileObj || file;
        const url = await fileToBase64(rawFile);
        setPreviewContent(url);
        setPreviewType(rawFile.type === 'application/pdf' ? 'pdf' : 'image');
        setPreviewMime(rawFile.type);
        setActiveFileIndex(index);
    };

    const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const valid = files.filter(f => f.type === 'application/pdf' || f.type.startsWith('image/'));
        if (valid.length < files.length) message.warning('Some files were skipped (only PDF/Image allowed).');
        if (valid.length === 0) return;

        const newList = [...fileList, ...valid];
        setFileList(newList);
        // Auto-preview the first newly added file
        const newIndex = fileList.length;
        loadPreview(valid[0], newIndex);
        e.target.value = '';
    };

    const handleDropZoneDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(
            f => f.type === 'application/pdf' || f.type.startsWith('image/')
        );
        if (files.length === 0) { message.error('Only PDF or Image files are supported.'); return; }
        const newList = [...fileList, ...files];
        setFileList(newList);
        loadPreview(files[0], fileList.length);
    };

    const removeFile = (index: number) => {
        const newList = fileList.filter((_, i) => i !== index);
        setFileList(newList);
        if (newList.length === 0) {
            setPreviewType('none');
            setPreviewContent('');
            setActiveFileIndex(-1);
        } else {
            const nextIndex = Math.min(index, newList.length - 1);
            loadPreview(newList[nextIndex], nextIndex);
        }
    };

    const handleAIExtraction = async () => {
        if (previewType === 'none' || !previewContent || !order) return;
        setExtracting(true);
        try {
            const testNames = order.test_results?.map(tr => tr.test?.test_name).filter(Boolean) as string[];
            if (testNames.length === 0) { message.warning('No tests found to extract data for.'); return; }

            const response = await labOrderService.extractResults(previewContent, previewMime, testNames);

            if (response.success && response.data) {
                const extractedData = response.data;
                const extractedKeys = Object.keys(extractedData);

                console.log('[AI Extract] Extracted data:', extractedData);

                const fuzzyMatch = (testName: string, aiKey: string): boolean => {
                    const a = testName.toLowerCase();
                    const b = aiKey.toLowerCase();
                    return a === b || a.includes(b) || b.includes(a);
                };

                const fieldUpdates: { name: (string | number)[]; value: any }[] = [];
                order.test_results?.forEach(tr => {
                    const testName = tr.test?.test_name;
                    if (!testName) return;
                    const idKey = tr.id.toString();
                    let matchedAIKey = extractedKeys.find(k => k === testName) || extractedKeys.find(k => fuzzyMatch(testName, k));
                    if (matchedAIKey && extractedData[matchedAIKey]) {
                        const extracted = extractedData[matchedAIKey];
                        fieldUpdates.push({ name: ['results', idKey, 'value'], value: extracted.value ?? '' });
                        fieldUpdates.push({ name: ['results', idKey, 'status'], value: extracted.status || 'normal' });
                    }
                });

                if (fieldUpdates.length > 0) {
                    form.setFields(fieldUpdates);
                    message.success(`Auto-filled ${fieldUpdates.length / 2} field(s) from AI!`);
                } else {
                    message.warning('AI ran but found no matching test fields in this document.');
                }
            }
        } catch (error: any) {
            console.error('AI Extraction Error:', error);
            message.error(`AI Extraction Failed: ${error.message}`);
        } finally {
            setExtracting(false);
        }
    };

    const handleUpload = async () => {
        if (!order) return;
        try {
            const values = await form.validateFields();
            setUploading(true);
            const base64Files = await Promise.all(fileList.map(f => fileToBase64(f.originFileObj || f)));
            await onUpload(order.id, base64Files, values.results);
            message.success('Report and results submitted successfully!');
            onClose();
        } catch (error) {
            console.error('Upload error:', error);
            message.error('Failed to submit report. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const hasFiles = fileList.length > 0;

    const footer = [
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button
            key="upload"
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={handleUpload}
            loading={uploading}
            disabled={fileList.length === 0}
        >
            Submit Results
        </Button>
    ];

    return (
        <SharedModal
            title="Upload Lab Report & Enter Results"
            open={visible}
            onCancel={onClose}
            footer={footer}
            width={1000}
            maskClosable={false}
        >
            <Row gutter={14} style={{ height: '60vh' }}>
                {/* === LEFT: Upload / Preview Panel === */}
                <Col span={16} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        flex: 1, display: 'flex', flexDirection: 'column',
                        background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0', overflow: 'hidden'
                    }}>

                        {/* Header Bar */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 14px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', flexShrink: 0
                        }}>
                            <Space size={6} style={{ flex: 1, flexWrap: 'wrap', overflow: 'auto', maxHeight: 48 }}>
                                {/* File tabs */}
                                {fileList.map((file, index) => {
                                    const f = file.originFileObj || file;
                                    const isPdf = f.type === 'application/pdf';
                                    const isActive = index === activeFileIndex;
                                    return (
                                        <Tag
                                            key={index}
                                            icon={isPdf ? <FilePdfOutlined /> : <FileImageOutlined />}
                                            color={isActive ? 'blue' : 'default'}
                                            style={{ cursor: 'pointer', padding: '2px 8px', fontSize: 12, maxWidth: 140, userSelect: 'none' }}
                                            onClick={() => loadPreview(file, index)}
                                            closable
                                            onClose={(e) => { e.stopPropagation(); removeFile(index); }}
                                        >
                                            <Text ellipsis style={{ maxWidth: 90, fontSize: 11, color: isActive ? '#1890ff' : '#555' }}>
                                                {f.name || `File ${index + 1}`}
                                            </Text>
                                        </Tag>
                                    );
                                })}

                                {/* Add More button */}
                                <Tooltip title="Add more files">
                                    <Button
                                        size="small"
                                        icon={<PlusOutlined />}
                                        type="dashed"
                                        style={{ fontSize: 12, height: 24 }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {hasFiles ? 'Add' : 'Upload File'}
                                    </Button>
                                </Tooltip>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={handleAddFiles}
                                />
                            </Space>

                            {/* AI Extract button — only when a file is previewing */}
                            {/* Removed from header, moved to overlaid button below */}
                        </div>

                        {/* Preview / Drop Zone */}
                        <div
                            style={{
                                flex: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                padding: extracting ? '0 12px 12px 12px' : '12px'
                            }}
                            onDragOver={e => e.preventDefault()}
                            onDrop={handleDropZoneDrop}
                        >
                            {extracting && (
                                <div style={{ padding: '8px 0', width: '100%' }}>
                                    <Progress
                                        percent={Math.round(extractionProgress)}
                                        status="active"
                                        strokeColor={{ '0%': '#108ee9', '100%': '#722ed1' }}
                                        size="small"
                                    />
                                    <Text type="secondary" style={{ fontSize: 10 }}>AI is reading your report, please wait...</Text>
                                </div>
                            )}

                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
                                {previewType === 'image' && (
                                    <Image
                                        alt="preview"
                                        src={previewContent}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 6, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
                                        preview={{
                                            toolbarRender: (_, { transform: { scale }, actions: { onZoomOut, onZoomIn, onRotateLeft, onRotateRight, onReset } }) => (
                                                <Space size={16} style={{ background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: 8 }}>
                                                    <Tooltip title="Zoom Out"><span onClick={onZoomOut} style={{ color: '#fff', cursor: 'pointer', fontSize: 18 }}>−</span></Tooltip>
                                                    <span style={{ color: '#fff', fontSize: 13 }}>{Math.round(scale * 100)}%</span>
                                                    <Tooltip title="Zoom In"><span onClick={onZoomIn} style={{ color: '#fff', cursor: 'pointer', fontSize: 18 }}>+</span></Tooltip>
                                                    <Tooltip title="Rotate Left"><span onClick={onRotateLeft} style={{ color: '#fff', cursor: 'pointer', fontSize: 16 }}>↺</span></Tooltip>
                                                    <Tooltip title="Rotate Right"><span onClick={onRotateRight} style={{ color: '#fff', cursor: 'pointer', fontSize: 16 }}>↻</span></Tooltip>
                                                    <Tooltip title="Reset"><span onClick={onReset} style={{ color: '#aaa', cursor: 'pointer', fontSize: 13 }}>Reset</span></Tooltip>
                                                </Space>
                                            )
                                        }}
                                    />
                                )}
                                {previewType === 'pdf' && (
                                    <iframe
                                        src={previewContent}
                                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 6 }}
                                        title="PDF Preview"
                                    />
                                )}
                                {previewType === 'none' && (
                                    <div
                                        style={{
                                            width: '100%', height: '100%', border: '2px dashed #d9d9d9',
                                            borderRadius: 10, display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                            background: '#fafafa', transition: 'border-color 0.2s'
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#1890ff')}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#d9d9d9')}
                                    >
                                        <InboxOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 12 }} />
                                        <Text strong style={{ fontSize: 14, color: '#595959' }}>Click or Drag &amp; Drop to Upload</Text>
                                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>Supports PDF and Image files</Text>
                                    </div>
                                )}
                            </div>

                            {/* Floating AI Button at Bottom Left */}
                            {previewType !== 'none' && !extracting && (
                                <Tooltip title="AI reads this document and auto-fills the result fields">
                                    <Button
                                        type="primary"
                                        size="middle"
                                        icon={<RobotOutlined />}
                                        onClick={handleAIExtraction}
                                        style={{
                                            position: 'absolute',
                                            bottom: 12,
                                            left: 12,
                                            background: '#722ed1',
                                            borderColor: '#722ed1',
                                            boxShadow: '0 4px 12px rgba(114, 46, 209, 0.4)',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            zIndex: 10,
                                            transition: 'transform 0.2s',
                                        }}
                                        className="ai-extract-button"
                                    >
                                        Extract with AI
                                    </Button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </Col>

                {/* === RIGHT: Results Entry === */}
                <Col span={8} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        flex: 1, background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                        <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', flexShrink: 0 }}>
                            <Space>
                                <EditOutlined style={{ color: '#1890ff' }} />
                                <Text strong style={{ fontSize: 13 }}>Results Entry</Text>
                            </Space>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
                            <Form form={form} layout="vertical" size="small">
                                {order?.test_results?.map((tr) => (
                                    <Card
                                        key={tr.id}
                                        size="small"
                                        style={{ marginBottom: 10, border: '1px solid #f0f0f0', borderRadius: 8 }}
                                        bodyStyle={{ padding: '10px 12px' }}
                                        title={<Text strong style={{ fontSize: 12 }}>{tr.test?.test_name}</Text>}
                                    >
                                        <Form.Item
                                            name={['results', tr.id.toString(), 'value']}
                                            label={<span style={{ fontSize: 11 }}>Value / Measurement</span>}
                                            style={{ marginBottom: 8 }}
                                        >
                                            <Input placeholder="e.g. 12.5 g/dL" />
                                        </Form.Item>
                                        <Form.Item
                                            name={['results', tr.id.toString(), 'status']}
                                            label={<span style={{ fontSize: 11 }}>Severity</span>}
                                            initialValue="normal"
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Select
                                                options={[
                                                    { label: 'Normal', value: 'normal' },
                                                    { label: 'Warning', value: 'warning' },
                                                    { label: 'Danger', value: 'danger' },
                                                ]}
                                            />
                                        </Form.Item>
                                    </Card>
                                ))}
                            </Form>
                        </div>
                    </div>
                </Col>
            </Row>
        </SharedModal>
    );
};

export default ReportUploadModal;
