import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Space, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { RoutineCheckup } from '../types/routineCheckup.types';

interface RoutineCheckupFormModalProps {
    visible: boolean;
    editingPackage: RoutineCheckup | null;
    categories: any[];
    form: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

const { Option } = Select;
const { TextArea } = Input;

const RoutineCheckupFormModal: React.FC<RoutineCheckupFormModalProps> = ({
    visible,
    editingPackage,
    categories,
    form,
    onSubmit,
    onCancel
}) => {
    useEffect(() => {
        if (visible && editingPackage) {
            form.setFieldsValue({
                ...editingPackage,
                category_id: editingPackage.category_id,
            });
        } else if (visible) {
            form.resetFields();
            form.setFieldsValue({ status: 'active', tags: [] });
        }
    }, [visible, editingPackage, form]);

    return (
        <Modal
            title={editingPackage ? 'Edit Routine Package' : 'Add New Routine Package'}
            open={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                initialValues={{ status: 'active' }}
            >
                <Form.Item
                    name="title"
                    label="Package Title"
                    rules={[{ required: true, message: 'Please enter title' }]}
                >
                    <Input placeholder="e.g. Men's Health" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <TextArea rows={3} placeholder="Describe the health package benefits" />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="gender"
                        label="Gender Focus"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Select gender' }]}
                    >
                        <Select placeholder="Select gender">
                            <Option value="male">Male (Blue Style)</Option>
                            <Option value="female">Female (Pink Style)</Option>
                            <Option value="general">General</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="category_id"
                        label="Target Category"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Select category' }]}
                    >
                        <Select showSearch placeholder="Select a category" filterOption={(input, option) =>
                            (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                        }>
                            {categories.map(cat => (
                                <Option key={cat.id} value={cat.id}>{cat.category_name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item label="Highlight Tags (Max 3 Recommended)">
                    <Form.List name="tags">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name]}
                                            rules={[{ required: true, message: 'Tag cannot be empty' }]}
                                        >
                                            <Input placeholder="e.g. Cardiac" style={{ width: 400 }} />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Add Tag
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form.Item>

                <Form.Item name="status" label="Status" valuePropName="checked" getValueFromEvent={(e) => e ? 'active' : 'inactive'} getValueProps={(value) => ({ checked: value === 'active' })}>
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RoutineCheckupFormModal;
