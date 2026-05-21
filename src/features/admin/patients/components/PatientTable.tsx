import React from 'react';
import { Tag, Space, Button } from 'antd';
import { UserOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';
import type { Patient } from '../types/patient.types';
import dayjs from 'dayjs';
import { formatName } from '@/shared/utils/nameUtils';

interface PatientTableProps {
    data: Patient[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    onEdit: (record: Patient) => void;
    onView: (record: Patient) => void;
    onDelete: (id: number) => void;
    onLoadMore: () => void;
    scroll?: { x?: number | string; y?: number | string };
    rowSelection?: any;
}

const PatientTable: React.FC<PatientTableProps> = ({
    data,
    loading,
    loadingMore,
    hasMore,
    onEdit,
    onView,
    onDelete,
    onLoadMore,
    scroll,
    rowSelection
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
            width: 200,
            render: (text: string) => <strong style={{ whiteSpace: 'nowrap' }}>{text}</strong>,
        },
        {
            title: 'Name',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text: string, record: Patient) => (
                <Space>
                    <UserOutlined />
                    {formatName(text)}
                    {record.relation && record.relation.toLowerCase() !== 'self' && (
                        <Tag color="cyan" style={{ marginLeft: 4 }}>
                            {formatName(record.relation)}
                        </Tag>
                    )}
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
            width: 140,
            render: (phone: string) => <span style={{ whiteSpace: 'nowrap' }}>{phone || '-'}</span>,
        },
        {
            title: 'Registered',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 130,
            render: (date: string) => <span style={{ whiteSpace: 'nowrap' }}>{dayjs(date).format('DD/MM/YY')}</span>,
        },
    ];

    return (
        <React.Fragment>
            <style>
                {`
                .family-child-row {
                    background-color: #faf3f6 !important;
                }
                .family-child-row td {
                    border-bottom: 1px dashed #f0f0f0 !important;
                }
                `}
            </style>
            <InfiniteScrollTable
                rowSelection={rowSelection}
                columns={columns}
                dataSource={data}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                next={onLoadMore}
                scroll={scroll}
                rowKey="id"
                rowClassName={(record: Patient) => record.added_by_id ? 'family-child-row' : ''}
                expandable={{
                    expandIconColumnIndex: rowSelection ? 1 : 0,
                    indentSize: 24,
                    expandIcon: ({ expanded, onExpand, record }) => {
                        const hasChildren = record.children && record.children.length > 0;
                        if (hasChildren) {
                            return (
                                <Button
                                    type="text"
                                    size="small"
                                    onClick={(e) => onExpand(record, e)}
                                    icon={expanded ? <DownOutlined style={{ fontSize: '10px' }} /> : <RightOutlined style={{ fontSize: '10px' }} />}
                                    style={{ marginRight: 8, width: 20, height: 20, padding: 0, borderRadius: '4px', backgroundColor: '#f0f5ff' }}
                                />
                            );
                        }
                        // Spacer for primary patients without children to keep vertical alignment
                        if (!record.added_by_id) {
                            return <span style={{ display: 'inline-block', width: 28 }} />;
                        }
                        return null;
                    }
                }}
            />
        </React.Fragment>
    );
};

export default PatientTable;
