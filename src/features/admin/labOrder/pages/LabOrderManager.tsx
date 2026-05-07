import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Form, Typography, Space, Badge, Checkbox, Divider } from 'antd';
import { PlusOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLabOrders } from '../hooks/useLabOrders';
import { LabOrderTable, LabOrderFilters, LabOrderFormModal, LabOrderDetailDrawer, AssignAgentModal, ReportUploadModal } from '../components';
import LabOrderProofModal from '../components/LabOrderProofModal';
import type { LabOrder } from '../types/labOrder.types';

import dayjs from 'dayjs';

const { Title } = Typography;

const LabOrderManager: React.FC = () => {
    const [searchParams] = useSearchParams();
    const statusParam = searchParams.get('status');
    const highlightParam = searchParams.get('highlight');
    const navigate = useNavigate();

    const {
        orders,
        loading,
        loadingMore,
        submitting,
        pagination,
        filters,
        setFilters,
        createOrder,
        updateOrder,
        assignAgent,
        broadcastOrder,
        uploadReports,
        deleteOrder,
        loadMore
    } = useLabOrders({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: statusParam || undefined
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editingOrder, setEditingOrder] = useState<LabOrder | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    const [isProofModalVisible, setIsProofModalVisible] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([
        'order_info', 'patient', 'tests', 'agent', 'agent_assign', 'amount', 'status', 'actions'
    ]);
    const [form] = Form.useForm();

    const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;

    // Track the previous statusParam so we only trigger a re-fetch when it genuinely changes
    const prevStatusParam = useRef(statusParam);
    useEffect(() => {
        if (prevStatusParam.current !== statusParam) {
            prevStatusParam.current = statusParam;
            setFilters(prev => ({ ...prev, status: statusParam || undefined, page: 1 }));
        }
    }, [statusParam, setFilters]);

    // If highlight is present but not found in current orders, automatically search for it
    useEffect(() => {
        if (highlightParam && !loading && orders.length > 0) {
            const isFound = orders.some(o => 
                o.order_code?.toLowerCase() === highlightParam.toLowerCase() || 
                String(o.id) === highlightParam
            );
            
            // Only trigger search if not found and we aren't already searching for it
            if (!isFound && filters.search !== highlightParam) {
                setFilters(prev => ({ ...prev, search: highlightParam, page: 1 }));
            }
        }
    }, [highlightParam, orders, loading, filters.search, setFilters]);

    // Clear the highlight param from URL and reset search filter after a delay
    useEffect(() => {
        if (highlightParam) {
            const timer = setTimeout(() => {
                // Clear highlight from URL while preserving other params
                const params = new URLSearchParams(searchParams);
                params.delete('highlight');
                const newQuery = params.toString();
                
                navigate({
                    pathname: '/lab-orders',
                    search: newQuery ? `?${newQuery}` : ''
                }, { replace: true });

                // If we had automatically set a search filter for this highlight, clear it
                setFilters(prev => {
                    if (prev.search === highlightParam) {
                        return { ...prev, search: undefined, page: 1 };
                    }
                    return prev;
                });
            }, 6000); // Give 6 seconds to see the highlighted row before returning to full list
            return () => clearTimeout(timer);
        }
    }, [highlightParam, searchParams, navigate, setFilters]);

    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    };

    const handleFilterChange = (newFilters: any) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const handleAdd = () => {
        setEditingOrder(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (order: LabOrder) => {
        setEditingOrder(order);
        form.setFieldsValue({
            ...order,
            // Convert strings like "1200.00" to numbers for InputNumber
            total_amount: Number(order.total_amount),
            paid_amount: Number(order.paid_amount),
            scheduled_date: order.scheduled_date ? dayjs(order.scheduled_date) : null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        await deleteOrder(id);
    };



    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const isMobile = screenSize < 768;

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load default columns based on device
    useEffect(() => {
        if (isMobile) {
            setVisibleColumns(['order_info', 'patient', 'status', 'actions']);
        } else {
            setVisibleColumns(['order_info', 'patient', 'tests', 'agent', 'agent_assign', 'amount', 'status', 'actions']);
        }
    }, [isMobile]);

    const [tableHeight, setTableHeight] = useState(400);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === containerRef.current) {
                    setTableHeight(Math.max(200, entry.contentRect.height - 55));
                }
            }
        });

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const handleRowClick = (order: LabOrder) => {
        setSelectedOrderId(order.id);
        setIsDrawerVisible(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerVisible(false);
        setSelectedOrderId(null);
    };

    const handleSubmit = async (values: any) => {
        let success = false;

        const payload = {
            ...values,
            scheduled_date: values.scheduled_date ? values.scheduled_date.toISOString() : undefined,
        };

        if (editingOrder) {
            success = await updateOrder(editingOrder.id, payload);
        } else {
            success = await createOrder(payload);
        }

        if (success) {
            setIsModalVisible(false);
            form.resetFields();
        }
    };

    const handleUploadReport = (order: LabOrder) => {
        setSelectedOrderId(order.id);
        setIsUploadModalVisible(true);
    };

    const handleUploadProof = (order: LabOrder) => {
        setSelectedOrderId(order.id);
        setIsProofModalVisible(true);
    };

    const onReportUpload = async (orderId: number, files: any[], results: any, report_notes?: string) => {
        return await uploadReports(orderId, files, results, report_notes);
    };

    const columnOptions = [
        { label: 'Order Info', value: 'order_info' },
        { label: 'Patient', value: 'patient' },
        { label: 'Tests', value: 'tests' },
        { label: 'Agent', value: 'agent' },
        { label: 'Amount', value: 'amount' },
        { label: 'Status', value: 'status' },
        { label: 'Assign', value: 'agent_assign' },
        { label: 'Actions', value: 'actions' },
    ];

    const columnPicker = (
        <div style={{ padding: '8px', minWidth: '180px' }}>
            <Title level={5} style={{ fontSize: '14px', marginBottom: '12px' }}>Display Columns</Title>
            <Checkbox.Group
                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}
                options={columnOptions}
                value={visibleColumns}
                onChange={(values) => setVisibleColumns(values as string[])}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Button
                type="link"
                size="small"
                style={{ padding: 0 }}
                onClick={() => setVisibleColumns(columnOptions.map(o => o.value))}
            >
                Reset to Default
            </Button>
        </div>
    );

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '16px' : '0'
            }}>
                <Space align="center" size="middle">
                    <div style={{
                        background: '#1890ff',
                        padding: isMobile ? '8px' : '10px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <ExperimentOutlined style={{ fontSize: isMobile ? '20px' : '24px', color: 'white' }} />
                    </div>
                    <div>
                        <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Lab Test Orders</Title>
                        <Space wrap={isMobile}>
                            <Badge status="processing" text={`${pagination.total} Orders`} />
                        </Space>
                    </div>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size={isMobile ? "middle" : "large"}
                    style={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 10px rgba(24, 144, 255, 0.3)',
                        width: isMobile ? '100%' : 'auto'
                    }}
                >
                    Create New Order
                </Button>
            </div>

            <LabOrderFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                columnPickerContent={columnPicker}
            />

            <Card
                styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 } }}
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
            >
                <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
                    <LabOrderTable
                        data={orders}
                        loading={loading}
                        loadingMore={loadingMore}
                        hasMore={pagination.hasMore}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAssign={(order) => {
                            setSelectedOrderId(order.id);
                            setIsAssignModalVisible(true);
                        }}
                        onLoadMore={loadMore}
                        onRowClick={handleRowClick}
                        onUploadReport={handleUploadReport}
                        onUploadProof={handleUploadProof}
                        visibleColumns={visibleColumns}
                        highlightOrderCode={highlightParam || undefined}
                        scroll={{ x: isMobile ? 'max-content' : undefined, y: tableHeight }}
                    />
                </div>
            </Card>

            <LabOrderFormModal
                visible={isModalVisible}
                editingOrder={editingOrder}
                form={form}
                onSubmit={handleSubmit}
                onCancel={() => setIsModalVisible(false)}
                submitting={submitting}
            />

            <LabOrderDetailDrawer
                open={isDrawerVisible}
                order={selectedOrder}
                onClose={handleDrawerClose}
                onUploadReport={handleUploadReport}
            />

            <AssignAgentModal
                visible={isAssignModalVisible}
                order={selectedOrder}
                onClose={() => setIsAssignModalVisible(false)}
                onAssignAgent={assignAgent}
                onBroadcast={broadcastOrder}
            />

            <ReportUploadModal
                visible={isUploadModalVisible}
                order={selectedOrder}
                onClose={() => setIsUploadModalVisible(false)}
                onUpload={onReportUpload}
            />

            <LabOrderProofModal
                visible={isProofModalVisible}
                order={selectedOrder}
                onClose={() => setIsProofModalVisible(false)}
                onSuccess={() => {
                    setFilters(prev => ({ ...prev }));
                }}
            />
        </div>
    );
};

export default LabOrderManager;
