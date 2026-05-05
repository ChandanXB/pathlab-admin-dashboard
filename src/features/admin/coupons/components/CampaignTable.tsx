import React from 'react';
import { Tag, Space, Button, Popconfirm, Tooltip, Image } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, MailOutlined, SearchOutlined } from '@ant-design/icons';
import type { Campaign } from '../types/campaign.types';
import dayjs from 'dayjs';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';

interface CampaignTableProps {
  data: Campaign[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onEdit: (record: Campaign) => void;
  onView: (record: Campaign) => void;
  onDelete: (id: number) => void;
  onSend: (record: Campaign) => void;
  onPreview: (record: Campaign) => void;
  onLoadMore: () => void;
  scroll?: { x?: number | string; y?: number | string };
}

const CampaignTable: React.FC<CampaignTableProps> = ({
  data,
  loading,
  loadingMore,
  hasMore,
  onEdit, 
  onView,
  onDelete,
  onSend,
  onPreview,
  onLoadMore,
  scroll 
}) => {
  const columns = [
    {
      title: 'Campaign Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string, record: Campaign) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.subtitle}</div>
        </div>
      ),
    },
    {
      title: 'Banner',
      dataIndex: 'bannerImage',
      key: 'bannerImage',
      width: 80,
      render: (url: string) => url ? <Image src={url} width={44} height={28} style={{ objectFit: 'cover', borderRadius: '4px' }} /> : '—',
    },
    {
      title: 'Linked Coupon',
      dataIndex: 'coupon',
      key: 'coupon',
      width: 130,
      render: (coupon: any) => coupon ? <Tag color="blue">{coupon.code}</Tag> : <Tag>None</Tag>,
    },
    {
      title: 'Validity',
      key: 'validity',
      width: 160,
      render: (_: any, record: Campaign) => (
        <div style={{ fontSize: '12px' }}>
          <div>S: {dayjs(record.startDate).format('DD/MM/YY hh:mm A')}</div>
          <div>E: {dayjs(record.endDate).format('DD/MM/YY hh:mm A')}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 90,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: any, record: Campaign) => (
        <Space size={4}>
          <Tooltip title="Preview Modal View">
            <Button 
              type="text" 
              size="small"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => onPreview(record)} 
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              size="small"
              icon={<SearchOutlined style={{ color: '#52c41a' }} />} 
              onClick={() => onView(record)} 
            />
          </Tooltip>
          <Tooltip title="Send Campaign (Email)">
            <Button 
              type="text" 
              size="small"
              icon={<MailOutlined style={{ color: '#faad14' }} />} 
              onClick={() => onSend(record)} 
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              size="small"
              icon={<EditOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => onEdit(record)} 
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this campaign?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="text" 
                size="small"
                danger 
                icon={<DeleteOutlined />} 
              />
            </Tooltip>
          </Popconfirm>
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

export default CampaignTable;
