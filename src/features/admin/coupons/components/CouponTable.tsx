import React from 'react';
import { Tag, Space, Button, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Coupon } from '../types/coupon.types';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';

interface CouponTableProps {
  data: Coupon[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onEdit: (record: Coupon) => void;
  onView: (record: Coupon) => void;
  onDelete: (id: number) => void;
  onLoadMore: () => void;
  scroll: { x: number | string; y: number | string };
}
const CouponTable: React.FC<CouponTableProps> = ({ 
  data, 
  loading, 
  loadingMore,
  hasMore,
  onEdit, 
  onView,
  onDelete, 
  onLoadMore,
  scroll 
}) => {
  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (_: any, record: Coupon) => (
        <span>
          {record.discountType === 'percentage' ? `${record.discountValue}%` : `₹${record.discountValue}`}
        </span>
      ),
    },
    {
      title: 'Applicability',
      dataIndex: 'applicableTo',
      key: 'applicableTo',
      render: (text: string) => (
        <Tag color={text === 'all' ? 'gold' : 'blue'}>
          {text.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Validity',
      key: 'validity',
      render: (_: any, record: Coupon) => (
        <div style={{ fontSize: '12px' }}>
          <div>S: {dayjs(record.startDate).format('DD/MM/YY hh:mm A')}</div>
          <div>E: {dayjs(record.endDate).format('DD/MM/YY hh:mm A')}</div>
        </div>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (_: any, record: Coupon) => (
        <span>
          {record.usedCount} / {record.usageLimit || '∞'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      render: (_: any, record: Coupon) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#52c41a' }} />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#1890ff' }} />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Coupon"
              description="Are you sure you want to delete this coupon?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <InfiniteScrollTable
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      next={onLoadMore}
      scroll={scroll}
      size="middle"
    />
  );
};

export default CouponTable;
