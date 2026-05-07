import React, { useState } from 'react';
import { Badge, Button, List, Typography, Avatar, Empty } from 'antd';
import { BellOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import colors from '@/styles/colors';
import { useNotificationContext, type NotificationItem } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import SharedDetailDrawer from '@/shared/components/SharedDetailDrawer';

const { Text } = Typography;

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, clearNotifications, deleteNotification } = useNotificationContext();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircleOutlined style={{ color: colors.success }} />;
            case 'warning': return <WarningOutlined style={{ color: colors.warning }} />;
            default: return <InfoCircleOutlined style={{ color: colors.info }} />;
        }
    };

    const handleNotificationClick = (item: NotificationItem) => {
        // Navigate without marking as read — only the ✕ button marks as read
        if (item.data?.orderId) {
            navigate(`/lab-orders?highlight=${item.data.orderId}`);
            setOpen(false);
        } else if (item.data?.order_id) {
            navigate(`/lab-orders?highlight=${item.data.order_id}`);
            setOpen(false);
        } else if (item.description.includes('ORD-')) {
            const match = item.description.match(/ORD-[0-9a-zA-Z-]+/);
            if (match) {
                navigate(`/lab-orders?highlight=${match[0]}`);
                setOpen(false);
            }
        }
    };

    return (
        <>
            <Badge
                count={unreadCount}
                size="small"
                offset={[-4, 4]}
                style={{
                    boxShadow: '0 0 0 2px #fff',
                    backgroundColor: colors.danger,
                    fontSize: '10px'
                }}
            >
                <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: 22, color: '#64748b' }} />}
                    style={{
                        width: 42,
                        height: 42,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        background: 'transparent'
                    }}
                    onClick={() => setOpen(true)}
                />
            </Badge>

            <SharedDetailDrawer
                title="Notifications"
                subtitle={`You have ${unreadCount} unread messages`}
                open={open}
                onClose={() => setOpen(false)}
                width={420}
                headerGradient={`linear-gradient(135deg, ${colors.primary} 0%, ${colors.layout.agentSidebarEnd} 100%)`}
                headerStats={
                    notifications.length > 0 ? (
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={clearNotifications}
                            style={{
                                color: '#fff',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                fontWeight: 500,
                                fontSize: '12px'
                            }}
                        >
                            Clear All Notifications
                        </Button>
                    ) : null
                }
            >
                <List
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item
                            onClick={() => handleNotificationClick(item)}
                            style={{
                                padding: '16px 12px',
                                cursor: 'pointer',
                                borderRadius: '12px',
                                marginBottom: '8px',
                                transition: 'all 0.2s',
                                border: 'none',
                                background: item.read ? 'transparent' : `${colors.primary}08`,
                                position: 'relative',
                                display: 'block'
                            }}
                            className="notification-item-hover"
                        >
                            <div style={{ display: 'flex', gap: 12 }}>
                                <Avatar
                                    icon={getIcon(item.type)}
                                    style={{
                                        backgroundColor: `${item.type === 'success' ? colors.success : item.type === 'warning' ? colors.warning : colors.info}15`,
                                        width: 40,
                                        height: 40,
                                        minWidth: 40,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Text strong style={{ fontSize: 14, color: colors.textDark }}>{item.title}</Text>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<CloseOutlined style={{ fontSize: 10 }} />}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                minWidth: 20,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '4px',
                                                color: colors.textSecondary,
                                                opacity: 0.6
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(item.id);
                                                deleteNotification(item.id);
                                            }}
                                        />
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2, lineHeight: '1.5' }}>
                                        {item.description}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6, opacity: 0.6 }}>
                                        {item.time}
                                    </Text>
                                </div>
                            </div>
                        </List.Item>
                    )}
                    locale={{
                        emptyText: (
                            <Empty
                                description={
                                    <div style={{ marginTop: 12 }}>
                                        <Text strong style={{ color: colors.textSecondary }}>All caught up!</Text>
                                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>You have no new notifications.</Text>
                                    </div>
                                }
                                style={{ marginTop: 60 }}
                            />
                        )
                    }}
                />
            </SharedDetailDrawer>

            <style>{`
                .notification-item-hover:hover {
                    background: ${colors.ui.bgLight} !important;
                    transform: translateX(-4px);
                }
            `}</style>
        </>
    );
};

export default NotificationBell;
