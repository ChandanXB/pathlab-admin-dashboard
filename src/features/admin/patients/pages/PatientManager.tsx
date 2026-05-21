import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, Button, Form, Modal } from 'antd';
import { PlusOutlined, UnorderedListOutlined, MedicineBoxOutlined, LineChartOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { usePatients } from '../hooks/usePatients';
import { PatientTable, PatientFilters, PatientFormModal, PatientDetailDrawer } from '../components';
import type { Patient } from '../types/patient.types';
import ConsultationManager from '../../consultations/pages/ConsultationManager';
import PNCManager from './PNCManager';
import { Tabs } from 'antd';
import SelectionToolbar from '@/shared/components/SelectionToolbar';

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
        bulkDeletePatients,
        loadMore
    } = usePatients();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [form] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);

    const clearPatientSelection = useCallback(() => {
        setSelectedRowKeys([]);
        setSelectedPatients([]);
    }, []);

    // Reset selection when search filters or flat list change
    useEffect(() => {
        clearPatientSelection();
    }, [patients, patientFilters?.search, patientFilters?.gender, clearPatientSelection]);

    const patientRowSelection = useMemo(() => ({
        selectedRowKeys,
        onChange: (keys: React.Key[], rows: any[]) => {
            setSelectedRowKeys(keys);
            setSelectedPatients(rows);
        }
    }), [selectedRowKeys]);

    const handleEditSelectedPatient = () => {
        if (selectedPatients.length === 1) {
            handleEdit(selectedPatients[0]);
        }
    };

    const handleViewSelectedPatient = () => {
        if (selectedPatients.length === 1) {
            handleView(selectedPatients[0]);
        }
    };

    const handleDeleteSelectedPatients = async () => {
        const ids = selectedRowKeys.map(Number);
        const success = await bulkDeletePatients(ids);
        if (success) {
            clearPatientSelection();
        }
    };

    const groupedPatients = useMemo(() => {
        const userToPatientMap = new Map<number, Patient>();
        const allNodes = patients.map(p => ({ ...p, children: [] as Patient[] }));

        // Map primary patients (who have user_id)
        allNodes.forEach(p => {
            if (p.user_id) {
                userToPatientMap.set(p.user_id, p);
            }
        });

        const roots: Patient[] = [];

        allNodes.forEach(p => {
            // A family member has added_by_id pointing to a primary patient's user_id
            if (p.added_by_id && userToPatientMap.has(p.added_by_id)) {
                // Important: Only add as child if it's NOT the primary patient themselves
                // (e.g., prevent circular dependencies if for some reason p.user_id === p.added_by_id)
                if (p.user_id !== p.added_by_id) {
                    const parent = userToPatientMap.get(p.added_by_id)!;
                    parent.children!.push(p);
                } else {
                    roots.push(p);
                }
            } else {
                // Primary patient, or its primary patient isn't in this current paginated view
                roots.push(p);
            }
        });

        // Clean up empty children arrays so AntD doesn't show expand icon unnecessarily
        const cleanEmptyChildren = (nodes: Patient[]) => {
            nodes.forEach(n => {
                if (n.children && n.children.length === 0) {
                    delete n.children;
                } else if (n.children) {
                    // Sorting children by creation date to show newest family member first
                    n.children.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    cleanEmptyChildren(n.children);
                }
            });
        };
        
        cleanEmptyChildren(roots);

        return roots;
    }, [patients]);

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

    const handleBulkDelete = () => {
        Modal.confirm({
            title: 'Delete Selected Patients',
            content: `Are you sure you want to delete ${selectedRowKeys.length} selected patients? All records including pregnancy checklists, appointments, growth history, and vaccinations will be cascade-deleted. This action cannot be undone.`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            style: { top: 80 },
            onOk: async () => {
                const ids = selectedRowKeys.map(Number);
                const success = await bulkDeletePatients(ids);
                if (success) {
                    setSelectedRowKeys([]);
                }
            }
        });
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
        <Tabs
            defaultActiveKey="patients"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            items={[
                {
                    key: 'patients',
                    label: <span><UnorderedListOutlined /> {isMobile ? "Patients" : "All Patients"}</span>,
                    children: (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
            <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '16px' : '0',
                marginBottom: 16 
            }}>
                <h1 style={{ fontSize: isMobile ? '20px' : '24px', margin: 0 }}>Patient Management</h1>
                <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ flex: isMobile ? 1 : 'none', minWidth: 140 }}>
                        Add New Patient
                    </Button>
                </div>
            </div>

            {selectedRowKeys.length > 0 ? (
                <SelectionToolbar
                    count={selectedRowKeys.length}
                    itemName="patient"
                    onDeselect={clearPatientSelection}
                    onEdit={handleEditSelectedPatient}
                    onDelete={handleDeleteSelectedPatients}
                    deletePopconfirmTitle={`Are you sure you want to delete ${selectedRowKeys.length} selected patients? All records including checklists, appointments, growth history, and vaccinations will be cascade-deleted.`}
                    editDisabled={selectedRowKeys.length !== 1}
                    extraActions={
                        selectedRowKeys.length === 1 && (
                            <Button
                                type="default"
                                icon={<EyeOutlined />}
                                onClick={handleViewSelectedPatient}
                                style={{ borderRadius: '6px' }}
                            >
                                View Details
                            </Button>
                        )
                    }
                />
            ) : (
                <PatientFilters
                    filters={patientFilters}
                    onFilterChange={handleFilterChange}
                    onSearch={handleSearch}
                />
            )}

            <Card
                styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 } }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
                <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
                    <PatientTable
                        data={groupedPatients}
                        loading={loadingPatients}
                        loadingMore={loadingMorePatients}
                        hasMore={patientPagination.hasMore}
                        onEdit={handleEdit}
                        onView={handleView}
                        onDelete={handleDelete}
                        onLoadMore={loadMore}
                        rowSelection={patientRowSelection}
                        scroll={{ x: isMobile ? 'max-content' : undefined, y: tableHeight }}
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
                    )
                },
                {
                    key: 'pnc',
                    label: <span><LineChartOutlined /> PNC Care</span>,
                    children: (
                        <div style={{ height: '100%' }}>
                            <PNCManager />
                        </div>
                    )
                },
                {
                    key: 'consultations',
                    label: <span><MedicineBoxOutlined /> Consultations</span>,
                    children: (
                        <div style={{ height: '100%' }}>
                            <ConsultationManager hideHeader />
                        </div>
                    )
                }
            ]}
        />
    );
};

export default PatientManager;
