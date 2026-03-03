import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePatients } from '../hooks/usePatients';
import { PatientTable, PatientFilters, PatientFormModal, PatientDetailDrawer } from '../components';
import type { Patient } from '../types/patient.types';

const PatientManager: React.FC = () => {
    const {
        patients,
        loadingPatients,
        loadingMorePatients,
        patientPagination,
        patientFilters,
        setPatientFilters,
        createPatient,
        updatePatient,
        deletePatient,
        loadMore
    } = usePatients();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [form] = Form.useForm();

    const handleSearch = (value: string) => {
        setPatientFilters((prev) => ({ ...prev, search: value, page: 1 }));
    };

    const handleFilterChange = (filters: any) => {
        setPatientFilters((prev) => ({ ...prev, ...filters }));
    };

    const handleAdd = () => {
        setEditingPatient(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        form.setFieldsValue({
            ...patient,
        });
        setIsModalVisible(true);
    };

    const handleView = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsDrawerVisible(true);
    };

    const handleDelete = async (id: number) => {
        await deletePatient(id);
    };

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

    const handleSubmit = async (values: any) => {
        let success = false;
        if (editingPatient) {
            success = await updatePatient(editingPatient.id, values);
        } else {
            success = await createPatient(values);
        }

        if (success) {
            setIsModalVisible(false);
            form.resetFields();
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h1 style={{ fontSize: '24px', margin: 0 }}>Patient Management</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Add New Patient
                </Button>
            </div>

            <PatientFilters
                filters={patientFilters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
            />

            <Card
                styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 } }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
                <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
                    <PatientTable
                        data={patients}
                        loading={loadingPatients}
                        loadingMore={loadingMorePatients}
                        hasMore={patientPagination.hasMore}
                        onEdit={handleEdit}
                        onView={handleView}
                        onDelete={handleDelete}
                        onLoadMore={loadMore}
                        scroll={{ y: tableHeight }}
                    />
                </div>
                {patientPagination.hasMore && !loadingPatients && (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                        <Button onClick={loadMore} loading={loadingMorePatients}>
                            Load More
                        </Button>
                    </div>
                )}
            </Card>

            <PatientFormModal
                visible={isModalVisible}
                editingPatient={editingPatient}
                form={form}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />

            <PatientDetailDrawer
                visible={isDrawerVisible}
                patient={selectedPatient}
                onClose={() => setIsDrawerVisible(false)}
            />
        </div>
    );
};

export default PatientManager;
