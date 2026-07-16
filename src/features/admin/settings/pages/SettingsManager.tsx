import React, { useState } from 'react';
import { Card, Breadcrumb, Tabs, Space, Badge } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import CategoryBannersTab from '../components/CategoryBannersTab';
import HeroBannersTab from '../components/HeroBannersTab';

const SettingsManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState('category_banners');
    const [activeHeroCount, setActiveHeroCount] = useState(0);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ marginBottom: 16 }}>
                <Breadcrumb items={[
                    { title: 'Home' },
                    { title: 'Settings' },
                ]} />
            </div>

            <Card
                bordered={false}
                className="shadow-sm"
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                styles={{
                    body: {
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        padding: '12px 24px',
                    },
                }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ height: '100%' }}
                    items={[
                        {
                            key: 'category_banners',
                            label: 'Category Banners',
                            children: <CategoryBannersTab />,
                        },
                        {
                            key: 'hero_banners',
                            label: (
                                <Space size={4}>
                                    <PictureOutlined />
                                    Hero Banners
                                    {activeHeroCount > 0 && (
                                        <Badge
                                            count={activeHeroCount}
                                            size="small"
                                            style={{ backgroundColor: '#4361ee' }}
                                        />
                                    )}
                                </Space>
                            ),
                            children: <HeroBannersTab onActiveCountChange={setActiveHeroCount} />,
                        },
                    ]}
                />
            </Card>

            <style>{`
                .ant-tabs { height: 100%; display: flex; flex-direction: column; }
                .ant-tabs-content-holder { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .ant-tabs-content { height: 100%; }
                .ant-tabs-tabpane { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
            `}</style>
        </div>
    );
};

export default SettingsManager;
