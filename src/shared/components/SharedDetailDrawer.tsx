import React, { type ReactNode } from 'react';
import { Drawer, Typography, Space, Button, Spin, Divider } from 'antd';
import { ArrowRightOutlined, LoadingOutlined } from '@ant-design/icons';
import { colors } from '@/styles/colors';

const { Title, Text } = Typography;

interface SharedDetailDrawerProps {
    open: boolean;
    onClose: () => void;
    title: string | ReactNode;
    subtitle?: string;
    loading?: boolean;
    headerGradient?: string; // e.g. 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
    headerStats?: ReactNode; // A row of stats or tags for the header area
    footer?: ReactNode;
    width?: number | string;
    children: ReactNode;
}

const SharedDetailDrawer: React.FC<SharedDetailDrawerProps> = ({
    open,
    onClose,
    title,
    subtitle,
    loading = false,
    headerGradient = 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    headerStats,
    footer,
    width = 550,
    children
}) => {
    const isMobile = window.innerWidth < 768;

    return (
        <Drawer
            title={null}
            placement="right"
            onClose={onClose}
            open={open}
            width={isMobile ? '100%' : width}
            styles={{ body: { padding: 0, backgroundColor: colors.ui.bgLight } }}
            closable={false}
        >
            {/* Standardized Premium Header */}
            <div style={{ 
                padding: '24px', 
                background: headerGradient,
                color: '#fff',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Space direction="vertical" size={0}>
                        <Title level={4} style={{ color: '#fff', margin: 0 }}>{title}</Title>
                        {subtitle && <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>{subtitle}</Text>}
                    </Space>
                    <Button 
                        shape="circle" 
                        icon={<ArrowRightOutlined />} 
                        onClick={onClose}
                        style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                    />
                </div>

                {headerStats && (
                    <div style={{ marginTop: '20px' }}>
                        {headerStats}
                    </div>
                )}
            </div>

            {/* Standardized Content Container */}
            <div style={{ padding: '24px', position: 'relative', minHeight: '300px' }}>
                {loading ? (
                    <div style={{ 
                        position: 'absolute', 
                        top: 0, left: 0, right: 0, bottom: 0, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 10,
                        backgroundColor: 'rgba(248, 250, 252, 0.7)'
                    }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                    </div>
                ) : null}

                {children}

                {footer && (
                    <>
                        <Divider style={{ margin: '24px 0' }} />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            {footer}
                        </div>
                    </>
                )}
            </div>
        </Drawer>
    );
};

export default SharedDetailDrawer;
