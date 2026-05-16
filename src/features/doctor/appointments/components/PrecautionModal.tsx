import React, { useState, useEffect } from 'react';
import { Modal, Input, Typography, message, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { appointmentService } from '../services/appointmentService';

const { Text } = Typography;

interface PrecautionModalProps {
    open: boolean;
    appointment: any | null;
    onClose: () => void;
    onSuccess: (appointmentId: number, precaution: string, newStatus?: string, fileUrl?: string) => void;
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
        
        // Validation: Ensure at least some text is provided if it's the first time
        if (!existingText && !newText.trim()) {
            message.warning('Please provide clinical notes or advice');
            return;
        }

        setLoading(true);
        try {
            let finalPrecaution = existingText;
            let finalFileUrl = appointment.precaution_file_url;

            if (newText.trim()) {
                const timestamp = new Date().toLocaleString();
                const newEntry = `[${timestamp}]\n${newText.trim()}`;
                finalPrecaution = existingText ? `${existingText}\n\n${newEntry}` : newEntry;
            }

            // If text/file changed, save precaution
            const contentChanged = newText.trim() || fileBase64;
            if (contentChanged) {
                const data = await appointmentService.savePrecaution(appointment.id, finalPrecaution, fileBase64 || undefined);
                if (!data?.success) throw new Error(data?.message || 'Failed to save precaution');
                if (data.data?.precaution_file_url) {
                    finalFileUrl = data.data.precaution_file_url;
                }
            }

            // Always mark as completed if new content was added and it wasn't already completed
            if (contentChanged && appointment.status !== 'completed') {
                const statusData = await appointmentService.updateStatus(appointment.id, 'completed');
                if (statusData?.success) {
                    message.success('Consultation completed successfully');
                    onSuccess(appointment.id, finalPrecaution, 'completed', finalFileUrl);
                } else {
                    throw new Error(statusData?.message || 'Failed to update status');
                }
            } else if (contentChanged) {
                message.success('Consultation notes updated successfully');
                onSuccess(appointment.id, finalPrecaution, appointment.status, finalFileUrl);
            }
            onClose();
        } catch (error: any) {
            // Only show one error message
            console.error('Save error:', error);
            message.error(error.message || 'Failed to save consultation details');
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
            okText="Save & Mark Completed"
            confirmLoading={loading}
            destroyOnClose
            centered
        >
            <div style={{ paddingTop: 8 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Provide clinical advice or upload a prescription. Saving will automatically mark this consultation as Completed.
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
                    placeholder="Write your clinical advice here..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    style={{ resize: 'none' }}
                />

                <div style={{ marginTop: 24 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Attach Prescription / Report (Optional)</Text>
                    <Upload
                        beforeUpload={() => false}
                        onChange={handleFileChange}
                        fileList={fileList}
                        maxCount={1}
                        accept="image/*,.pdf"
                    >
                        <Button icon={<UploadOutlined />}>Upload File</Button>
                    </Upload>
                </div>
            </div>
        </Modal>
    );
};

export default PrecautionModal;
