import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Form, Typography, Space, Badge } from 'antd';
import { PlusOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { useLabOrders } from '../hooks/useLabOrders';
import { LabOrderTable, LabOrderFilters, LabOrderFormModal, LabOrderDetailDrawer, AssignAgentModal } from '../components';
import type { LabOrder } from '../types/labOrder.types';

import dayjs from 'dayjs';

const { Title } = Typography;

const LabOrderManager: React.FC = () => {
    const [searchParams] = useSearchParams();
    const statusParam = searchParams.get('status');

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
        updateOrderStatus,
        assignAgent,
        broadcastOrder,
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

    const handleStatusUpdate = async (id: number, status: string) => {
        await updateOrderStatus(id, status);
    };

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

        // Final transformations
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

    return (
        <div style={{ padding: '24px 12px', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space align="center" size="middle">
                    <div style={{
                        background: '#1890ff',
                        padding: '10px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <ExperimentOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Lab Test Orders</Title>
                        <Space>
                            <Badge status="processing" text={`${pagination.total} Total Orders`} />
                            <Badge status="warning" text="Manage Life-cycle" />
                        </Space>
                    </div>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                    style={{ borderRadius: '8px', boxShadow: '0 4px 10px rgba(24, 144, 255, 0.3)' }}
                >
                    Create New Order
                </Button>
            </div>

            <LabOrderFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
            />

            <Card
                bodyStyle={{ padding: 0 }}
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
            >
                <LabOrderTable
                    data={orders}
                    loading={loading}
                    loadingMore={loadingMore}
                    hasMore={pagination.hasMore}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStatusUpdate={handleStatusUpdate}
                    onAssign={(order) => {
                        setSelectedOrderId(order.id);
                        setIsAssignModalVisible(true);
                    }}
                    onLoadMore={loadMore}
                    onRowClick={handleRowClick}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
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
                visible={isDrawerVisible}
                order={selectedOrder}
                onClose={handleDrawerClose}
            />

            <AssignAgentModal
                visible={isAssignModalVisible}
                order={selectedOrder}
                onClose={() => setIsAssignModalVisible(false)}
                onAssignAgent={assignAgent}
                onBroadcast={broadcastOrder}
            />
        </div>
    );
};

export default LabOrderManager;
