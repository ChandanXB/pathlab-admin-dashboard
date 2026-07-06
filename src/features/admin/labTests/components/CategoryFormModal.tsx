import React, { useEffect } from 'react';
import { Form, Input, Select, Button } from 'antd';
import SharedModal from '@/shared/components/SharedModal';
import { ACCOUNT_STATUSES } from '@/shared/constants/app.constants';

const { TextArea } = Input;
const { Option } = Select;

interface CategoryFormModalProps {
    visible: boolean;
    editingCategory: any;
    form: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    visible,
    editingCategory,
    form,
    onSubmit,
    onCancel,
    loading,
}) => {
    const bannerText = Form.useWatch('banner_text', form);
    const bannerColor = Form.useWatch('banner_color', form);

    const bannerPreviewText = bannerText ? (bannerText + '   •   ') : '';

    useEffect(() => {
        if (visible) {
            if (editingCategory) {
                form.setFieldsValue(editingCategory);
            } else {
                form.resetFields();
                form.setFieldsValue({ status: 'active', banner_color: '#fff0f3' });
            }
        }
    }, [visible, editingCategory, form]);

    return (
        <SharedModal
            title={editingCategory ? 'Edit Category' : 'Add New Category'}
            open={visible}
            onOk={() => form.submit()}
            onCancel={onCancel}
            okText={editingCategory ? 'Update' : 'Create'}
            confirmLoading={loading}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
            >
                <Form.Item
                    name="category_name"
                    label="Category Name"
                    rules={[{ required: true, message: 'Please enter category name' }]}
                >
                    <Input placeholder="e.g., Blood Tests" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <TextArea rows={3} placeholder="Category description..." />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <Form.Item
                        name="banner_text"
                        label="Scrolling Banner Text (Optional)"
                        style={{ flex: 3, marginBottom: 0 }}
                        extra="Enter text to show a marquee banner at the bottom of the category card. Use '   •   ' to separate multiple announcements."
                    >
                        <Input placeholder="e.g. 🔴 1,200+ Typhoid cases   •   20,186 Chikungunya" />
                    </Form.Item>
                    
                    <Form.Item
                        name="banner_color"
                        label="Banner Color"
                        style={{ flex: 1.5, marginBottom: 0 }}
                    >
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Input 
                                type="color" 
                                style={{ height: '32px', width: '50px', padding: '2px', cursor: 'pointer', flexShrink: 0 }} 
                            />
                            <Button 
                                type="text"
                                size="small"
                                onClick={() => form.setFieldsValue({ banner_color: '#fff0f3' })}
                                style={{ fontSize: '11px', color: '#1890ff', padding: 0 }}
                            >
                                Reset
                            </Button>
                        </div>
                    </Form.Item>
                </div>

                {bannerPreviewText && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>Live Banner Preview:</div>
                        <div style={{
                            position: 'relative',
                            height: '30px',
                            backgroundColor: bannerColor || '#fff0f3',
                            border: '1px solid rgba(0,0,0,0.06)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <div className="admin-marquee-preview" style={{
                                whiteSpace: 'nowrap',
                                position: 'absolute',
                                animation: 'adminCategoryMarquee 8s linear infinite',
                                paddingLeft: '100%',
                                fontWeight: 'bold',
                                fontSize: '11px',
                                color: '#1f1f1f'
                            }}>
                                {bannerPreviewText}
                            </div>
                        </div>
                    </div>
                )}

                <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                >
                    <Select placeholder="Select status">
                        {ACCOUNT_STATUSES.map((option) => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
            <style>{`
                @keyframes adminCategoryMarquee {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-100%, 0, 0); }
                }
            `}</style>
        </SharedModal>
    );
};

export default CategoryFormModal;
