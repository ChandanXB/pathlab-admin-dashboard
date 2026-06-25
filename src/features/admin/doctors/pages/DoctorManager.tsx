import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Button,
    Card,
    Input,
    Space,
    Form,
    message,
    Typography,
    Modal
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    MedicineBoxOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import colors from '@/styles/colors';
import { useDoctors } from '../hooks/useDoctors';
import { DoctorTable, DoctorFormModal, DoctorDetailDrawer } from '../components';
import type { Doctor } from '../types/doctor.types';

const { Title, Text } = Typography;

const DoctorManager: React.FC = () => {
    const {
        doctors,
        loadingDoctors,
        loadingMoreDoctors,
        doctorPagination,
        setDoctorFilters,
        createDoctor,
        updateDoctor,
        deleteDoctor,
        loadMore,
        savingDoctor,
    } = useDoctors();

    const [selectedDoctorKeys, setSelectedDoctorKeys] = useState<React.Key[]>([]);

    const clearDoctorSelection = useCallback(() => {
        setSelectedDoctorKeys([]);
    }, []);

    useEffect(() => {
        clearDoctorSelection();
    }, [doctors, clearDoctorSelection]);

    const doctorRowSelection = useMemo(() => ({
        selectedRowKeys: selectedDoctorKeys,
        onChange: (keys: React.Key[]) => {
            setSelectedDoctorKeys(keys);
        }
    }), [selectedDoctorKeys]);

    const handleBulkDelete = () => {
        Modal.confirm({
            title: 'Delete Selected Doctors',
            content: `Are you sure you want to permanently delete ${selectedDoctorKeys.length} selected doctors? This action cannot be undone.`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            style: { top: 80 },
            onOk: async () => {
                const total = selectedDoctorKeys.length;
                const hide = message.loading(`Deleting ${total} selected doctor(s)...`, 0);
                try {
                    let successCount = 0;
                    for (let i = 0; i < selectedDoctorKeys.length; i++) {
                        const key = selectedDoctorKeys[i];
                        const isLast = i === selectedDoctorKeys.length - 1;
                        try {
                            await deleteDoctor(Number(key), false, isLast);
                            successCount++;
                        } catch (e: any) {
                            console.error(`Failed to delete doctor ID ${key}`, e);
                        }
                    }
                    if (successCount === total) {
                        message.success(`Successfully deleted all ${total} selected doctors`);
                    } else if (successCount > 0) {
                        message.warning(`Successfully deleted ${successCount} of ${total} selected doctors`);
                    } else {
                        message.error(`Failed to delete any of the selected doctors`);
                    }
                    clearDoctorSelection();
                } catch (err: any) {
                    message.error(`Bulk delete failed: ` + err.message);
                } finally {
                    hide();
                }
            }
        });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
    const [form] = Form.useForm();

    const handleSearch = (value: string) => {
        setDoctorFilters((prev) => ({ ...prev, search: value, page: 1 }));
    };

    const handleAdd = () => {
        setEditingDoctor(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (doctor: Doctor) => {
        setEditingDoctor(doctor);
        form.setFieldsValue({
            ...doctor,
            phone: doctor.phone ? doctor.phone.replace(/^\+91/, '') : ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        await deleteDoctor(id);
    };

    const handleRowClick = (doctor: Doctor) => {
        setViewingDoctor(doctor);
        setIsDetailDrawerOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            // Ensure numeric values are properly cast
            if (values.experience_years !== undefined && values.experience_years !== null && values.experience_years !== '') {
                values.experience_years = parseInt(values.experience_years, 10);
            } else {
                delete values.experience_years;
            }

            if (values.consultation_fee !== undefined && values.consultation_fee !== null && values.consultation_fee !== '') {
                values.consultation_fee = parseFloat(values.consultation_fee);
            } else {
                delete values.consultation_fee;
            }

            if (values.commission_rate !== undefined && values.commission_rate !== null && values.commission_rate !== '') {
                values.commission_rate = parseFloat(values.commission_rate);
            } else {
                delete values.commission_rate;
            }
            const payload = {
                ...values,
                phone: values.phone ? (values.phone.startsWith('+91') ? values.phone : `+91${values.phone}`) : undefined
            };
            if (editingDoctor) {
                const success = await updateDoctor(editingDoctor.id, payload);
                if (success) setIsModalOpen(false);
            } else {
                const success = await createDoctor(payload);
                if (success) setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Save doctor error:', error);
            message.error('Failed to save doctor');
        }
    };

    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const isMobile = screenSize < 768;

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
            <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '16px' : '0',
                flexShrink: 0 
            }}>
                <Space align="center" size="middle">
                    <div style={{
                        background: colors.info,
                        padding: isMobile ? '8px' : '10px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <MedicineBoxOutlined style={{ fontSize: isMobile ? '20px' : '24px', color: colors.white }} />
                    </div>
                    <div>
                        <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Doctor Management</Title>
                        {!isMobile && <Text type="secondary">Onboard and manage medical professionals</Text>}
                    </div>
                </Space>
                <Space size="middle" style={{ width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
                    {selectedDoctorKeys.length > 0 && (
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleBulkDelete}
                            size={isMobile ? "middle" : "large"}
                            style={{
                                borderRadius: '8px',
                                width: isMobile ? '100%' : 'auto'
                            }}
                        >
                            Delete ({selectedDoctorKeys.length})
                        </Button>
                    )}
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size={isMobile ? "middle" : "large"}
                        block={isMobile}
                        style={{
                            borderRadius: '8px',
                            width: isMobile ? '100%' : 'auto'
                        }}
                    >
                        Onboard New Doctor
                    </Button>
                </Space>
            </div>

            <Card
                styles={{ 
                    body: { 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflow: 'hidden', 
                        padding: isMobile ? '16px' : '24px' 
                    } 
                }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
                <div style={{ flexShrink: 0, marginBottom: 16 }}>
                    <Input
                        placeholder="Search doctors..."
                        prefix={<SearchOutlined />}
                        style={{ width: isMobile ? '100%' : 350 }}
                        allowClear
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
                    <DoctorTable
                        doctors={doctors}
                        loading={loadingDoctors}
                        loadingMore={loadingMoreDoctors}
                        hasMore={doctorPagination.hasMore}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onRowClick={handleRowClick}
                        onLoadMore={loadMore}
                        scroll={{ x: isMobile ? 'max-content' : undefined, y: tableHeight }}
                        rowSelection={doctorRowSelection}
                    />
                </div>
            </Card>

            <DoctorFormModal
                visible={isModalOpen}
                editingDoctor={editingDoctor}
                form={form}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                loading={savingDoctor}
            />

            <DoctorDetailDrawer
                visible={isDetailDrawerOpen}
                doctor={viewingDoctor}
                onClose={() => setIsDetailDrawerOpen(false)}
            />
        </div>
    );
};

export default DoctorManager;
