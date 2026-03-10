import React, { useEffect } from 'react';
import { Form, Input, Select } from 'antd';
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
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    visible,
    editingCategory,
    form,
    onSubmit,
    onCancel
}) => {
    useEffect(() => {
        if (visible && !editingCategory) {
            form.setFieldsValue({ status: 'active' });
        }
    }, [visible, editingCategory, form]);

    return (
        <SharedModal
            title={editingCategory ? 'Edit Category' : 'Add New Category'}
            open={visible}
            onOk={() => form.submit()}
            onCancel={onCancel}
            okText={editingCategory ? 'Update' : 'Create'}
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
        </SharedModal>
    );
};

export default CategoryFormModal;
