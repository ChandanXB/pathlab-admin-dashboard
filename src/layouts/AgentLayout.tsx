import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Button, Space } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    ExperimentOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    IdcardOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import colors from '@/styles/colors';
import '@/styles/layouts/AgentLayout.css';
import { useAuthStore } from '@/store/authStore';
import { labOrderService } from '@/features/admin/labOrder/services/labOrderService';

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
        { key: '/agent/profile', icon: <IdcardOutlined />, label: 'My Profile' },
    ];

    const userMenu = {
        items: [
            { key: 'profile', label: 'My Profile', icon: <UserOutlined /> },
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

    return (
        <Layout style={{ minHeight: '100vh', background: colors.background }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                collapsedWidth={screenSize < 768 ? 0 : 80}
                width={260}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    boxShadow: `2px 0 8px 0 ${colors.layout.agentSiderShadow}`,
                    zIndex: 100,
                }}
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    gap: '12px',
                    background: `linear-gradient(90deg, ${colors.sidebarBg} 0%, ${colors.layout.agentSidebarEnd} 100%)`,
                    borderBottom: `1px solid ${colors.sidebarBorder}`
                }}>
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
                    {!collapsed && <Text strong style={{ color: colors.white, fontSize: 18, whiteSpace: 'nowrap' }}>Agent Portal</Text>}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    defaultOpenKeys={location.pathname.includes('/agent/pickups') ? ['pickups-dropdown'] : []}
                    onClick={({ key }) => navigate(key)}
                    style={{ borderRight: 0, marginTop: 16 }}
                    items={menuItems}
                />

                <div style={{ position: 'absolute', bottom: 20, width: '100%', padding: '0 16px' }}>
                    <Button
                        type="text"
                        danger
                        icon={<LogoutOutlined />}
                        block={!collapsed}
                        onClick={handleLogout}
                        style={{ color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}
                    >
                        {!collapsed && 'Logout'}
                    </Button>
                </div>
            </Sider>

            <Layout style={{
                marginLeft: screenSize < 768 ? 0 : (collapsed ? 80 : 260),
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                width: screenSize < 768 ? '100%' : `calc(100% - ${collapsed ? 80 : 260}px)`,
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
                        style={{ fontSize: '16px', width: 48, height: 48 }}
                    />

                    <Space size="small">
                        <Dropdown menu={userMenu} placement="bottomRight">
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar
                                    icon={<UserOutlined />}
                                    style={{
                                        backgroundColor: colors.success,
                                        verticalAlign: 'middle'
                                    }}
                                />
                                {screenSize >= 768 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                        <Text strong>{user?.name}</Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Collection Agent</Text>
                                    </div>
                                )}
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                <Content style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: screenSize < 768 ? '16px 12px' : '24px',
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
