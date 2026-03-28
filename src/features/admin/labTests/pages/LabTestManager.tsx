import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, Tabs, Button, Form, Breadcrumb } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { debounce } from '@/shared/utils/debounce';

// Components
import TestFilters from '../components/TestFilters';
import TestTable from '../components/TestTable';
import TestFormModal from '../components/TestFormModal';
import CategoryFilters from '../components/CategoryFilters';
import CategoryTable from '../components/CategoryTable';
import CategoryFormModal from '../components/CategoryFormModal';

// Hooks
import { useTests } from '../hooks/useTests';
import { useCategories } from '../hooks/useCategories';

const LabTestManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState('tests');

    // Container Refs for dynamic height calculation
    const testContainerRef = useRef<HTMLDivElement>(null);
    const categoryContainerRef = useRef<HTMLDivElement>(null);
    const [testTableHeight, setTestTableHeight] = useState(400);
    const [categoryTableHeight, setCategoryTableHeight] = useState(400);

    // Forms
    const [testForm] = Form.useForm();
    const [categoryForm] = Form.useForm();

    // Modals
    const [isTestModalVisible, setIsTestModalVisible] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [editingTest, setEditingTest] = useState<any>(null);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    // Custom Hooks
    const {
        tests,
        loadingTests,
        loadingMoreTests,
        testPagination,
        testFilters,
        setTestFilters,
        createTest,
        updateTest,
        deleteTest,
    } = useTests(activeTab === 'tests');

    const {
        categories,
        allCategories,
        loadingCategories,
        loadingMoreCategories,
        categoryPagination,
        categoryFilters,
        setCategoryFilters,
        createCategory,
        updateCategory,
        deleteCategory,
    } = useCategories(activeTab === 'categories');

    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const isMobile = screenSize < 768;

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ===== DYNAMIC HEIGHT CALCULATION =====
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === testContainerRef.current) {
                    setTestTableHeight(Math.max(200, entry.contentRect.height - 50));
                } else if (entry.target === categoryContainerRef.current) {
                    setCategoryTableHeight(Math.max(200, entry.contentRect.height - 50));
                }
            }
        });

        if (testContainerRef.current) observer.observe(testContainerRef.current);
        if (categoryContainerRef.current) observer.observe(categoryContainerRef.current);

        return () => observer.disconnect();
    }, [activeTab]);

    // ===== INFINITE SCROLL =====
    const fetchMoreTests = useCallback(() => {
        if (loadingMoreTests || !testPagination.hasMore || activeTab !== 'tests') return;
        setTestFilters(prev => ({
            ...prev,
            page: (prev.page || 1) + 1,
        }));
    }, [loadingMoreTests, testPagination.hasMore, activeTab, setTestFilters]);

    const fetchMoreCategories = useCallback(() => {
        if (loadingMoreCategories || !categoryPagination.hasMore || activeTab !== 'categories') return;
        setCategoryFilters(prev => ({
            ...prev,
            page: (prev.page || 1) + 1,
        }));
    }, [loadingMoreCategories, categoryPagination.hasMore, activeTab, setCategoryFilters]);


    // ===== DEBOUNCED SEARCH =====
    const debouncedSearchTests = useMemo(
        () => debounce((value: string) => {
            setTestFilters(prev => ({ ...prev, search: value, page: 1 }));
        }, 500),
        []
    );

    const debouncedSearchCategories = useMemo(
        () => debounce((value: string) => {
            setCategoryFilters(prev => ({ ...prev, search: value, page: 1 }));
        }, 500),
        []
    );

    // ===== TEST HANDLERS =====
    const handleAddTest = () => {
        setEditingTest(null);
        testForm.resetFields();
        setIsTestModalVisible(true);
    };

    const handleEditTest = (record: any) => {
        setEditingTest(record);
        testForm.setFieldsValue({
            ...record,
            category_id: record.category?.id,
            price: Number(record.price)
        });
        setIsTestModalVisible(true);
    };

    const handleTestSubmit = async (values: any) => {
        const success = editingTest
            ? await updateTest(editingTest.id, values)
            : await createTest(values);

        if (success) {
            setIsTestModalVisible(false);
            testForm.resetFields();
        }
    };

    // ===== CATEGORY HANDLERS =====
    const handleAddCategory = () => {
        setEditingCategory(null);
        categoryForm.resetFields();
        setIsCategoryModalVisible(true);
    };

    const handleEditCategory = (record: any) => {
        setEditingCategory(record);
        categoryForm.setFieldsValue(record);
        setIsCategoryModalVisible(true);
    };

    const handleCategorySubmit = async (values: any) => {
        const success = editingCategory
            ? await updateCategory(editingCategory.id, values)
            : await createCategory(values);

        if (success) {
            setIsCategoryModalVisible(false);
            categoryForm.resetFields();
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '16px' }}>
            <div style={{ marginBottom: isMobile ? 8 : 16 }}>
                <Breadcrumb items={[
                    { title: 'Home' },
                    { title: isMobile ? 'Lab' : 'Lab Management' },
                    { title: isMobile ? 'Tests' : 'Tests & Packages' }
                ]} />
            </div>

            <Card
                bordered={false}
                className="shadow-sm"
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                styles={{ 
                    body: { 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflow: 'hidden', 
                        padding: isMobile ? '8px 12px' : '12px 24px' 
                    } 
                }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ height: '100%' }}
                    tabBarExtraContent={isMobile ? undefined : {
                        right: activeTab === 'categories' ? (
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
                                Add Category
                            </Button>
                        ) : (
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTest}>
                                Add Test
                            </Button>
                        )
                    }}
                    items={[
                        {
                            key: 'tests',
                            label: 'Lab Tests',
                            children: (
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    {isMobile && (
                                        <div style={{ marginBottom: 16 }}>
                                            <Button 
                                                type="primary" 
                                                icon={<PlusOutlined />} 
                                                onClick={handleAddTest}
                                                block
                                            >
                                                Add New Test
                                            </Button>
                                        </div>
                                    )}
                                    <div style={{ flexShrink: 0 }}>
                                        <TestFilters
                                            filters={testFilters}
                                            onFilterChange={(filters) => setTestFilters(prev => ({ ...prev, ...filters }))}
                                            onSearch={debouncedSearchTests}
                                            categories={allCategories}
                                        />
                                    </div>

                                    <div
                                        ref={testContainerRef}
                                        style={{ flex: 1, overflow: 'hidden' }}
                                    >
                                        <TestTable
                                            data={tests}
                                            loading={loadingTests}
                                            loadingMore={loadingMoreTests}
                                            hasMore={testPagination.hasMore}
                                            onEdit={handleEditTest}
                                            onDelete={deleteTest}
                                            scroll={{ y: testTableHeight, x: isMobile ? 'max-content' : 900 }}
                                            onScroll={fetchMoreTests}
                                        />
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: 'categories',
                            label: 'Categories',
                            children: (
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    {isMobile && (
                                        <div style={{ marginBottom: 16 }}>
                                            <Button 
                                                type="primary" 
                                                icon={<PlusOutlined />} 
                                                onClick={handleAddCategory}
                                                block
                                            >
                                                Add New Category
                                            </Button>
                                        </div>
                                    )}
                                    <div style={{ flexShrink: 0 }}>
                                        <CategoryFilters
                                            filters={categoryFilters}
                                            onFilterChange={(filters) => setCategoryFilters(prev => ({ ...prev, ...filters }))}
                                            onSearch={debouncedSearchCategories}
                                        />
                                    </div>

                                    <div
                                        ref={categoryContainerRef}
                                        style={{ flex: 1, overflow: 'hidden' }}
                                    >
                                        <CategoryTable
                                            data={categories}
                                            loading={loadingCategories}
                                            loadingMore={loadingMoreCategories}
                                            hasMore={categoryPagination.hasMore}
                                            onEdit={handleEditCategory}
                                            onDelete={deleteCategory}
                                            onNext={fetchMoreCategories}
                                            scroll={{ y: categoryTableHeight, x: isMobile ? 'max-content' : 800 }}
                                        />
                                    </div>
                                </div>
                            )
                        }
                    ]}
                />
            </Card>

            {/* MODALS */}
            <TestFormModal
                visible={isTestModalVisible}
                editingTest={editingTest}
                categories={allCategories}
                form={testForm}
                onSubmit={handleTestSubmit}
                onCancel={() => {
                    setIsTestModalVisible(false);
                    testForm.resetFields();
                }}
            />

            <CategoryFormModal
                visible={isCategoryModalVisible}
                editingCategory={editingCategory}
                form={categoryForm}
                onSubmit={handleCategorySubmit}
                onCancel={() => {
                    setIsCategoryModalVisible(false);
                    categoryForm.resetFields();
                }}
            />

            <style>{`
                .ant-tabs {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .ant-tabs-content-holder {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .ant-tabs-content {
                    height: 100%;
                }
                .ant-tabs-tabpane {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
            `}</style>
        </div>
    );
};

export default LabTestManager;
