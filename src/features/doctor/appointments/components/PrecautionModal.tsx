import React, { useState, useEffect } from 'react';
import { Modal, Input, Typography, message, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { appointmentService } from '../services/appointmentService';

const { Text } = Typography;

interface PrecautionModalProps {
    open: boolean;
    appointment: any | null;
    onClose: () => void;
    onSuccess: (appointmentId: number, precaution: string) => void;
}

const PrecautionModal: React.FC<PrecautionModalProps> = ({ open, appointment, onClose, onSuccess }) => {
    const [existingText, setExistingText] = useState('');
    const [newText, setNewText] = useState('');
    const [loading, setLoading] = useState(false);
    const [fileBase64, setFileBase64] = useState<string | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        if (open && appointment) {
            setExistingText(appointment.precaution || '');
            setNewText('');
            setFileBase64(null);
            setFileList([]);
        } else {
            setExistingText('');
            setNewText('');
            setFileBase64(null);
            setFileList([]);
        }
    }, [open, appointment]);

    const handleFileChange = async (info: any) => {
        let newList = [...info.fileList];
        newList = newList.slice(-1);
        setFileList(newList);

        if (newList.length > 0 && newList[0].originFileObj) {
            const file = newList[0].originFileObj;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setFileBase64(reader.result as string);
            reader.onerror = () => message.error('Failed to read file');
        } else {
            setFileBase64(null);
        }
    };

    const handleSave = async () => {
        if (!appointment) return;
        setLoading(true);
        try {
            let finalPrecaution = existingText;
            if (newText.trim()) {
                const timestamp = new Date().toLocaleString();
                const newEntry = `[${timestamp}]\n${newText.trim()}`;
                finalPrecaution = existingText ? `${existingText}\n\n${newEntry}` : newEntry;
            }

            // If nothing changed, just close
            if (!newText.trim() && !fileBase64) {
                onClose();
                setLoading(false);
                return;
            }

            const data = await appointmentService.savePrecaution(appointment.id, finalPrecaution, fileBase64 || undefined);
            if (data?.success) {
                message.success('Precaution updated successfully');
                onSuccess(appointment.id, finalPrecaution);
                onClose();
            }
        } catch (error) {
            message.error('Failed to save precaution');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Add Precaution & Notes"
            open={open}
            onOk={handleSave}
            onCancel={onClose}
            okText="Save Precaution"
            confirmLoading={loading}
            destroyOnClose
            centered
        >
            <div style={{ paddingTop: 8 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Review the patient's reports and provide any necessary precautions, advice, or medication instructions.
                </Text>

                {existingText && (
                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>Previous Precautions & Notes</Text>
                        <div style={{ 
                            padding: '12px', 
                            backgroundColor: '#f8fafc', 
                            borderRadius: '8px',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '180px',
                            overflowY: 'auto',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            lineHeight: 1.6
                        }}>
                            {existingText}
                        </div>
                    </div>
                )}

                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {existingText ? 'Add New Precaution / Note' : 'Write Precaution / Note'}
                </Text>
                <Input.TextArea
                    rows={4}
                    placeholder="Write your new clinical precautions here..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    style={{ resize: 'none' }}
                />

                <div style={{ marginTop: 24 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Attach Document (Optional)</Text>
                    <Upload
                        beforeUpload={() => false}
                        onChange={handleFileChange}
                        fileList={fileList}
                        maxCount={1}
                        accept="image/*,.pdf"
                    >
                        <Button icon={<UploadOutlined />}>Upload Report/Note File</Button>
                    </Upload>
                </div>
            </div>
        </Modal>
    );
};

export default PrecautionModal;
