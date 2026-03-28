import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Button, Space } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    ExperimentOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import colors from '@/styles/colors';
import '@/styles/layouts/AgentLayout.css';
import { useAuthStore } from '@/store/authStore';
import { labOrderService } from '@/features/admin/labOrder/services/labOrderService';
import { formatName } from '@/shared/utils/nameUtils';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const AgentLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuthStore();
    const [orderStats, setOrderStats] = useState<any>(null);

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await labOrderService.getOrderStats();
                if (response.success) {
                    setOrderStats(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch agent order stats', error);
            }
        };

        if (isAuthenticated) {
            fetchStats();
        }
    }, [location.pathname, isAuthenticated]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role.name !== 'COLLECTION_AGENT') {
        return <Navigate to="/" replace />;
    }

    const menuItems = [
        { key: '/agent', icon: <DashboardOutlined />, label: 'My Dashboard' },
        {
            key: 'pickups-dropdown',
            icon: <ExperimentOutlined />,
            label: 'Pickups',
            children: [
                {
                    key: '/agent/pickups',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '12px' }}>
                            <span style={{ fontSize: '13px', opacity: 0.85 }}>All Pickups</span>
                            {orderStats?.totalOrders > 0 && (
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: colors.info,
                                    background: `${colors.info}${colors.alpha.badgeBg}`,
                                    padding: '0 7px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {orderStats.totalOrders}
                                </div>
                            )}
                        </div>
                    )
                },
                {
                    key: '/agent/pickups?status=pending',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '12px' }}>
                            <span style={{ fontSize: '13px', opacity: 0.85 }}>Pending</span>
                            {orderStats?.statusCounts?.pending > 0 && (
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: colors.status.pending,
                                    background: `${colors.status.pending}${colors.alpha.badgeBg}`,
                                    padding: '0 7px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {orderStats.statusCounts.pending}
                                </div>
                            )}
                        </div>
                    )
                },
                {
                    key: '/agent/pickups?status=collected',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '12px' }}>
                            <span style={{ fontSize: '13px', opacity: 0.85 }}>Collected</span>
                            {orderStats?.statusCounts?.collected > 0 && (
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: colors.status.collected,
                                    background: `${colors.status.collected}${colors.alpha.badgeBg}`,
                                    padding: '0 7px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {orderStats.statusCounts.collected}
                                </div>
                            )}
                        </div>
                    )
                },
            ]
        },
    ];

    const userMenu = {
        items: [
            { 
                key: 'profile', 
                label: 'My Profile', 
                icon: <UserOutlined />,
                onClick: () => navigate('/agent/profile')
            },
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: handleLogout
            },
        ],
    };

    const currentPath = location.pathname + location.search;
    const selectedKey = currentPath.includes('status=') ? currentPath : location.pathname;
    const isMobile = screenSize < 992;

    useEffect(() => {
        if (isMobile) setCollapsed(true);
    }, [location.pathname, isMobile]);

    const SidebarContent = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: colors.sidebarBg }}>
            <div style={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                background: `linear-gradient(90deg, ${colors.sidebarBg} 0%, ${colors.layout.agentSidebarEnd} 100%)`,
                borderBottom: `1px solid ${colors.sidebarBorder}`,
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        background: colors.success,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <UserOutlined style={{ color: colors.white, fontSize: 18 }} />
                    </div>
                    {(!collapsed || isMobile) && <Text strong style={{ color: colors.white, fontSize: 18, whiteSpace: 'nowrap' }}>Agent Portal</Text>}
                </div>
                {isMobile && (
                    <Button 
                        type="text" 
                        icon={<MenuFoldOutlined style={{ color: colors.white }} />} 
                        onClick={() => setCollapsed(true)}
                    />
                )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    defaultOpenKeys={location.pathname.includes('/agent/pickups') ? ['pickups-dropdown'] : []}
                    onClick={({ key }) => navigate(key)}
                    style={{ borderRight: 0, background: 'transparent' }}
                    items={menuItems}
                />
            </div>

            <div style={{ padding: '16px', borderTop: `1px solid ${colors.sidebarBorder}` }}>
                <Button
                    type="text"
                    danger
                    icon={<LogoutOutlined />}
                    block={!collapsed || isMobile}
                    onClick={handleLogout}
                    style={{ 
                        color: 'rgba(255,255,255,0.65)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
                        background: `${colors.white}${colors.alpha.sidebarShadow}`,
                        borderRadius: '6px'
                    }}
                >
                    {(!collapsed || isMobile) && 'Logout'}
                </Button>
            </div>
        </div>
    );

    return (
        <Layout style={{ minHeight: '100vh', background: colors.background }}>
            {isMobile ? (
                <div 
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        background: 'rgba(0,0,0,0.45)', 
                        zIndex: 1000,
                        visibility: !collapsed ? 'visible' : 'hidden',
                        opacity: !collapsed ? 1 : 0,
                        transition: 'all 0.3s'
                    }}
                    onClick={() => setCollapsed(true)}
                >
                    <div 
                        style={{ 
                            width: 260, 
                            height: '100%', 
                            transform: !collapsed ? 'translateX(0)' : 'translateX(-100%)',
                            transition: 'transform 0.3s ease',
                            boxShadow: '4px 0 16px rgba(0,0,0,0.2)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {SidebarContent}
                    </div>
                </div>
            ) : (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={260}
                    style={{
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        boxShadow: `2px 0 8px 0 ${colors.layout.agentSiderShadow}`,
                        zIndex: 100,
                        background: colors.sidebarBg
                    }}
                >
                    {SidebarContent}
                </Sider>
            )}

            <Layout style={{
                marginLeft: isMobile ? 0 : (collapsed ? 80 : 260),
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                width: isMobile ? '100%' : `calc(100% - ${collapsed ? 80 : 260}px)`,
                overflow: 'hidden'
            }}>
                <Header style={{
                    background: colors.white,
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 99,
                    boxShadow: `0 1px 4px ${colors.headerShadow}`,
                    flexShrink: 0
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '18px', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    />

                    <Space size="middle">
                        <Dropdown menu={userMenu} placement="bottomRight" arrow>
                            <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '8px' }} className="user-dropdown-trigger">
                                <Avatar
                                    icon={<UserOutlined />}
                                    style={{
                                        backgroundColor: colors.success,
                                        verticalAlign: 'middle',
                                        boxShadow: '0 2px 8px rgba(16,185,129,0.15)'
                                    }}
                                />
                                {!isMobile && (
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                        <Text strong>{formatName(user?.name)}</Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>Collection Agent</Text>
                                    </div>
                                )}
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                <Content style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: isMobile ? '16px' : '24px',
                    background: colors.background,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AgentLayout;
