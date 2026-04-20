import React, { useState, useEffect, useRef } from 'react';
import {
    Button,
    Card,
    Input,
    Space,
    Form,
    message,
    Typography
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    MedicineBoxOutlined
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
    } = useDoctors();

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
        form.setFieldsValue(doctor);
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
            if (editingDoctor) {
                const success = await updateDoctor(editingDoctor.id, values);
                if (success) setIsModalOpen(false);
            } else {
                const success = await createDoctor(values);
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
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size={isMobile ? "middle" : "large"}
                    block={isMobile}
                >
                    Onboard New Doctor
                </Button>
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
                <div style={{ marginBottom: 16, flexShrink: 0 }}>
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
                    />
                </div>
            </Card>

            <DoctorFormModal
                visible={isModalOpen}
                editingDoctor={editingDoctor}
                form={form}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
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
