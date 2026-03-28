import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Button, Space, Badge, Popover, List } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    MedicineBoxOutlined,
    BellOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import colors from '@/styles/colors';
import { useAuthStore } from '@/store/authStore';
import MeetingBanner from '@/shared/components/MeetingBanner';
import { appointmentService } from '@/features/doctor/appointments/services/appointmentService';
import { doctorService } from '@/features/admin/doctors/services/doctorService';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const DoctorLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch auth from store
    const { user, logout, isAuthenticated } = useAuthStore();
    const [stats, setStats] = useState({ total: 0, scheduled: 0, completed: 0, cancelled: 0 });
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

    useEffect(() => {
        const fetchBio = async () => {
            if (user?.doctorId) {
                try {
                    const res = await doctorService.getDoctorById(user.doctorId);
                    if (res?.success && res.data?.profile_image) {
                        setProfileImage(res.data.profile_image);
                    }
                } catch (err) {
                    console.error('Failed to load doctor profile image');
                }
            }
        };

        fetchBio();
    }, [user?.doctorId]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await appointmentService.getDoctorAppointments();
                if (res?.success) {
                    const data = res.data;
                    setStats({
                        total: data.length,
                        scheduled: data.filter((a: any) => a.status === 'scheduled').length,
                        completed: data.filter((a: any) => a.status === 'completed').length,
                        cancelled: data.filter((a: any) => a.status === 'cancelled').length,
                    });

                    // Filter upcoming for today and starting within 30 minutes
                    const parseTime = (timeStr: string) => {
                        try {
                            const [time, period] = timeStr.trim().split(' ');
                            let [hours, minutes] = time.split(':').map(Number);
                            if (period === 'PM' && hours < 12) hours += 12;
                            if (period === 'AM' && hours === 12) hours = 0;
                            const d = new Date();
                            d.setHours(hours, minutes, 0, 0);
                            return d.getTime();
                        } catch (e) { return 0; }
                    };

                    const today = new Date().toLocaleDateString();
                    const now = new Date().getTime();
                    const thirtyMinsFromNow = now + (30 * 60 * 1000);

                    const upcoming = data.filter((a: any) => {
                        if (a.status !== 'scheduled') return false;
                        if (new Date(a.appointment_date).toLocaleDateString() !== today) return false;
                        
                        const aptTime = parseTime(a.appointment_time);
                        return aptTime >= now && aptTime <= thirtyMinsFromNow;
                    }).sort((a: any, b: any) => parseTime(a.appointment_time) - parseTime(b.appointment_time));
                    
                    setUpcomingAppointments(upcoming);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };
        fetchStats();

        // 60-second polling to mimic backend cron job and refresh notifications
        const intervalId = setInterval(fetchStats, 60000);

        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        
        return () => {
            clearInterval(intervalId);
            window.removeEventListener('resize', handleResize);
        };
    }, [location.pathname]);

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

    const formatDoctorName = (name: string) => {
        if (!name) return 'Doctor';
        let cleanName = name.trim();
        if (/^dr\.?\s+/i.test(cleanName)) {
            cleanName = cleanName.replace(/^dr\.?\s+/i, '');
        }
        cleanName = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return `Dr. ${cleanName}`;
    };

    const currentPath = location.pathname + location.search;

    const renderBadge = (count: number, color: string, path: string) => {
        if (count === undefined || count === null) return null;
        const isSelected = currentPath === path;
        const finalColor = isSelected ? '#ffffff' : color;
        const finalBg = isSelected ? 'rgba(255, 255, 255, 0.2)' : `${color}1A`;
        const finalShadow = isSelected ? 'none' : `0 0 10px ${color}33`;

        return (
            <div style={{
                fontSize: '11px',
                fontWeight: '700',
                color: finalColor,
                background: finalBg,
                padding: '0 7px',
                height: '20px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: finalShadow
            }}>
                {count}
            </div>
        );
    };

    const renderLabel = (label: string, count: number, color: string, path: string) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '12px' }}>
            <span style={{ fontSize: '13px', opacity: 0.85 }}>{label}</span>
            {renderBadge(count, color, path)}
        </div>
    );

    const menuItems = [
        { key: '/doctor', icon: <DashboardOutlined />, label: 'Overview' },
        { 
            key: '/doctor/patients-parent', 
            icon: <UserOutlined />, 
            label: 'My Patients',
            children: [
                { key: '/doctor/patients', label: renderLabel('All Appointments', stats.total, colors.info, '/doctor/patients') },
                { key: '/doctor/patients?status=scheduled', label: renderLabel('Scheduled', stats.scheduled, colors.primary, '/doctor/patients?status=scheduled') },
                { key: '/doctor/patients?status=completed', label: renderLabel('Completed', stats.completed, colors.success, '/doctor/patients?status=completed') },
                { key: '/doctor/patients?status=cancelled', label: renderLabel('Cancelled', stats.cancelled, colors.danger, '/doctor/patients?status=cancelled') },
            ]
        },
    ];

    const userMenu = {
        items: [
            { 
                key: 'profile', 
                label: 'My Profile', 
                icon: <UserOutlined />,
                onClick: () => navigate('/doctor/profile')
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
                background: 'transparent',
                borderBottom: `1px solid ${colors.sidebarBorder}`,
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                    {(!collapsed || isMobile) && <Text strong style={{ color: colors.white, fontSize: 18, whiteSpace: 'nowrap' }}>Doctor Portal</Text>}
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
                    selectedKeys={[currentPath]}
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
                        boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
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

                    <Space size="middle" style={{ marginRight: isMobile ? 8 : 24 }}>
                        <Popover
                            placement="bottomRight"
                            title={<Text strong>Upcoming Consultations (Today)</Text>}
                            content={
                                <List
                                    size="small"
                                    dataSource={upcomingAppointments}
                                    style={{ width: isMobile ? '100vw' : 300, maxWidth: 300 }}
                                    renderItem={(item) => (
                                        <List.Item 
                                            style={{ cursor: 'pointer' }} 
                                            onClick={() => navigate(`/doctor/patients?status=scheduled`)}
                                        >
                                            <List.Item.Meta
                                                avatar={<Avatar icon={<UserOutlined />} src={item.patient?.profile_image} />}
                                                title={item.patient?.full_name}
                                                description={
                                                    <Space direction="vertical" size={0}>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            Time: <Text strong>{item.appointment_time}</Text>
                                                        </Text>
                                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                                            Status: <Badge status="processing" text="Upcoming" />
                                                        </Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                    locale={{ emptyText: 'No urgent meetings for today' }}
                                />
                            }
                            trigger="click"
                        >
                            <Badge count={upcomingAppointments.length} overflowCount={9} size="small" offset={[2, 2]}>
                                <Button 
                                    type="text" 
                                    icon={<BellOutlined style={{ fontSize: 20, color: colors.secondary }} />} 
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                />
                            </Badge>
                        </Popover>

                        <Dropdown menu={userMenu} placement="bottomRight" arrow>
                            <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '8px' }} className="user-dropdown-trigger">
                                {profileImage ? (
                                    <Avatar src={profileImage} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                ) : (
                                    <Avatar
                                        icon={<UserOutlined />}
                                        style={{ backgroundColor: '#1890ff', verticalAlign: 'middle', boxShadow: '0 2px 8px rgba(24,144,255,0.2)' }}
                                    />
                                )}
                                {!isMobile && (
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                        <Text strong>{formatDoctorName(user?.name || '')}</Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>Medical Practitioner</Text>
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

export default DoctorLayout;
