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
    GlobalOutlined,
    MedicineBoxOutlined
} from '@ant-design/icons';

import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import colors from '@/styles/colors';
import '@/styles/layouts/AdminLayout.css';
import { useAuthStore } from '@/store/authStore';
import { ORDER_STATUSES } from '@/shared/constants/app.constants';
import { labOrderService } from '@/features/admin/labOrder/services/labOrderService';
import { collectionAgentService, type CollectionAgent } from '@/features/admin/collectionAgent/services/collectionAgentService';
import { formatName } from '@/shared/utils/nameUtils';

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
        } else if (['/patients', '/doctors', '/consultations'].includes(location.pathname)) {
            setOpenKeys(['/medical-network']);
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
                console.error('Failed to fetch sidebar stats', error);
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
        {
            key: '/medical-network',
            icon: <MedicineBoxOutlined />,
            label: 'Medical Network',
            children: [
                { key: '/patients', label: 'Patients Directory' },
                { key: '/doctors', label: 'Doctors Directory' },
                { key: '/anc-care', label: 'ANC Care' },
            ]
        },
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
                                    color: colors.info,
                                    background: `${colors.info}${colors.alpha.badgeBg}`,
                                    padding: '0 7px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    boxShadow: `0 0 10px ${colors.layout.adminGlow}`
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
                                    background: `${status.color}${colors.alpha.badgeBg}`,
                                    padding: '0 7px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    boxShadow: `0 0 10px ${status.color}${colors.alpha.badgeGlow}`
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
        { key: '/service-cities', icon: <GlobalOutlined />, label: 'Service Cities' },
    ];

    const userMenu = {
        items: [
            { 
                key: 'profile', 
                label: 'Profile Settings', 
                icon: <UserOutlined />,
                onClick: () => navigate('/profile')
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
                        background: themeToken.colorPrimary,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <ExperimentOutlined style={{ color: colors.white, fontSize: 18 }} />
                    </div>
                    {(!collapsed || isMobile) && <Text strong style={{ color: colors.white, fontSize: 18, whiteSpace: 'nowrap' }}>PathLab</Text>}
                </div>
                {isMobile && (
                    <Button 
                        type="text" 
                        icon={<MenuFoldOutlined style={{ color: colors.white }} />} 
                        onClick={() => setCollapsed(true)}
                    />
                )}
            </div>

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

            <div style={{
                padding: '16px',
                borderTop: `1px solid ${colors.sidebarBorder}`,
                flexShrink: 0,
                background: `${colors.sidebarBg}80`,
                backdropFilter: 'blur(8px)'
            }}>
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
                        padding: (collapsed && !isMobile) ? '4px 0' : '4px 8px',
                        background: `${colors.white}${colors.alpha.sidebarShadow}`,
                        borderRadius: '6px'
                    }}
                >
                    {(!collapsed || isMobile) && 'Sign Out'}
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
                        <Badge count={5} size="small" style={{ boxShadow: 'none' }}>
                            <Button type="text" icon={<BellOutlined style={{ fontSize: 18, color: '#64748b' }} />} />
                        </Badge>
                        <Divider type="vertical" style={{ height: 24 }} />
                        <Dropdown menu={userMenu} placement="bottomRight" arrow>
                            <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'all 0.2s' }} className="user-dropdown-trigger">
                                <Avatar
                                    src={user?.profile_image}
                                    icon={<UserOutlined />}
                                    style={{
                                        backgroundColor: themeToken.colorPrimary,
                                        verticalAlign: 'middle',
                                        boxShadow: '0 2px 8px rgba(0,74,173,0.15)'
                                    }}
                                />
                                {!isMobile && (
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                        <Text strong style={{ fontSize: 14 }}>{formatName(user?.name) || 'User'}</Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>{formatName(user?.role?.name) || 'Administrator'}</Text>
                                    </div>
                                )}
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                <Content style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: isMobile ? '16px' : '24px',
                    background: colors.background,
                }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
