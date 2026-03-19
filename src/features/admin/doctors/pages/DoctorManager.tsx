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

    const [tableHeight, setTableHeight] = useState(400);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === containerRef.current) {
                    // Deduct header height from container
                    setTableHeight(Math.max(200, entry.contentRect.height - 55));
                }
            }
        });

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <Space align="center" size="middle">
                    <div style={{
                        background: colors.info,
                        padding: '10px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <MedicineBoxOutlined style={{ fontSize: '24px', color: colors.white }} />
                    </div>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Doctor Management</Title>
                        <Text type="secondary">Onboard and manage medical professionals</Text>
                    </div>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                >
                    Onboard New Doctor
                </Button>
            </div>

            <Card
                styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px' } }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
                <div style={{ marginBottom: 16, flexShrink: 0 }}>
                    <Input
                        placeholder="Search by name, specialty, or email"
                        prefix={<SearchOutlined />}
                        style={{ width: 350 }}
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
                        scroll={{ y: tableHeight }}
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
