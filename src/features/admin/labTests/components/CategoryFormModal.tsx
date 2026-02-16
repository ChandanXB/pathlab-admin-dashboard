import React from 'react';
import { Form, Input } from 'antd';
import SharedModal from '@/shared/components/SharedModal';

const { TextArea } = Input;

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
            </Form>
        </SharedModal>
    );
};

export default CategoryFormModal;
