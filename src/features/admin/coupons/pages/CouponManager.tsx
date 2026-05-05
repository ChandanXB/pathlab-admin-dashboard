import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Form, Breadcrumb, Space, message, Input, Tabs, Drawer, Descriptions, Divider, Tag, Image } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { couponService } from '../services/couponService';
import { campaignService } from '../services/campaignService';
import type { Coupon } from '../types/coupon.types';
import type { Campaign } from '../types/campaign.types';
import CouponTable from '../components/CouponTable';
import CouponFormModal from '../components/CouponFormModal';
import CampaignTable from '../components/CampaignTable';
import CampaignFormModal from '../components/CampaignFormModal';
import SendCampaignModal from '../components/SendCampaignModal';
import CampaignPreviewModal from '../components/CampaignPreviewModal';
import axiosInstance from '@/config/apiClient';
import { debounce } from '@/shared/utils/debounce';

const CouponManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('coupons');

  // Coupon States
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [form] = Form.useForm();

  // Campaign States
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingMoreCampaigns, setLoadingMoreCampaigns] = useState(false);
  const [campaignPage, setCampaignPage] = useState(1);
  const [hasMoreCampaigns, setHasMoreCampaigns] = useState(true);
  const [isCampaignModalVisible, setIsCampaignModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignForm] = Form.useForm();
  const [isSendCampaignModalVisible, setIsSendCampaignModalVisible] = useState(false);
  const [campaignToSend, setCampaignToSend] = useState<Campaign | null>(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);

  // Drawer States
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<'coupon' | 'campaign'>('coupon');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // For applicability selection
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);

  const fetchCoupons = useCallback(async (currentPage: number, search: string, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await couponService.getAllCoupons({
        search: search,
        page: currentPage,
        limit: 15
      });

      const newCoupons = response.data || [];
      const total = response.meta?.total || 0;

      if (isLoadMore) {
        setCoupons(prev => [...prev, ...newCoupons]);
      } else {
        setCoupons(newCoupons);
      }

      setHasMore(coupons.length + newCoupons.length < total);
    } catch (error) {
      message.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [coupons.length]);

  const fetchCampaigns = async (currentPage: number, search: string, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setLoadingMoreCampaigns(true);
    } else {
      setLoadingCampaigns(true);
    }
    
    try {
      const response = await campaignService.getAllCampaigns({
        search: search,
        page: currentPage,
        limit: 15
      });
      
      const newCampaigns = response.data || [];
      const total = response.meta?.total || 0;
      
      if (isLoadMore) {
        setCampaigns(prev => [...prev, ...newCampaigns]);
      } else {
        setCampaigns(newCampaigns);
      }
      
      setHasMoreCampaigns(campaigns.length + newCampaigns.length < total);
    } catch (error) {
      console.error('Failed to fetch campaigns');
      message.error('Failed to fetch campaigns');
    } finally {
      setLoadingCampaigns(false);
      setLoadingMoreCampaigns(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [testsRes, packagesRes] = await Promise.all([
        axiosInstance.get('/lab-tests', { params: { limit: 1000 } }),
        axiosInstance.get('/routine-checkups', { params: { limit: 1000 } })
      ]);
      setTests(testsRes.data.data || []);
      setPackages(packagesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tests/packages');
    }
  };

  useEffect(() => {
    if (activeTab === 'coupons') {
      fetchCoupons(1, searchText);
    } else {
      fetchCampaigns(1, searchText);
    }
    fetchDependencies();
  }, [searchText, activeTab]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCoupons(nextPage, searchText, true);
    }
  };

  const handleLoadMoreCampaigns = () => {
    if (!loadingMoreCampaigns && hasMoreCampaigns) {
      const nextPage = campaignPage + 1;
      setCampaignPage(nextPage);
      fetchCampaigns(nextPage, searchText, true);
    }
  };

  const handleView = (record: Coupon) => {
    setSelectedRecord(record);
    setDrawerType('coupon');
    setIsDrawerVisible(true);
  };

  const handleViewCampaign = (record: Campaign) => {
    setSelectedRecord(record);
    setDrawerType('campaign');
    setIsDrawerVisible(true);
  };

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchText(value);
      setPage(1);
      setCampaignPage(1);
    }, 500),
    []
  );

  const handleAdd = () => {
    if (activeTab === 'coupons') {
      setEditingCoupon(null);
      form.resetFields();
      setIsModalVisible(true);
    } else {
      setEditingCampaign(null);
      campaignForm.resetFields();
      setIsCampaignModalVisible(true);
    }
  };

  const handleEdit = (record: Coupon) => {
    setEditingCoupon(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await couponService.deleteCoupon(id);
      message.success('Coupon deleted successfully');
      setPage(1);
      setCampaignPage(1);
      fetchCoupons(1, searchText);
    } catch (error) {
      message.error('Failed to delete coupon');
    }
  };

  const handleEditCampaign = (record: Campaign) => {
    setEditingCampaign(record);
    setIsCampaignModalVisible(true);
  };

  const handleDeleteCampaign = async (id: number) => {
    try {
      await campaignService.deleteCampaign(id);
      message.success('Campaign deleted successfully');
      setCampaignPage(1);
      fetchCampaigns(1, searchText);
    } catch (error) {
      message.error('Failed to delete campaign');
    }
  };

  const handleSendCampaign = (record: Campaign) => {
    setCampaignToSend(record);
    setIsSendCampaignModalVisible(true);
  };

  const handlePreviewCampaign = (record: Campaign) => {
    setPreviewCampaign(record);
    setIsPreviewModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id, values);
        message.success('Coupon updated successfully');
      } else {
        await couponService.createCoupon(values);
        message.success('Coupon created successfully');
      }
      setIsModalVisible(false);
      setPage(1);
      setCampaignPage(1);
      fetchCoupons(1, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleCampaignSubmit = async (values: any) => {
    try {
      if (editingCampaign) {
        await campaignService.updateCampaign(editingCampaign.id, values);
        message.success('Campaign updated successfully');
      } else {
        await campaignService.createCampaign(values);
        message.success('Campaign created successfully');
      }
      setIsCampaignModalVisible(false);
      setCampaignPage(1);
      fetchCampaigns(1, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save campaign');
    }
  };

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[{ title: 'Home' }, { title: 'Marketing' }, { title: 'Coupon & Campaigns' }]} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Coupon Management</h2>
        <Space>
          <Input
            placeholder={activeTab === 'coupons' ? "Search by code..." : "Search campaigns..."}
            prefix={<SearchOutlined />}
            onChange={(e) => debouncedSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {activeTab === 'coupons' ? 'Create Coupon' : 'Create Campaign'}
          </Button>
        </Space>
      </div>

      <Card
        bordered={false}
        className="shadow-sm"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px 24px' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ height: '100%' }}
          items={[
            {
              key: 'coupons',
              label: 'Coupon Codes',
              children: (
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <CouponTable
                    data={coupons}
                    loading={loading}
                    loadingMore={loadingMore}
                    hasMore={hasMore}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                    onLoadMore={handleLoadMore}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                  />
                </div>
              )
            },
            {
              key: 'campaigns',
              label: 'Marketing Campaigns',
              children: (
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <CampaignTable
                    data={campaigns}
                    loading={loadingCampaigns}
                    loadingMore={loadingMoreCampaigns}
                    hasMore={hasMoreCampaigns}
                    onEdit={handleEditCampaign}
                    onView={handleViewCampaign}
                    onDelete={handleDeleteCampaign}
                    onSend={handleSendCampaign}
                    onPreview={handlePreviewCampaign}
                    onLoadMore={handleLoadMoreCampaigns}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      <CouponFormModal
        visible={isModalVisible}
        editingCoupon={editingCoupon}
        form={form}
        onSubmit={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        tests={tests}
        packages={packages}
      />

      <CampaignFormModal
        visible={isCampaignModalVisible}
        editingCampaign={editingCampaign}
        form={campaignForm}
        coupons={coupons}
        onSubmit={handleCampaignSubmit}
        onCancel={() => setIsCampaignModalVisible(false)}
      />

      <SendCampaignModal
        visible={isSendCampaignModalVisible}
        campaign={campaignToSend}
        onClose={() => {
          setIsSendCampaignModalVisible(false);
          setCampaignToSend(null);
        }}
      />

      <CampaignPreviewModal
        open={isPreviewModalVisible}
        campaign={previewCampaign}
        onClose={() => {
          setIsPreviewModalVisible(false);
          setPreviewCampaign(null);
        }}
      />

      <Drawer
        title={`${drawerType === 'coupon' ? 'Coupon' : 'Campaign'} Details`}
        placement="right"
        width={500}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedRecord && (
          <div>
            {drawerType === 'coupon' ? (
              <>
                <Descriptions title="Basic Information" column={1} bordered>
                  <Descriptions.Item label="Code">
                    <strong style={{ color: '#1890ff' }}>{selectedRecord.code}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Discount">
                    {selectedRecord.discountType === 'percentage' 
                      ? `${selectedRecord.discountValue}%` 
                      : `₹${selectedRecord.discountValue}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={selectedRecord.status === 'active' ? 'success' : 'error'}>
                      {selectedRecord.status.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Applicability">
                    <Tag color="blue">{selectedRecord.applicableTo.toUpperCase()}</Tag>
                  </Descriptions.Item>
                </Descriptions>
                
                <Divider />
                
                <Descriptions title="Usage & Limits" column={1} bordered>
                  <Descriptions.Item label="Used Count">{selectedRecord.usedCount}</Descriptions.Item>
                  <Descriptions.Item label="Usage Limit">{selectedRecord.usageLimit || 'Unlimited'}</Descriptions.Item>
                  <Descriptions.Item label="Min Order Value">₹{selectedRecord.minOrderValue || 0}</Descriptions.Item>
                </Descriptions>

                <Divider />

                <Descriptions title="Validity" column={1} bordered>
                  <Descriptions.Item label="Start Date">
                    {dayjs(selectedRecord.startDate).format('DD MMMM YYYY, hh:mm A')}
                  </Descriptions.Item>
                  <Descriptions.Item label="End Date">
                    {dayjs(selectedRecord.endDate).format('DD MMMM YYYY, hh:mm A')}
                  </Descriptions.Item>
                </Descriptions>
              </>
            ) : (
              <>
                <Descriptions title="Campaign Information" column={1} bordered>
                  <Descriptions.Item label="Title"><strong>{selectedRecord.title}</strong></Descriptions.Item>
                  <Descriptions.Item label="Subtitle">{selectedRecord.subtitle || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Description">{selectedRecord.description || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={selectedRecord.isActive ? 'success' : 'error'}>
                      {selectedRecord.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Descriptions title="Visuals & Action" column={1} bordered>
                  <Descriptions.Item label="Banner Image">
                    {selectedRecord.bannerImage ? (
                      <Image src={selectedRecord.bannerImage} width="100%" style={{ borderRadius: '8px' }} />
                    ) : 'No Banner'}
                  </Descriptions.Item>
                  <Descriptions.Item label="CTA Text">{selectedRecord.ctaText || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Target URL">{selectedRecord.targetUrl || 'N/A'}</Descriptions.Item>
                </Descriptions>

                <Divider />

                <Descriptions title="Linked Promotion" column={1} bordered>
                  <Descriptions.Item label="Coupon Code">
                    {selectedRecord.coupon ? (
                      <Tag color="blue">{selectedRecord.coupon.code}</Tag>
                    ) : 'No Coupon Linked'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Validity Period">
                    {dayjs(selectedRecord.startDate).format('DD/MM/YY')} - {dayjs(selectedRecord.endDate).format('DD/MM/YY')}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Drawer>

      <style>{`
        .ant-tabs { height: 100%; display: flex; flex-direction: column; }
        .ant-tabs-content-holder { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .ant-tabs-content { height: 100%; }
        .ant-tabs-tabpane { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default CouponManager;



