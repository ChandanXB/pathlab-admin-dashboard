import React, { useState, useEffect, useMemo } from 'react';
import { Button, Input, Tag, Space, Drawer, Descriptions, Divider, Image, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { campaignService } from '@/features/admin/coupons/services/campaignService';
import type { Campaign } from '@/features/admin/coupons/types/campaign.types';
import HeroBannerTable from '@/features/admin/coupons/components/HeroBannerTable';
import HeroBannerFormModal from '@/features/admin/coupons/components/HeroBannerFormModal';
import { splitBannerImages } from '@/features/admin/coupons/utils/bannerUtils';
import { debounce } from '@/shared/utils/debounce';
import dayjs from 'dayjs';

const HERO_DISPLAY_TYPES = 'hero_carousel,hero_banner,event_banner';

interface HeroBannersTabProps {
    onActiveCountChange?: (count: number) => void;
}

const HeroBannersTab: React.FC<HeroBannersTabProps> = ({ onActiveCountChange }) => {
    // ===== HERO BANNER STATES =====
    const [heroBanners, setHeroBanners] = useState<Campaign[]>([]);
    const [loadingHeroBanners, setLoadingHeroBanners] = useState(false);
    const [loadingMoreHeroBanners, setLoadingMoreHeroBanners] = useState(false);
    const [heroBannerPage, setHeroBannerPage] = useState(1);
    const [hasMoreHeroBanners, setHasMoreHeroBanners] = useState(true);
    const [isHeroBannerModalVisible, setIsHeroBannerModalVisible] = useState(false);
    const [editingHeroBanner, setEditingHeroBanner] = useState<Campaign | null>(null);
    const [submittingHeroBanner, setSubmittingHeroBanner] = useState(false);
    const [heroBannerForm] = Form.useForm();
    const [heroBannerSearch, setHeroBannerSearch] = useState('');

    // Hero Banner Drawer
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Campaign | null>(null);

    const fetchHeroBanners = async (currentPage: number, search: string, isLoadMore: boolean = false) => {
        if (isLoadMore) {
            setLoadingMoreHeroBanners(true);
        } else {
            setLoadingHeroBanners(true);
        }

        try {
            const response = await campaignService.getAllCampaigns({
                search: search,
                page: currentPage,
                limit: 15,
                displayType: HERO_DISPLAY_TYPES,
            } as any);

            const newBanners = response.data || [];
            const total = response.meta?.total || 0;

            let updatedBanners: Campaign[] = [];
            if (isLoadMore) {
                updatedBanners = [...heroBanners, ...newBanners];
                setHeroBanners(updatedBanners);
            } else {
                updatedBanners = newBanners;
                setHeroBanners(updatedBanners);
            }

            setHasMoreHeroBanners(updatedBanners.length < total);

            // Report active count to parent tab badge if callback provided
            if (onActiveCountChange) {
                const activeCount = updatedBanners.filter(b => b.isActive).length;
                onActiveCountChange(activeCount);
            }
        } catch (error) {
            message.error('Failed to fetch hero banners');
        } finally {
            setLoadingHeroBanners(false);
            setLoadingMoreHeroBanners(false);
        }
    };

    useEffect(() => {
        setHeroBannerPage(1);
        fetchHeroBanners(1, heroBannerSearch);
    }, [heroBannerSearch]);

    const handleLoadMoreHeroBanners = () => {
        if (!loadingMoreHeroBanners && hasMoreHeroBanners) {
            const nextPage = heroBannerPage + 1;
            setHeroBannerPage(nextPage);
            fetchHeroBanners(nextPage, heroBannerSearch, true);
        }
    };

    const debouncedHeroBannerSearch = useMemo(
        () => debounce((value: string) => {
            setHeroBannerSearch(value);
            setHeroBannerPage(1);
        }, 500),
        []
    );

    const handleAddHeroBanner = () => {
        setEditingHeroBanner(null);
        heroBannerForm.resetFields();
        setIsHeroBannerModalVisible(true);
    };

    const handleEditHeroBanner = (record: Campaign) => {
        setEditingHeroBanner(record);
        setIsHeroBannerModalVisible(true);
    };

    const handleDeleteHeroBanner = async (id: number) => {
        try {
            await campaignService.deleteCampaign(id);
            message.success('Hero banner deleted successfully');
            setHeroBannerPage(1);
            fetchHeroBanners(1, heroBannerSearch);
        } catch (error) {
            message.error('Failed to delete hero banner');
        }
    };

    const handleViewHeroBanner = (record: Campaign) => {
        setSelectedBanner(record);
        setIsDrawerVisible(true);
    };

    const handleHeroBannerSubmit = async (values: any) => {
        setSubmittingHeroBanner(true);
        try {
            if (editingHeroBanner) {
                await campaignService.updateCampaign(editingHeroBanner.id, values);
                message.success('Hero banner updated successfully');
            } else {
                await campaignService.createCampaign(values);
                message.success('Hero banner created successfully');
            }
            setIsHeroBannerModalVisible(false);
            setHeroBannerPage(1);
            fetchHeroBanners(1, heroBannerSearch);
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to save hero banner');
        } finally {
            setSubmittingHeroBanner(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header controls inside the component to keep things clean */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                {/* Info banner about hero types */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
                        border: '1px solid #c7d7fd',
                        borderRadius: 8,
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                        flex: 1,
                        marginRight: '16px'
                    }}
                >
                    <span style={{ fontSize: 12, color: '#4361ee', fontWeight: 600 }}>Banner Types:</span>
                    <Tag color="blue">🎠 Carousel — Rotating hero slides</Tag>
                    <Tag color="purple">🖼️ Hero Banner — Full-width static banner</Tag>
                    <Tag color="orange">🎟️ Event Banner — Promotional strip below hero</Tag>
                </div>

                <Space>
                    <Input
                        placeholder="Search banners..."
                        prefix={<SearchOutlined />}
                        onChange={(e) => debouncedHeroBannerSearch(e.target.value)}
                        style={{ width: 200 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddHeroBanner}>
                        Add Hero Banner
                    </Button>
                </Space>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <HeroBannerTable
                    data={heroBanners}
                    loading={loadingHeroBanners}
                    loadingMore={loadingMoreHeroBanners}
                    hasMore={hasMoreHeroBanners}
                    onEdit={handleEditHeroBanner}
                    onView={handleViewHeroBanner}
                    onDelete={handleDeleteHeroBanner}
                    onLoadMore={handleLoadMoreHeroBanners}
                    scroll={{ y: 'calc(100vh - 390px)' }}
                />
            </div>

            {/* Hero Banner Form Modal */}
            <HeroBannerFormModal
                visible={isHeroBannerModalVisible}
                editingBanner={editingHeroBanner}
                form={heroBannerForm}
                onSubmit={handleHeroBannerSubmit}
                onCancel={() => setIsHeroBannerModalVisible(false)}
                confirmLoading={submittingHeroBanner}
            />

            {/* Hero Banner Details Drawer */}
            <Drawer
                title="Hero Banner Details"
                placement="right"
                width={500}
                onClose={() => setIsDrawerVisible(false)}
                open={isDrawerVisible}
            >
                {selectedBanner && (
                    <div>
                        <Descriptions title="Banner Information" column={1} bordered>
                            <Descriptions.Item label="Title"><strong>{selectedBanner.title}</strong></Descriptions.Item>
                            <Descriptions.Item label="Subtitle">{selectedBanner.subtitle || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Description">{selectedBanner.description || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Type">
                                <Tag color="blue">{selectedBanner.displayType?.replace('_', ' ').toUpperCase()}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Sort Order">#{selectedBanner.sortOrder ?? 0}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={selectedBanner.isActive ? 'success' : 'error'}>
                                    {selectedBanner.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions title="Visuals & Action" column={1} bordered>
                            <Descriptions.Item label="Banner Image">
                                {selectedBanner.bannerImage ? (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {splitBannerImages(selectedBanner.bannerImage).map((img, idx) => (
                                            <Image
                                                key={idx}
                                                src={img}
                                                width={120}
                                                height={72}
                                                style={{ objectFit: 'cover', borderRadius: '4px', border: '1px solid #f0f0f0' }}
                                            />
                                        ))}
                                    </div>
                                ) : 'No Banner'}
                            </Descriptions.Item>
                            <Descriptions.Item label="CTA Text">{selectedBanner.ctaText || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Target URL">{selectedBanner.targetUrl || 'N/A'}</Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions title="Validity" column={1} bordered>
                            <Descriptions.Item label="Period">
                                {dayjs(selectedBanner.startDate).format('DD/MM/YY')} - {dayjs(selectedBanner.endDate).format('DD/MM/YY')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

// Form.useForm() is used inside, but Form is needed from 'antd'
import { Form } from 'antd';

export default HeroBannersTab;
