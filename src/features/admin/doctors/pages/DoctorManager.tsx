import React, { useState, useEffect } from 'react';
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
import { doctorService } from '../services/doctorService';
import { DoctorTable, DoctorFormModal } from '../components';
import type { Doctor } from '../types/doctor.types';

const { Title, Text } = Typography;

const DoctorManager: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await doctorService.getDoctors({
                search: searchText
            });
            // Depending on API response structure
            setDoctors(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            message.error('Failed to fetch doctors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, [searchText]);

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
        try {
            await doctorService.deleteDoctor(id);
            message.success('Doctor removed successfully');
            fetchDoctors();
        } catch (error) {
            message.error('Failed to remove doctor');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingDoctor) {
                await doctorService.updateDoctor(editingDoctor.id, values);
                message.success('Doctor updated successfully');
            } else {
                await doctorService.createDoctor(values);
                message.success('Doctor onboarded successfully');
            }
            setIsModalOpen(false);
            fetchDoctors();
        } catch (error) {
            message.error('Failed to save doctor');
        }
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
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
                        <MedicineBoxOutlined style={{ fontSize: '24px', color: 'white' }} />
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

            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="Search by name, specialty, or email"
                        prefix={<SearchOutlined />}
                        style={{ width: 350 }}
                        allowClear
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <DoctorTable
                    doctors={doctors}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </Card>

            <DoctorFormModal
                visible={isModalOpen}
                editingDoctor={editingDoctor}
                form={form}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
            />
        </Space>
    );
};

export default DoctorManager;
