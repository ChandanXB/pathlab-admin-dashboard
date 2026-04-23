import React from 'react';
import { Badge, Button, Dropdown, List, Typography, Avatar, Empty } from 'antd';
import { BellOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import colors from '@/styles/colors';
import { useNotificationContext } from '@/contexts/NotificationContext';

const { Text } = Typography;

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, clearNotifications, deleteNotification } = useNotificationContext();

    // Only show unread notifications in the bell dropdown
    const unreadNotifications = notifications.filter(n => !n.read);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircleOutlined style={{ color: colors.success }} />;
            case 'warning': return <WarningOutlined style={{ color: colors.warning }} />;
            default: return <InfoCircleOutlined style={{ color: colors.info }} />;
        }
    };

    const notificationMenu = (
        <div style={{
            width: 340,
            backgroundColor: colors.white,
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            border: `1px solid ${colors.ui.border}`
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${colors.ui.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: colors.ui.bgLight
            }}>
                <Text strong style={{ fontSize: 16 }}>Notifications</Text>
                {unreadNotifications.length > 0 && (
                    <Button
                        type="link"
                        size="small"
                        icon={<DeleteOutlined />}
                        style={{ fontSize: 12, padding: 0, color: colors.danger }}
                        onClick={clearNotifications}
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {/* Notification List - Only Unread */}
            <List
                style={{ maxHeight: 420, overflowY: 'auto', padding: '8px' }}
                dataSource={unreadNotifications}
                renderItem={(item) => (
                    <List.Item
                        style={{
                            padding: '12px 12px',
                            cursor: 'default',
                            borderRadius: '12px',
                            marginBottom: '4px',
                            transition: 'background 0.2s',
                            border: 'none',
                            background: `${colors.primary}08`
                        }}
                        className="notification-item"
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    icon={getIcon(item.type)}
                                    style={{
                                        backgroundColor: `${item.type === 'success' ? colors.success : item.type === 'warning' ? colors.warning : colors.info}15`,
                                        width: 36,
                                        height: 36,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                />
                            }
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong style={{ fontSize: 13, color: colors.textDark }}>{item.title}</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {/* Cross to dismiss */}
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<CloseOutlined style={{ fontSize: 10 }} />}
                                            style={{
                                                width: 22,
                                                height: 22,
                                                minWidth: 22,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '5px',
                                                background: `${colors.danger}15`,
                                                color: colors.danger,
                                                flexShrink: 0
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Mark as read so it disappears from the unread filter
                                                markAsRead(item.id);
                                                // Also remove from list entirely
                                                deleteNotification(item.id);
                                            }}
                                            title="Dismiss"
                                        />
                                    </div>
                                </div>
                            }
                            description={
                                <div style={{ marginTop: 2 }}>
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', lineHeight: '1.4' }}>
                                        {item.description}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block', opacity: 0.7 }}>
                                        {item.time}
                                    </Text>
                                </div>
                            }
                        />
                    </List.Item>
                )}
                locale={{ emptyText: <Empty description="You're all caught up! 🎉" style={{ padding: '32px 0' }} /> }}
            />

        </div>
    );

    return (
        <Dropdown dropdownRender={() => notificationMenu} trigger={['click']} placement="bottomRight" arrow>
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
                    icon={<BellOutlined style={{ fontSize: 20, color: '#64748b' }} />}
                    style={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        background: 'transparent'
                    }}
                />
            </Badge>
        </Dropdown>
    );
};

export default NotificationBell;
