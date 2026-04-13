import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Space, Button, Upload, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import type { RoutineCheckup } from '../types/routineCheckup.types';

interface RoutineCheckupFormModalProps {
    visible: boolean;
    editingPackage: RoutineCheckup | null;
    categories: any[];
    form: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

const { Option } = Select;
const { TextArea } = Input;

const RoutineCheckupFormModal: React.FC<RoutineCheckupFormModalProps> = ({
    visible,
    editingPackage,
    categories,
    form,
    onSubmit,
    onCancel,
    loading = false
}) => {
    const imageUrl = Form.useWatch('image_url', form);

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

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileUpload = async (file: File) => {
        try {
            const base64 = await fileToBase64(file);
            form.setFieldsValue({ image_url: base64 });
            return false;
        } catch (error) {
            message.error('Failed to process image');
            return Upload.LIST_IGNORE;
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        form.setFieldsValue({ image_url: null });
    };

    return (
        <Modal
            title={editingPackage ? 'Edit Routine Package' : 'Add New Routine Package'}
            open={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={650}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                initialValues={{ status: 'active' }}
            >
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '130px' }}>
                        <Form.Item 
                            name="image_url" 
                            label="Package Image (Optional)" 
                            style={{ margin: 0 }}
                        >
                            <Upload
                                maxCount={1}
                                beforeUpload={handleFileUpload}
                                accept="image/*"
                                showUploadList={false}
                                listType="picture-card"
                                className="routine-image-upload"
                            >
                                {imageUrl ? (
                                    <img src={imageUrl} alt="package" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                                ) : (
                                    <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                                )}
                            </Upload>
                        </Form.Item>
                        {imageUrl && (
                            <Button 
                                type="text" 
                                danger 
                                size="small" 
                                onClick={handleRemoveImage}
                                style={{ fontSize: '12px' }}
                            >
                                Remove Photo
                            </Button>
                        )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <Form.Item
                            name="title"
                            label="Package Title"
                            rules={[{ required: true, message: 'Please enter title' }]}
                        >
                            <Input placeholder="e.g. Men's Health" />
                        </Form.Item>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item
                                name="gender"
                                label="Theme/Gender"
                                style={{ flex: 1 }}
                                rules={[{ required: true, message: 'Select theme' }]}
                            >
                                <Select placeholder="Select theme">
                                    <Option value="male">Male (Blue Style)</Option>
                                    <Option value="female">Female (Pink Style)</Option>
                                    <Option value="general">General (Green Style)</Option>
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
                    </div>
                </div>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <TextArea rows={3} placeholder="Describe the health package benefits" />
                </Form.Item>

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
            <style>{`
                .routine-image-upload.ant-upload-wrapper.ant-upload-picture-card-wrapper .ant-upload.ant-upload-select {
                    width: 130px;
                    height: 130px;
                }
            `}</style>
        </Modal>
    );
};

export default RoutineCheckupFormModal;
