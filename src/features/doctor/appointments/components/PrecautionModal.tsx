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
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [fileBase64, setFileBase64] = useState<string | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        if (open && appointment) {
            setText(appointment.precaution || '');
            setFileBase64(null);
            setFileList([]);
        } else {
            setText('');
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
            const data = await appointmentService.savePrecaution(appointment.id, text, fileBase64 || undefined);
            if (data?.success) {
                message.success('Precaution saved successfully');
                onSuccess(appointment.id, text);
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
        >
            <div style={{ paddingTop: 8 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Review the patient's reports and provide any necessary precautions, advice, or medication instructions.
                </Text>
                <Input.TextArea
                    rows={6}
                    placeholder="Write your clinical precautions here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
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
