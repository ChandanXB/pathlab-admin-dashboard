import React from 'react';
import { Modal } from 'antd';
import { X } from 'lucide-react';

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
    maskClosable = true
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
            centered
            closeIcon={<X size={20} />}
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

            <style>
                {`
                /* Hide body scrollbar when modal is open to fix double scroll */
                .ant-scrolling-effect {
                    overflow: hidden !important;
                    touch-action: none;
                }
                
                /* Custom scrollbar for modal content */
                .ant-modal-body div::-webkit-scrollbar {
                    width: 6px;
                }
                .ant-modal-body div::-webkit-scrollbar-track {
                    background: transparent;
                }
                .ant-modal-body div::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    borderRadius: 10px;
                }
                .ant-modal-body div::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                `}
            </style>
        </Modal>
    );
};

export default SharedModal;
