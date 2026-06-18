import React from 'react';
import { Tag, Space, Button, Popconfirm, Tooltip, Image, Typography } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { Campaign, BannerDisplayType } from '../types/campaign.types';
import dayjs from 'dayjs';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';
import { splitBannerImages } from '../utils/bannerUtils';

interface HeroBannerTableProps {
  data: Campaign[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onEdit: (record: Campaign) => void;
  onView: (record: Campaign) => void;
  onDelete: (id: number) => void;
  onLoadMore: () => void;
  scroll?: { x?: number | string; y?: number | string };
}

const DISPLAY_TYPE_CONFIG: Record<BannerDisplayType, { label: string; color: string }> = {
  modal: { label: 'Modal', color: 'default' },
  hero_carousel: { label: '🎠 Carousel', color: 'blue' },
  hero_banner: { label: '🖼️ Hero Banner', color: 'purple' },
  event_banner: { label: '🎟️ Event Banner', color: 'orange' },
};

const HeroBannerTable: React.FC<HeroBannerTableProps> = ({
  data,
  loading,
  loadingMore,
  hasMore,
  onEdit,
  onView,
  onDelete,
  onLoadMore,
  scroll,
}) => {
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 220,
      render: (text: string, record: Campaign) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          {record.subtitle && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.subtitle}
            </Typography.Text>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'displayType',
      key: 'displayType',
      width: 130,
      render: (type: BannerDisplayType) => {
        const config = DISPLAY_TYPE_CONFIG[type] || { label: type, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Preview',
      dataIndex: 'bannerImage',
      key: 'bannerImage',
      width: 90,
      render: (url: string) => {
        const images = splitBannerImages(url);
        const firstImage = images[0] || '';
        return firstImage ? (
          <Image
            src={firstImage}
            width={60}
            height={36}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg=="
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 36,
              background: '#f5f5f5',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PictureOutlined style={{ color: '#bbb', fontSize: 16 }} />
          </div>
        );
      },
    },
    {
      title: 'CTA',
      dataIndex: 'ctaText',
      key: 'ctaText',
      width: 100,
      render: (text: string) =>
        text ? (
          <Tag style={{ fontSize: 11 }}>{text}</Tag>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Sort',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      align: 'center' as const,
      render: (val: number) => (
        <Typography.Text style={{ fontWeight: 600, color: '#4361ee' }}>
          #{val ?? 0}
        </Typography.Text>
      ),
    },
    {
      title: 'Validity',
      key: 'validity',
      width: 160,
      render: (_: any, record: Campaign) => (
        <div style={{ fontSize: 12 }}>
          <div>S: {dayjs(record.startDate).format('DD/MM/YY')}</div>
          <div>E: {dayjs(record.endDate).format('DD/MM/YY')}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 90,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'ACTIVE' : 'INACTIVE'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Campaign) => (
        <Space size={4}>
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#4361ee' }} />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this hero banner?"
            description="This will remove it from the landing page."
            onConfirm={() => onDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
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

export default HeroBannerTable;
