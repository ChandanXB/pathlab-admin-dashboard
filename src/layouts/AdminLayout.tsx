import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Badge, Dropdown, Divider, theme, Button, Space } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    ExperimentOutlined,
    BellOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
} from '@ant-design/icons';

import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import colors from '@/styles/colors';
import { useAuthStore } from '@/store/authStore';
import { ORDER_STATUSES } from '@/shared/constants/app.constants';
import { labOrderService } from '@/features/admin/labOrder/services/labOrderService';
import { collectionAgentService, type CollectionAgent } from '@/features/admin/collectionAgent/services/collectionAgentService';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const navigate = useNavigate();
    const location = useLocation();
    const { token: themeToken } = theme.useToken();
    const { user, logout } = useAuthStore();

    const [orderStats, setOrderStats] = useState<any>(null);
    const [agents, setAgents] = useState<CollectionAgent[]>([]);
    const [openKeys, setOpenKeys] = useState<string[]>([]);

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Auto-open submenu based on current path
        if (location.pathname.startsWith('/lab-orders')) {
            setOpenKeys(['/lab-orders-parent']);
        } else if (location.pathname.startsWith('/collection-agents')) {
            setOpenKeys(['/collection-agents-parent']);
        }
    }, [location.pathname]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await labOrderService.getOrderStats();
                if (response.success) {
                    setOrderStats(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch order stats', error);
            }
        };

        const fetchAgents = async () => {
            try {
                const response = await collectionAgentService.getAgents();
                if (response.success) {
                    setAgents(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch agents', error);
            }
        };

        fetchStats();
        fetchAgents();
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/patients', icon: <UserOutlined />, label: 'Patients' },
        { key: '/doctors', icon: <UserOutlined />, label: 'Doctors' },
        {
            key: '/lab-orders-parent',
            icon: <ExperimentOutlined />,
            label: 'Lab Orders',
            children: [
                {
                    key: '/lab-orders',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '12px' }}>
                            <span style={{ fontSize: '13px', opacity: 0.85 }}>All Orders</span>
                            {orderStats?.totalOrders > 0 && (
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#1890ff',
                                    background: 'rgba(24, 144, 255, 0.15)',
                                    padding: '0 7px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    boxShadow: '0 0 10px rgba(24, 144, 255, 0.1)'
                                }}>
                                    {orderStats.totalOrders}
                                </div>
                            )}
                        </div>
                    )
                },
                ...ORDER_STATUSES.map((status: any) => ({
                    key: `/lab-orders?status=${status.value}`,
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '12px' }}>
                            <span style={{ fontSize: '13px', opacity: 0.85 }}>{status.label}</span>
                            {orderStats?.statusCounts?.[status.value] > 0 && (
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: status.color,
                                    background: `${status.color}15`, // Translucent background
                                    padding: '0 7px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    boxShadow: `0 0 10px ${status.color}20` // Subtle glow matching image 4
                                }}>
                                    {orderStats.statusCounts[status.value]}
                                </div>
                            )}
                        </div>
                    ),
                }))
            ]
        },
        {
            key: '/collection-agents-parent',
            icon: <UserOutlined />,
            label: 'Collection Agents',
            children: [
                { key: '/collection-agents', label: 'All Agents' },
                ...agents.map(agent => ({
                    key: `/collection-agents/${agent.id}`,
                    label: agent.name
                }))
            ]
        },
        { key: '/tests-packages', icon: <ExperimentOutlined />, label: 'Tests & Packages' },
    ];

    const userMenu = {
        items: [
            { key: 'profile', label: 'Profile Settings', icon: <UserOutlined /> },
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
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
                    zIndex: 100,
                    background: colors.sidebarBg
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Logo Section */}
                    <div style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 24px',
                        gap: '12px',
                        background: `linear-gradient(90deg, ${colors.sidebarBg} 0%, #002140 100%)`,
                        borderBottom: `1px solid ${colors.sidebarBorder}`,
                        flexShrink: 0
                    }}>
                        <div style={{
                            width: 32,
                            height: 32,
                            background: themeToken.colorPrimary,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <ExperimentOutlined style={{ color: colors.white, fontSize: 18 }} />
                        </div>
                        {!collapsed && <Text strong style={{ color: colors.white, fontSize: 18, whiteSpace: 'nowrap' }}>PathLab</Text>}
                    </div>

                    {/* Menu Section - Scrollable */}
                    <div
                        className="sidebar-menu-container"
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            padding: '16px 0'
                        }}
                    >
                        <Menu
                            theme="dark"
                            mode="inline"
                            selectedKeys={[currentPath]}
                            openKeys={openKeys}
                            onOpenChange={(keys) => {
                                const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
                                if (latestOpenKey) {
                                    setOpenKeys([latestOpenKey]);
                                } else {
                                    setOpenKeys([]);
                                }
                            }}
                            onClick={({ key }) => navigate(key)}
                            style={{ borderRight: 0, background: 'transparent' }}
                            items={menuItems}
                        />
                    </div>

                    {/* Bottom Section - Fixed */}
                    <div style={{
                        padding: '16px',
                        borderTop: `1px solid ${colors.sidebarBorder}`,
                        flexShrink: 0,
                        background: 'rgba(0, 21, 41, 0.5)',
                        backdropFilter: 'blur(8px)'
                    }}>

                        <Button
                            type="text"
                            danger
                            icon={<LogoutOutlined />}
                            block={!collapsed}
                            onClick={handleLogout}
                            style={{
                                color: 'rgba(255,255,255,0.65)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                padding: collapsed ? '4px 0' : '4px 8px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '6px'
                            }}
                        >
                            {!collapsed && 'Sign Out'}
                        </Button>
                    </div>
                </div>
            </Sider>

            <Layout style={{
                marginLeft: screenSize < 768 ? 0 : (collapsed ? 80 : 260),
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
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
                        <Badge count={5} size="small">
                            <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
                        </Badge>
                        {screenSize >= 768 && <Divider type="vertical" />}
                        <Dropdown menu={userMenu} placement="bottomRight">
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar
                                    icon={<UserOutlined />}
                                    style={{
                                        backgroundColor: themeToken.colorPrimary,
                                        verticalAlign: 'middle'
                                    }}
                                />
                                {screenSize >= 768 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                        <Text strong>{user?.name || 'User'}</Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>{user?.role?.name || 'Administrator'}</Text>
                                    </div>
                                )}
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                <Content style={{
                    flex: 1,
                    overflow: 'hidden',
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

            <style>{`
                .sidebar-menu-container::-webkit-scrollbar {
                    width: 4px;
                }
                .sidebar-menu-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-menu-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .sidebar-menu-container:hover::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                }
                .ant-table-thead > tr > th {
                    background: transparent !important;
                    font-weight: 600 !important;
                }
            `}</style>
        </Layout>
    );
};

export default AdminLayout;
