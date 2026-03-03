import React, { useMemo } from 'react';
import { Card, Space, Typography, Progress, Row, Col, Tooltip, Segmented } from 'antd';
import {
    PieChartOutlined,
    BarChartOutlined,
    RiseOutlined,
    ClockCircleOutlined,
    ExperimentOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import colors from '@/styles/colors';
import '@/styles/features/dashboard.css';

const { Text } = Typography;

interface AdminChartsProps {
    statusCounts: Record<string, number>;
    recentOrders: any[];
    isError?: boolean;
}

// ─── 1. Order Status Distribution (Donut style) ─────────────────────────────
export const OrderStatusDistribution: React.FC<AdminChartsProps> = ({ statusCounts }) => {
    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

    const statuses = [
        { key: 'completed', label: 'Completed', color: colors.status.completed },
        { key: 'processing', label: 'Processing', color: colors.status.processing },
        { key: 'collected', label: 'Collected', color: colors.status.collected },
        { key: 'assigned', label: 'Assigned', color: colors.status.assigned },
        { key: 'pending', label: 'Pending', color: colors.status.pending },
        { key: 'cancelled', label: 'Cancelled', color: colors.status.cancelled },
    ];

    return (
        <Card
            title={<Space><PieChartOutlined style={{ color: colors.status.processing }} /> Order Distribution</Space>}
            bordered={false}
            style={{ borderRadius: 16, height: '100%', boxShadow: `0 4px 12px ${colors.cardShadow}` }}
        >
            <Row gutter={16} align="middle">
                <Col span={12} style={{ textAlign: 'center' }}>
                    <Progress
                        type="dashboard"
                        percent={Math.round(((statusCounts.completed || 0) / total) * 100)}
                        strokeColor={colors.status.completed}
                        size={140}
                        format={(pct) => (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 700 }}>{pct}%</div>
                                <div style={{ fontSize: 11, color: colors.charts.text }}>Success Rate</div>
                            </div>
                        )}
                    />
                </Col>
                <Col span={12}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {statuses.map(s => (
                            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Space size={8}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                                    <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
                                </Space>
                                <Text strong style={{ fontSize: 12 }}>{statusCounts[s.key] || 0}</Text>
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

// ─── 2. Weekly Order Trend (Bar Chart) ──────────────────────────────────────
export const WeeklyOrderTrend: React.FC<AdminChartsProps> = ({ recentOrders }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const weeklyData = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        const last7Days = Array.from({ length: 7 }, (_, i) => dayjs().subtract(i, 'day'));

        recentOrders.forEach(order => {
            const orderDate = dayjs(order.createdAt);
            const index = last7Days.findIndex(d => d.isSame(orderDate, 'day'));
            if (index !== -1) {
                counts[6 - index]++;
            }
        });

        const sortedDays = last7Days.reverse().map(d => days[d.day()]);
        return { counts, labels: sortedDays };
    }, [recentOrders]);

    const maxCount = Math.max(...weeklyData.counts, 1);

    return (
        <Card
            title={<Space><BarChartOutlined style={{ color: colors.info }} /> Weekly Volume</Space>}
            bordered={false}
            style={{ borderRadius: 16, height: '100%', boxShadow: `0 4px 12px ${colors.cardShadow}` }}
        >
            <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: '8%', padding: '10px 0 20px' }}>
                {weeklyData.counts.map((count, i) => {
                    const heightPct = Math.max((count / maxCount) * 100, 5);
                    return (
                        <Tooltip key={i} title={`${weeklyData.labels[i]}: ${count} Orders`}>
                            <div style={{
                                flex: 1,
                                height: `${heightPct}%`,
                                background: i === 6 ? `linear-gradient(to top, ${colors.charts.volume[0]}, ${colors.charts.volume[1]})` : colors.charts.volumeBg,
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                position: 'relative'
                            }} className="trend-bar-admin" />
                        </Tooltip>
                    );
                })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${colors.charts.border}`, paddingTop: 12 }}>
                {weeklyData.labels.map((label, i) => (
                    <Text key={i} type="secondary" style={{ fontSize: 10, fontWeight: i === 6 ? 700 : 400 }}>{label}</Text>
                ))}
            </div>
        </Card>
    );
};

// ─── 3. Operations Efficiency ───────────────────────────────────────────────
export const OperationsEfficiency: React.FC<AdminChartsProps> = ({ statusCounts, isError }) => {
    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;
    const processing = statusCounts.processing || 0;
    const completed = statusCounts.completed || 0;

    return (
        <Card
            title={<Space><RiseOutlined style={{ color: colors.warning }} /> Operations Insights</Space>}
            bordered={false}
            style={{ borderRadius: 16, height: '100%', boxShadow: `0 4px 12px ${colors.cardShadow}` }}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Space><ClockCircleOutlined style={{ color: colors.warning }} /> <Text type="secondary">Processing Efficiency</Text></Space>
                        <Text strong>{Math.round((completed / total) * 100)}%</Text>
                    </div>
                    <Progress percent={Math.round((completed / total) * 100)} strokeColor={colors.warning} showInfo={false} />
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Space><ExperimentOutlined style={{ color: colors.info }} /> <Text type="secondary">Lab Workload</Text></Space>
                        <Text strong>{processing} Active</Text>
                    </div>
                    <Progress percent={Math.min(100, Math.round((processing / total) * 100 * 2))} strokeColor={colors.info} showInfo={false} />
                </div>

                {!isError ? (
                    <div style={{ marginTop: 8, padding: '16px', background: colors.stats.tests, borderRadius: '12px', textAlign: 'center' }}>
                        <CheckCircleOutlined style={{ fontSize: 24, color: colors.success, marginBottom: 8 }} />
                        <div style={{ fontWeight: 600, color: colors.success }}>System Healthy</div>
                        <Text style={{ fontSize: 12, color: colors.success }}>All services operating normally</Text>
                    </div>
                ) : (
                    <div style={{ marginTop: 8, padding: '16px', background: colors.stats.reports, borderRadius: '12px', textAlign: 'center' }}>
                        <ClockCircleOutlined style={{ fontSize: 24, color: colors.danger, marginBottom: 8 }} />
                        <div style={{ fontWeight: 600, color: colors.danger }}>System Alert</div>
                        <Text style={{ fontSize: 12, color: colors.danger }}>Connection issues detected</Text>
                    </div>
                )}
            </Space>
        </Card>
    );
};

// ─── 4. Revenue Trends (Multi-view Line/Bar Chart) ──────────────────────────
export const RevenueTrends: React.FC<AdminChartsProps> = ({ recentOrders }) => {
    const [view, setView] = React.useState<'Week' | 'Month' | 'Year'>('Week');

    const revenueData = useMemo(() => {
        let labels: string[] = [];
        let data: number[] = [];

        if (view === 'Week') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const d = dayjs().subtract(i, 'day');
                labels.push(d.format('ddd'));
                let dayTotal = 0;
                recentOrders.forEach(o => {
                    if (dayjs(o.createdAt).isSame(d, 'day')) {
                        dayTotal += parseFloat(String(o.total_amount || 0));
                    }
                });
                data.push(dayTotal);
            }
        } else if (view === 'Month') {
            // Last 4 weeks
            for (let i = 3; i >= 0; i--) {
                const start = dayjs().subtract(i, 'week').startOf('week');
                const end = dayjs().subtract(i, 'week').endOf('week');
                labels.push(`Week ${4 - i}`);
                let weekTotal = 0;
                recentOrders.forEach(o => {
                    const d = dayjs(o.createdAt);
                    if (d.isAfter(start) && d.isBefore(end)) {
                        weekTotal += parseFloat(String(o.total_amount || 0));
                    }
                });
                data.push(weekTotal);
            }
        } else if (view === 'Year') {
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const d = dayjs().subtract(i, 'month');
                labels.push(d.format('MMM'));
                let monthTotal = 0;
                recentOrders.forEach(o => {
                    if (dayjs(o.createdAt).isSame(d, 'month')) {
                        monthTotal += parseFloat(String(o.total_amount || 0));
                    }
                });
                data.push(monthTotal);
            }
        }

        return { labels, data };
    }, [recentOrders, view]);

    const maxRev = Math.max(...revenueData.data, 1);

    return (
        <Card
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Space><span style={{ color: colors.success, fontWeight: 'bold' }}>₹</span> Total Revenue Analytics</Space>
                    <Segmented
                        size="small"
                        options={['Week', 'Month', 'Year']}
                        value={view}
                        onChange={(v: any) => setView(v)}
                    />
                </div>
            }
            bordered={false}
            style={{ borderRadius: 16, height: '100%', boxShadow: `0 4px 12px ${colors.cardShadow}` }}
        >
            <div style={{ height: 220, display: 'flex', alignItems: 'flex-end', gap: '4%', padding: '20px 0' }}>
                {revenueData.data.map((val, i) => {
                    const heightPct = Math.max((val / maxRev) * 100, 2);
                    return (
                        <Tooltip key={i} title={`${revenueData.labels[i]}: ₹${val.toLocaleString()}`}>
                            <div style={{
                                flex: 1,
                                height: `${heightPct}%`,
                                background: `linear-gradient(to top, ${colors.charts.revenue[0]}, ${colors.charts.revenue[1]})`,
                                borderRadius: '6px 6px 2px 2px',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                cursor: 'pointer',
                                position: 'relative',
                                opacity: 0.8
                            }} className="revenue-bar" />
                        </Tooltip>
                    );
                })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${colors.charts.border}`, paddingTop: 12 }}>
                {revenueData.labels.map((label, i) => (
                    <Text key={i} type="secondary" style={{ fontSize: 10, flex: 1, textAlign: 'center' }}>{label}</Text>
                ))}
            </div>
        </Card>
    );
};
