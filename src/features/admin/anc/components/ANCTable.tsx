import React from 'react';
import { Tag, Space, Button, Tooltip } from 'antd';
import { EyeOutlined, UserOutlined, CalendarOutlined, FilePdfOutlined } from '@ant-design/icons';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';
import type { Pregnancy } from '../services/ancService';
import dayjs from 'dayjs';
import { formatName } from '@/shared/utils/nameUtils';
import { colors } from '@/styles/colors';

interface ANCTableProps {
    data: Pregnancy[];
    loading: boolean;
    onView: (record: Pregnancy) => void;
    onPreview: (record: Pregnancy) => void;
    scroll?: { x?: number | string; y?: number | string };
}

const ANCTable: React.FC<ANCTableProps> = ({
    data,
    loading,
    onView,
    onPreview,
    scroll,
}) => {
    const calculateWeeks = (lmp: string): number => {
        const totalDays = dayjs().diff(dayjs(lmp), 'day');
        return Math.max(1, Math.floor(totalDays / 7) + 1);
    };

    const getTrimester = (weeks: number): number => {
        if (weeks <= 12) return 1;
        if (weeks <= 26) return 2;
        return 3;
    };

    const columns = [
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>Reg. ID</span>,
            key: 'anc_reg_id',
            width: 80,
            render: (_: any, record: Pregnancy) => (
                <Tag color="blue" style={{ fontWeight: 600, margin: 0 }}>
                    ANC-{record.id.toString().padStart(4, '0')}
                </Tag>
            ),
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>LMP Date</span>,
            dataIndex: 'lmp_date',
            key: 'lmp_date',
            width: 110,
            render: (date: string) => dayjs(date).format('DD MMM YYYY'),
        },
        {
            title: 'Patient',
            dataIndex: ['mother', 'full_name'],
            key: 'patient_name',
            width: 200,
            render: (text: string, record: Pregnancy) => (
                <Space>
                    <UserOutlined />
                    <div style={{ minWidth: '130px' }}>
                        <div style={{ fontWeight: 600 }}>{formatName(text)}</div>
                        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{record.mother.patient_code}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>EDD Date</span>,
            dataIndex: 'edd_date',
            key: 'edd_date',
            width: 120,
            render: (date: string) => (
                <Space>
                    <CalendarOutlined style={{ color: '#ff4d4f' }} />
                    <span style={{ fontWeight: 600, color: '#ff4d4f' }}>{dayjs(date).format('DD MMM YYYY')}</span>
                </Space>
            ),
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>Status</span>,
            key: 'status',
            width: 130,
            render: (_: any, record: Pregnancy) => {
                const weeks = calculateWeeks(record.lmp_date);
                const trimester = getTrimester(weeks);
                const daysToEDD = dayjs(record.edd_date).diff(dayjs(), 'day');
                const isDueSoon = daysToEDD >= 0 && daysToEDD <= 30;

                return (
                    <Space direction="vertical" size={2}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            <Tag color="processing" style={{ margin: 0 }}>W{weeks}</Tag>
                            <Tag color="cyan" style={{ margin: 0 }}>Tri {trimester}</Tag>
                        </div>
                        {isDueSoon && (
                            <Tag color="error" style={{ margin: 0, fontWeight: 600, animation: 'pulse 2s infinite', fontSize: '10px' }}>
                                DUE SOON ({daysToEDD}d)
                            </Tag>
                        )}
                    </Space>
                );
            },
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>Risk Level</span>,
            dataIndex: 'risk_level',
            key: 'risk_level',
            width: 100,
            render: (risk: string) => (
                <Tag color={risk === 'High' ? 'red' : risk === 'Medium' ? 'orange' : 'green'} style={{ margin: 0 }}>
                    {risk || 'Low'}
                </Tag>
            ),
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>History (G/P/A/L)</span>,
            key: 'history',
            width: 120,
            align: 'center' as const,
            render: (_: any, record: Pregnancy) => (
                <Tooltip title="Gravida / Para / Abortions / Living">
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {record.gravida || 0}/{record.para || 0}/{record.abortions || 0}/{record.living_children || 0}
                    </span>
                </Tooltip>
            ),
        },
        {
            title: <span style={{ whiteSpace: 'nowrap' }}>Actions</span>,
            key: 'actions',
            width: 90,
            fixed: 'right' as const,
            align: 'center' as const,
            render: (_: any, record: Pregnancy) => (
                <Space size={0}>
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined style={{ color: colors.primary }} />}
                            onClick={() => onView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Preview & Export ANC Card">
                        <Button
                            type="text"
                            icon={<FilePdfOutlined style={{ color: '#ff4d4f' }} />}
                            onClick={() => onPreview(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <InfiniteScrollTable
            columns={columns}
            dataSource={data}
            loading={loading}
            loadingMore={false}
            hasMore={false}
            next={() => { }}
            scroll={scroll}
            rowKey="id"
        />
    );
};

export default ANCTable;
