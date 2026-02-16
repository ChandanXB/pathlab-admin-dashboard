import React from 'react';
import { Form, Input, InputNumber, Select, Switch } from 'antd';
import SharedModal from '@/shared/components/SharedModal';

const { TextArea } = Input;
const { Option } = Select;

interface TestFormModalProps {
    visible: boolean;
    editingTest: any;
    categories: any[];
    form: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

const TestFormModal: React.FC<TestFormModalProps> = ({
    visible,
    editingTest,
    categories,
    form,
    onSubmit,
    onCancel
}) => {
    return (
        <SharedModal
            title={editingTest ? 'Edit Lab Test' : 'Add New Lab Test'}
            open={visible}
            onOk={() => form.submit()}
            onCancel={onCancel}
            width={700}
            okText={editingTest ? 'Update' : 'Create'}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
            >
                <Form.Item
                    name="test_code"
                    label="Test Code"
                    rules={[{ required: true, message: 'Please enter test code' }]}
                >
                    <Input placeholder="e.g., CBC-001" />
                </Form.Item>

                <Form.Item
                    name="test_name"
                    label="Test Name"
                    rules={[{ required: true, message: 'Please enter test name' }]}
                >
                    <Input placeholder="e.g., Complete Blood Count" />
                </Form.Item>

                <Form.Item
                    name="category_id"
                    label="Category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                >
                    <Select placeholder="Select category" showSearch>
                        {categories.map((cat: any) => (
                            <Option key={cat.id} value={cat.id}>
                                {cat.category_name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <TextArea rows={3} placeholder="Test description..." />
                </Form.Item>

                <Form.Item
                    name="sample_type"
                    label="Sample Type"
                    rules={[{ required: true, message: 'Please enter sample type' }]}
                >
                    <Input placeholder="e.g., Blood, Urine" />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Price (₹)"
                    rules={[{ required: true, message: 'Please enter price' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        placeholder="0"
                        prefix="₹"
                    />
                </Form.Item>

                <Form.Item
                    name="fasting_required"
                    label="Fasting Required"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Status"
                    initialValue="active"
                >
                    <Select>
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                    </Select>
                </Form.Item>
            </Form>
        </SharedModal>
    );
};

export default TestFormModal;
