import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Input, Tag, message, Empty, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import SharedModal from '@/shared/components/SharedModal';
import { labTestService } from '@/features/admin/labTests/services/labTestService';

const CategoryBannersTab: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [submittingCategory, setSubmittingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [categoryForm] = Form.useForm();

    const bannerText = Form.useWatch('banner_text', categoryForm);
    const bannerColor = Form.useWatch('banner_color', categoryForm);
    const bannerPreviewText = bannerText ? (bannerText + '   •   ') : '';

    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const response = await labTestService.getCategories({ limit: 1000 });
            setCategories(response.data);
        } catch (error: any) {
            message.error('Failed to fetch categories: ' + error.message);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleEditCategoryBanner = (record: any) => {
        setEditingCategory(record);
        categoryForm.setFieldsValue({
            banner_text: record.banner_text || '',
            banner_color: record.banner_color || '#fff0f3',
        });
        setCategoryModalVisible(true);
    };

    const handleRemoveCategoryBanner = async (record: any) => {
        try {
            await labTestService.updateCategory(record.id, {
                category_name: record.category_name,
                description: record.description,
                status: record.status,
                banner_text: null,
                banner_color: null,
            });
            message.success(`Banner removed from "${record.category_name}"`);
            fetchCategories();
        } catch (error: any) {
            message.error('Failed to remove banner: ' + error.message);
        }
    };

    const handleCategoryBannerSubmit = async (values: any) => {
        if (!editingCategory) return;
        setSubmittingCategory(true);
        try {
            await labTestService.updateCategory(editingCategory.id, {
                category_name: editingCategory.category_name,
                description: editingCategory.description,
                status: editingCategory.status,
                banner_text: values.banner_text || null,
                banner_color: values.banner_color || '#fff0f3',
            });
            message.success(`Banner updated for "${editingCategory.category_name}"`);
            setCategoryModalVisible(false);
            categoryForm.resetFields();
            setEditingCategory(null);
            fetchCategories();
        } catch (error: any) {
            message.error('Failed to update banner: ' + error.message);
        } finally {
            setSubmittingCategory(false);
        }
    };

    const handleCancelCategoryModal = () => {
        setCategoryModalVisible(false);
        categoryForm.resetFields();
        setEditingCategory(null);
    };

    const categoryColumns = [
        {
            title: 'S.No',
            key: 'serial',
            width: 70,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Category',
            dataIndex: 'category_name',
            key: 'category_name',
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: 'Banner Text',
            dataIndex: 'banner_text',
            key: 'banner_text',
            render: (text: string) =>
                text ? (
                    <Tooltip title={text}>
                        <span style={{ fontSize: '13px', color: '#595959' }}>
                            {text.length > 40 ? text.slice(0, 40) + '…' : text}
                        </span>
                    </Tooltip>
                ) : (
                    <span style={{ color: '#bfbfbf', fontSize: '13px' }}>No banner</span>
                ),
        },
        {
            title: 'Banner Color',
            dataIndex: 'banner_color',
            key: 'banner_color',
            width: 120,
            render: (color: string) =>
                color ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: '4px',
                                backgroundColor: color,
                                border: '1px solid rgba(0,0,0,0.1)',
                            }}
                        />
                        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{color}</span>
                    </div>
                ) : (
                    <span style={{ color: '#bfbfbf', fontSize: '13px' }}>—</span>
                ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {(status || 'inactive').toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 140,
            render: (_: any, record: any) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditCategoryBanner(record)}
                    >
                        {record.banner_text ? 'Edit' : 'Add'}
                    </Button>
                    {record.banner_text && (
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveCategoryBanner(record)}
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <style>{`
                @keyframes settingsMarquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
            <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: 0, color: '#8c8c8c', fontSize: '13px' }}>
                    Manage scrolling banner text and colors for each test category card.
                </p>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Table
                    columns={categoryColumns}
                    dataSource={categories}
                    rowKey="id"
                    loading={loadingCategories}
                    pagination={false}
                    size="middle"
                    sticky
                    scroll={{ y: 'calc(100vh - 350px)' }}
                    locale={{
                        emptyText: (
                            <Empty
                                description="No categories found"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ),
                    }}
                />
            </div>

            {/* Category Banner Edit Modal */}
            <SharedModal
                title={`Edit Banner — ${editingCategory?.category_name || ''}`}
                open={categoryModalVisible}
                onOk={() => categoryForm.submit()}
                onCancel={handleCancelCategoryModal}
                okText="Save Banner"
                confirmLoading={submittingCategory}
            >
                <Form
                    form={categoryForm}
                    layout="vertical"
                    onFinish={handleCategoryBannerSubmit}
                >
                    <Form.Item
                        name="banner_text"
                        label="Scrolling Banner Text"
                        extra="Enter text to show a marquee banner at the bottom of the category card. Use ' • ' to separate multiple announcements."
                    >
                        <Input placeholder="e.g. 🔴 1,200+ Typhoid cases   •   20,186 Chikungunya" />
                    </Form.Item>

                    <Form.Item
                        name="banner_color"
                        label="Banner Background Color"
                    >
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Input
                                type="color"
                                style={{
                                    height: '32px',
                                    width: '50px',
                                    padding: '2px',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            />
                            <Button
                                type="text"
                                size="small"
                                onClick={() => categoryForm.setFieldsValue({ banner_color: '#fff0f3' })}
                                style={{ fontSize: '11px', color: '#1890ff', padding: 0 }}
                            >
                                Reset to default
                            </Button>
                        </div>
                    </Form.Item>

                    {bannerPreviewText && (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                                Live Banner Preview:
                            </div>
                            <div
                                style={{
                                    position: 'relative',
                                    height: '30px',
                                    backgroundColor: bannerColor || '#fff0f3',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        whiteSpace: 'nowrap',
                                        position: 'absolute',
                                        animation: 'settingsMarquee 8s linear infinite',
                                        paddingLeft: '100%',
                                        fontWeight: 'bold',
                                        fontSize: '11px',
                                        color: '#1f1f1f',
                                    }}
                                >
                                    {bannerPreviewText}
                                </div>
                            </div>
                        </div>
                    )}
                </Form>
            </SharedModal>
        </div>
    );
};

export default CategoryBannersTab;
