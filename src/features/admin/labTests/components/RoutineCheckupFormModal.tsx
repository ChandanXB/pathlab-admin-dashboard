import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Space, Button, Upload, message, InputNumber } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '@/config/apiClient';
import type { RoutineCheckup } from '../types/routineCheckup.types';

interface RoutineCheckupFormModalProps {
    visible: boolean;
    editingPackage: RoutineCheckup | null;
    categories: any[];
    tests: any[];
    packages?: RoutineCheckup[];
    onSearchTests?: (query: string) => void;
    onSearchCategories?: (query: string) => void;
    form: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    loading?: boolean;
}


const { Option } = Select;
const { TextArea } = Input;

const RoutineCheckupFormModal: React.FC<RoutineCheckupFormModalProps> = (props) => {
    const {
        visible,
        editingPackage,
        categories,
        tests,
        packages = [],
        onSearchTests,
        onSearchCategories,
        form,
        onSubmit,
        onCancel,
        loading = false
    } = props;

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const getFullImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('data:') || url.startsWith('http')) return url;
        const baseUrl = API_BASE_URL.replace('/api/v1', '');
        return `${baseUrl}/${url.startsWith('/') ? url.slice(1) : url}`;
    };

    useEffect(() => {
        if (visible) {
            if (editingPackage) {
                form.setFieldsValue({
                    ...editingPackage,
                    parent_id: editingPackage.parent_id,
                    category_ids: editingPackage.categories?.map(c => c.id) || [],
                    test_ids: editingPackage.tests?.map(t => t.id) || [],
                });
                if (editingPackage.image_url) {
                    setPreviewImage(getFullImageUrl(editingPackage.image_url));
                }
            } else {
                form.resetFields();
                form.setFieldsValue({ status: 'active', tags: [], category_ids: [], test_ids: [] });
                setPreviewImage(null);
            }
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
            setPreviewImage(base64);
            form.setFieldsValue({ image_url: base64 });
            return false;
        } catch (error) {
            message.error('Failed to process image');
            return Upload.LIST_IGNORE;
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewImage(null);
        form.setFieldsValue({ image_url: null });
    };

    // Filter packages to show only top-level packages (or any package that is not the current one)
    const parentOptions = packages.filter(p => !p.parent_id);


    return (
        <Modal
            title={editingPackage ? 'Edit Routine Package' : 'Add New Routine Package'}
            open={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={700}
            centered
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
                            label="Package Image" 
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
                                {previewImage ? (
                                    <img src={previewImage} alt="package" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                                ) : (
                                    <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload Icon</div></div>
                                )}
                            </Upload>
                        </Form.Item>
                        {previewImage && (
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
                            name="parent_id"
                            label="Parent Package (Optional)"
                            extra="Select if this is a plan under an existing package (e.g. Silver Plan under Smart Full Body Checkup)"
                        >
                            <Select placeholder="Select main package" allowClear showSearch filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())}>
                                {parentOptions.map(pkg => (
                                    <Option key={pkg.id} value={pkg.id} label={pkg.title}>{pkg.title}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="title"
                            label="Package Title"
                            rules={[{ required: true, message: 'Please enter title' }]}
                        >
                            <Input placeholder="e.g. Smart Full Body Checkup" />
                        </Form.Item>


                        <Form.Item
                            name="sub_title"
                            label="Package Sub-title"
                            extra="This will be displayed prominently on the card (e.g., 'Under 30 yrs')"
                        >
                            <Input placeholder="e.g. Under 30 yrs" />
                        </Form.Item>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item
                                name="mrp"
                                label="MRP (Original Price)"
                                style={{ flex: 1 }}
                            >
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value?.replace(/\₹\s?|(,*)/g, '') as any}
                                    placeholder="8566" 
                                />
                            </Form.Item>

                            <Form.Item
                                name="price"
                                label="Discounted Price"
                                style={{ flex: 1 }}
                            >
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value?.replace(/\₹\s?|(,*)/g, '') as any}
                                    placeholder="1799" 
                                />
                            </Form.Item>
                        </div>

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
                                name="age_group"
                                label="Age Group"
                                style={{ flex: 1 }}
                                initialValue="all"
                            >
                                <Select placeholder="Select age group">
                                    <Option value="all">All Ages</Option>
                                    <Option value="kids">Kids (0-12)</Option>
                                    <Option value="teens">Teens (13-19)</Option>
                                    <Option value="adults">Adults (20-60)</Option>
                                    <Option value="seniors">Seniors (60+)</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="status"
                                label="Status"
                                style={{ flex: 1 }}
                            >
                                <Select>
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                </Select>
                            </Form.Item>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="test_ids"
                        label="Target Test/Package(s)"
                        style={{ flex: 1 }}
                        extra="Link this routine card directly to one or more specific tests or packages."
                    >
                        <Select 
                            mode="multiple"
                            showSearch 
                            placeholder="Select specific tests" 
                            allowClear
                            filterOption={false}
                            onSearch={onSearchTests}
                        >
                            {tests.map(test => (
                                <Option key={test.id} value={test.id}>
                                    [{test.category?.category_name || 'Uncategorized'}] {test.test_name} ({test.test_code})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="category_ids"
                        label="Target Category/Categories"
                        style={{ flex: 1 }}
                        extra="Alternatively, link to entire categories."
                    >
                        <Select 
                            mode="multiple"
                            showSearch 
                            placeholder="Select categories" 
                            allowClear
                            filterOption={false}
                            onSearch={onSearchCategories}
                        >
                            {categories.map(cat => (
                                <Option key={cat.id} value={cat.id}>{cat.category_name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
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
