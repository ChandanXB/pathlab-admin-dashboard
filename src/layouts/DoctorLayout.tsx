import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Button, Space } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    MedicineBoxOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import colors from '@/styles/colors';
import { useAuthStore } from '@/store/authStore';
import MeetingBanner from '@/shared/components/MeetingBanner';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const DoctorLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch auth from store
    const { user, logout, isAuthenticated } = useAuthStore();

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Checking for DOCTOR role
    if (user?.role.name !== 'DOCTOR') {
        return <Navigate to="/" replace />;
    }

    const menuItems = [
        { key: '/doctor', icon: <DashboardOutlined />, label: 'Overview' },
        { key: '/doctor/patients', icon: <UserOutlined />, label: 'My Patients' },
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

    const currentPath = location.pathname;

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
                    boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
                    zIndex: 100,
                }}
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    gap: '12px',
                    background: `linear-gradient(90deg, #135200 0%, #002140 100%)`,
                    borderBottom: `1px solid ${colors.sidebarBorder}`
                }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        background: '#1890ff',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <MedicineBoxOutlined style={{ color: colors.white, fontSize: 18 }} />
                    </div>
                    {!collapsed && <Text strong style={{ color: colors.white, fontSize: 18, whiteSpace: 'nowrap' }}>Doctor Portal</Text>}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[currentPath]}
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
                                        backgroundColor: '#1890ff',
                                        verticalAlign: 'middle'
                                    }}
                                />
                                {screenSize >= 768 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                        <Text strong>{user?.name}</Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Medical Practitioner</Text>
                                    </div>
                                )}
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                <MeetingBanner />

                <Content style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
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

export default DoctorLayout;
