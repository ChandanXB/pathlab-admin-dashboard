import React from 'react';
import { Card, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, InfoCircleFilled } from '@ant-design/icons';
import colors from '@/styles/colors';

export interface SelectionToolbarProps {
    count: number;
    itemName: string;
    itemNamePlural?: string;
    onDeselect: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    editDisabled?: boolean;
    deleteDisabled?: boolean;
    deletePopconfirmTitle?: string;
    extraActions?: React.ReactNode;
    loading?: boolean;
    style?: React.CSSProperties;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
    count,
    itemName,
    itemNamePlural,
    onDeselect,
    onEdit,
    onDelete,
    editDisabled = false,
    deleteDisabled = false,
    deletePopconfirmTitle,
    extraActions,
    loading = false,
    style,
}) => {
    if (count <= 0) return null;

    const getPluralizedName = () => {
        if (itemNamePlural) return itemNamePlural;
        if (itemName.toLowerCase().endsWith('y')) {
            return `${itemName.slice(0, -1)}ies`;
        }
        return `${itemName}s`;
    };

    const displayItemName = count === 1 ? itemName : getPluralizedName();
    const defaultPopconfirmTitle = `Are you sure you want to delete the ${count} selected ${displayItemName}?`;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes selectionToolbarSlideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}} />
            <Card
                size="small"
                styles={{
                    body: {
                        minHeight: '56px',
                        padding: '0 16px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                    }
                }}
                style={{
                    marginBottom: 16,
                    background: colors.selectionToolbar.background,
                    border: `1px solid ${colors.selectionToolbar.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    animation: 'selectionToolbarSlideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                    ...style,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        width: '100%',
                    }}
                >
                    <Space size="middle">
                        <InfoCircleFilled style={{ color: colors.info, fontSize: '16px' }} />
                        <span style={{ fontSize: '14px', color: colors.primary }}>
                            <strong>{count}</strong> {displayItemName} selected
                        </span>
                        <Button
                            type="link"
                            disabled={loading}
                            onClick={onDeselect}
                            style={{ padding: 0, height: 'auto', fontSize: '13px', color: colors.primary }}
                        >
                            Deselect All
                        </Button>
                    </Space>

                    <Space size="small">
                        {extraActions}

                        {onEdit && (
                            <Button
                                type="primary"
                                ghost
                                icon={<EditOutlined />}
                                disabled={editDisabled || loading}
                                onClick={onEdit}
                                style={{ borderRadius: '6px' }}
                            >
                                Edit
                            </Button>
                        )}

                        {onDelete && (
                            <Popconfirm
                                title={deletePopconfirmTitle || defaultPopconfirmTitle}
                                onConfirm={onDelete}
                                disabled={deleteDisabled || loading}
                                okText="Yes, Delete"
                                cancelText="Cancel"
                                okButtonProps={{ danger: true, type: 'primary', loading }}
                            >
                                <Button
                                    type="primary"
                                    danger
                                    icon={<DeleteOutlined />}
                                    disabled={deleteDisabled || loading}
                                    style={{ borderRadius: '6px' }}
                                >
                                    Delete
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                </div>
            </Card>
        </>
    );
};

export default SelectionToolbar;
