import React from 'react';
import { Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';
import type { Patient } from '../types/patient.types';
import dayjs from 'dayjs';

interface PatientTableProps {
    data: Patient[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    onEdit: (record: Patient) => void;
    onDelete: (id: number) => void;
    onLoadMore: () => void;
    scroll?: { x?: number | string; y?: number | string };
}

const PatientTable: React.FC<PatientTableProps> = ({
    data,
    loading,
    loadingMore,
    hasMore,
    onEdit,
    onDelete,
    onLoadMore,
    scroll,
}) => {
    // Calculate age from DOB
    const calculateAge = (dob: string): number => {
        return dayjs().diff(dayjs(dob), 'year');
    };

    const columns = [
        {
            title: 'Patient Code',
            dataIndex: 'patient_code',
            key: 'patient_code',
            width: 120,
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: 'Name',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text: string) => (
                <Space>
                    <UserOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            width: 90,
            render: (gender: string) => (
                <Tag color={gender === 'Male' ? 'blue' : gender === 'Female' ? 'pink' : 'default'}>
                    {gender}
                </Tag>
            ),
        },
        {
            title: 'Age',
            dataIndex: 'dob',
            key: 'age',
            width: 80,
            render: (dob: string) => `${calculateAge(dob)} yrs`,
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            width: 120,
            render: (phone: string) => phone || '-',
        },
        {
            title: 'Registered',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('DD MMM YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_: any, record: Patient) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                    />
                    <Popconfirm
                        title="Delete Patient?"
                        description="Are you sure you want to delete this patient?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <InfiniteScrollTable
            columns={columns}
            dataSource={data}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            next={onLoadMore}
            scroll={scroll}
            rowKey="id"
        />
    );
};

export default PatientTable;
