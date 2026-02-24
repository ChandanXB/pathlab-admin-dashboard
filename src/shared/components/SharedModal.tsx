import React from 'react';
import { Modal } from 'antd';
import { X } from 'lucide-react';
import '../../styles/modal-overrides.css';

interface SharedModalProps {
    title: string;
    open: boolean;
    onOk?: () => void;
    onCancel: () => void;
    children: React.ReactNode;
    width?: number | string;
    okText?: string;
    cancelText?: string;
    footer?: React.ReactNode;
    maskClosable?: boolean;
    style?: React.CSSProperties;
    confirmLoading?: boolean;
}

const SharedModal: React.FC<SharedModalProps> = ({
    title,
    open,
    onOk,
    onCancel,
    children,
    width = 600,
    okText = 'Submit',
    cancelText = 'Cancel',
    footer,
    maskClosable = true,
    style = { top: 20 },
    confirmLoading = false,
}) => {
    return (
        <Modal
            title={<span style={{ fontWeight: 600, fontSize: '1.2rem' }}>{title}</span>}
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            width={width}
            okText={okText}
            cancelText={cancelText}
            footer={footer}
            maskClosable={maskClosable}
            style={style}
            closeIcon={<X size={20} />}
            confirmLoading={confirmLoading}
            styles={{
                mask: {
                    backdropFilter: 'blur(4px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                },
                body: {
                    borderRadius: '16px',
                    padding: '12px 0',
                },
                header: {
                    marginBottom: '24px',
                },
                footer: {
                    marginTop: '24px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                }
            }}
            destroyOnClose
        >
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
                {children}
            </div>
        </Modal>
    );
};

export default SharedModal;
