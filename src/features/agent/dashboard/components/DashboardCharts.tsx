import React, { useMemo } from 'react';
import { Card, Space, Tooltip, Typography, Progress, Row, Col } from 'antd';
import {
    ThunderboltOutlined,
    EnvironmentOutlined,
    StarOutlined,
    PieChartOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import colors from '@/styles/colors';
import type { AgentOrder } from '../../services/agentOrderService';

const { Text } = Typography;

interface ChartProps {
    orders: AgentOrder[];
}

// ─── 1. Weekly Trends Chart ──────────────────────────────────────────────────
export const WeeklyTrendsChart: React.FC<ChartProps> = ({ orders }) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const weeklyCounts = useMemo(() => {
        // Count orders for each day of the current week (Mon–Sun)
        // dayjs day(): 0=Sun, 1=Mon, ..., 6=Sat → remap to 0=Mon, ..., 6=Sun
        const counts = [0, 0, 0, 0, 0, 0, 0];
        orders.forEach(order => {
            const rawDay = dayjs(order.createdAt).day(); // 0=Sun ... 6=Sat
            const dayIndex = rawDay === 0 ? 6 : rawDay - 1; // 0=Mon ... 6=Sun
            counts[dayIndex]++;
        });
        return counts;
    }, [orders]);

    const maxCount = Math.max(...weeklyCounts, 1);
    const rawToday = dayjs().day();
    const todayIndex = rawToday === 0 ? 6 : rawToday - 1;

    return (
        <Card
            title={<Space><ThunderboltOutlined style={{ color: colors.info }} /> Weekly Trends</Space>}
            style={{ borderRadius: '24px', boxShadow: `0 8px 24px ${colors.cardShadow}`, border: 'none', flex: 1, height: '100%', width: '100%' }}
        >
            <div style={{ height: 220, display: 'flex', alignItems: 'flex-end', gap: '5%', padding: '10px 10px 20px' }}>
                {weeklyCounts.map((count, i) => {
                    const heightPct = Math.max((count / maxCount) * 100, 6); // min 6% for empty days
                    const isToday = i === todayIndex;
                    return (
                        <Tooltip key={i} title={`${days[i]}: ${count} pickup${count !== 1 ? 's' : ''}`}>
                            <div
                                className="trend-bar"
                                style={{
                                    flex: 1,
                                    height: `${heightPct}%`,
                                    background: isToday
                                        ? `linear-gradient(to top, ${colors.charts.volume[0]}, ${colors.charts.volume[1]})`
                                        : `linear-gradient(to top, ${colors.charts.volumeBg}, #bae7ff)`,
                                    borderRadius: '8px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                }}
                            />
                        </Tooltip>
                    );
                })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0', borderTop: `1px solid ${colors.borderLight}` }}>
                {days.map((day, i) => (
                    <Text
                        key={day}
                        type="secondary"
                        style={{ fontSize: 12, fontWeight: i === todayIndex ? 700 : 400, color: i === todayIndex ? colors.info : undefined }}
                    >
                        {day}
                    </Text>
                ))}
            </div>
            <style>{`
                .trend-bar:hover {
                    transform: scaleX(1.1) translateY(-5px);
                    filter: brightness(1.05);
                    box-shadow: 0 4px 12px ${colors.layout.adminGlow};
                }
            `}</style>
        </Card>
    );
};

// ─── 2. Activity Distribution Chart ──────────────────────────────────────────
export const ActivityDistributionChart: React.FC<ChartProps> = ({ orders }) => {
    const { morningCount, afternoonCount, eveningCount, total } = useMemo(() => {
        let morningCount = 0;   // 6am–12pm
        let afternoonCount = 0; // 12pm–6pm
        let eveningCount = 0;   // 6pm–11:59pm

        orders.forEach(order => {
            const hour = dayjs(order.createdAt).hour();
            if (hour >= 6 && hour < 12) morningCount++;
            else if (hour >= 12 && hour < 18) afternoonCount++;
            else eveningCount++;
        });

        const total = morningCount + afternoonCount + eveningCount || 1;
        return { morningCount, afternoonCount, eveningCount, total };
    }, [orders]);

    const morningPct = Math.round((morningCount / total) * 100);
    const afternoonPct = Math.round((afternoonCount / total) * 100);
    const eveningPct = Math.round((eveningCount / total) * 100);

    return (
        <Card
            title={<Space><EnvironmentOutlined style={{ color: colors.danger }} /> Activity Distribution</Space>}
            style={{ borderRadius: '24px', boxShadow: `0 8px 24px ${colors.cardShadow}`, border: 'none', flex: 1, height: '100%', width: '100%' }}
        >
            <div style={{ padding: '0 5px' }}>
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text type="secondary">Morning (6am – 12pm)</Text>
                        <Text strong>{morningPct}% <Text type="secondary" style={{ fontSize: 11 }}>({morningCount})</Text></Text>
                    </div>
                    <Progress percent={morningPct} strokeColor={colors.status.pending} showInfo={false} strokeWidth={10} />
                </div>
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text type="secondary">Afternoon (12pm – 6pm)</Text>
                        <Text strong>{afternoonPct}% <Text type="secondary" style={{ fontSize: 11 }}>({afternoonCount})</Text></Text>
                    </div>
                    <Progress percent={afternoonPct} strokeColor={colors.info} showInfo={false} strokeWidth={10} />
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text type="secondary">Evening (6pm – 12am)</Text>
                        <Text strong>{eveningPct}% <Text type="secondary" style={{ fontSize: 11 }}>({eveningCount})</Text></Text>
                    </div>
                    <Progress percent={eveningPct} strokeColor={colors.status.processing} showInfo={false} strokeWidth={10} />
                </div>

                {orders.length === 0 && (
                    <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 12 }}>
                        No order data available yet
                    </Text>
                )}
            </div>
        </Card>
    );
};

// ─── 3. Performance Summary Chart ────────────────────────────────────────────
export const PerformanceSummaryChart: React.FC<ChartProps> = ({ orders }) => {
    const { completionRate, slaRate, totalCompleted, totalOrders } = useMemo(() => {
        const totalOrders = orders.length;
        const totalCompleted = orders.filter(o => o.status === 'completed' || o.assignment_status === 'collected').length;

        // SLA: orders collected within 24h of creation
        const slaOrders = orders.filter(o => {
            if (!(o.status === 'completed' || o.assignment_status === 'collected')) return false;
            const created = dayjs(o.createdAt);
            const completed = dayjs(o.collected_at || o.updatedAt);
            return completed.diff(created, 'hour') <= 24;
        });

        const completionRate = totalOrders > 0 ? Math.round((totalCompleted / totalOrders) * 100) : 0;
        const slaRate = totalCompleted > 0 ? Math.round((slaOrders.length / totalCompleted) * 100) : 0;

        return { completionRate, slaRate, totalCompleted, totalOrders };
    }, [orders]);

    const getPerformanceLabel = (rate: number) => {
        if (rate >= 90) return { label: 'Excellent Work!', sub: "You're in the top tier of agents.", icon: <TrophyOutlined style={{ color: colors.status.pending }} /> };
        if (rate >= 70) return { label: 'Good Progress!', sub: 'Keep it up to reach the top.', icon: <RiseOutlined style={{ color: colors.info }} /> };
        if (rate >= 50) return { label: 'Room to Improve', sub: 'Complete more orders to boost your score.', icon: <ClockCircleOutlined style={{ color: colors.status.pending }} /> };
        return { label: 'Getting Started', sub: 'Accept and complete orders to build your record.', icon: <ClockCircleOutlined style={{ color: colors.charts.text }} /> };
    };

    const perf = getPerformanceLabel(completionRate);

    return (
        <Card
            title={<Space><StarOutlined style={{ color: colors.status.pending }} /> Performance Summary</Space>}
            style={{ borderRadius: '24px', boxShadow: `0 8px 24px ${colors.cardShadow}`, border: 'none', flex: 1, height: '100%', width: '100%' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
                <Progress
                    type="dashboard"
                    percent={completionRate}
                    strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                    strokeWidth={10}
                    size={160}
                    format={(pct) => (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: colors.textDark }}>{pct}%</div>
                            <div style={{ fontSize: 11, color: colors.charts.text }}>Completion</div>
                        </div>
                    )}
                />
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Space>
                        {perf.icon}
                        <Text strong style={{ fontSize: '16px' }}>{perf.label}</Text>
                    </Space>
                    <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>{perf.sub}</Text>
                </div>
                <Row gutter={16} style={{ width: '100%', marginTop: 20 }}>
                    <Col span={12}>
                        <div style={{ textAlign: 'center', padding: '12px', background: colors.stats.tests, borderRadius: '16px' }}>
                            <Text strong style={{ color: colors.success, display: 'block', fontSize: '18px' }}>{slaRate}%</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>SLA Met</Text>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div style={{ textAlign: 'center', padding: '12px', background: colors.charts.volumeBg, borderRadius: '16px' }}>
                            <Text strong style={{ color: colors.info, display: 'block', fontSize: '18px' }}>{totalCompleted}<Text style={{ fontSize: 12, color: colors.charts.text }}>/{totalOrders}</Text></Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>Completed</Text>
                        </div>
                    </Col>
                </Row>
            </div>
        </Card>
    );
};

// ─── 4. Priority Breakdown Chart ─────────────────────────────────────────────
export const PriorityBreakdownChart: React.FC<ChartProps> = ({ orders }) => {
    const { urgentCount, statCount, normalCount, total } = useMemo(() => {
        const urgentCount = orders.filter(o => o.priority === 'urgent').length;
        const statCount = orders.filter(o => o.priority === 'stat').length;
        const normalCount = orders.filter(o => o.priority === 'normal' || !o.priority).length;
        const total = orders.length || 1;
        return { urgentCount, statCount, normalCount, total };
    }, [orders]);

    const urgentPct = Math.round((urgentCount / total) * 100);
    const statPct = Math.round((statCount / total) * 100);
    const normalPct = Math.round((normalCount / total) * 100);

    const hasUrgent = urgentCount > 0;

    return (
        <Card
            title={<Space><PieChartOutlined style={{ color: colors.status.processing }} /> Priority Breakdown</Space>}
            style={{ borderRadius: '24px', boxShadow: `0 8px 24px ${colors.cardShadow}`, border: 'none', flex: 1, height: '100%', width: '100%' }}
        >
            <div style={{ padding: '5px 0' }}>
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Space>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.danger }} />
                            <Text>Urgent (ASAP)</Text>
                        </Space>
                        <Text strong>{urgentCount} <Text type="secondary" style={{ fontSize: 11 }}>({urgentPct}%)</Text></Text>
                    </div>
                    <Progress percent={urgentPct} strokeColor={colors.danger} showInfo={false} strokeWidth={8} />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Space>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.status.pending }} />
                            <Text>Stat (Fast Track)</Text>
                        </Space>
                        <Text strong>{statCount} <Text type="secondary" style={{ fontSize: 11 }}>({statPct}%)</Text></Text>
                    </div>
                    <Progress percent={statPct} strokeColor={colors.status.pending} showInfo={false} strokeWidth={8} />
                </div>
                <div style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Space>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.info }} />
                            <Text>Normal (Scheduled)</Text>
                        </Space>
                        <Text strong>{normalCount} <Text type="secondary" style={{ fontSize: 11 }}>({normalPct}%)</Text></Text>
                    </div>
                    <Progress percent={normalPct} strokeColor={colors.info} showInfo={false} strokeWidth={8} />
                </div>

                <div style={{ marginTop: 28, padding: '14px 16px', background: hasUrgent ? colors.stats.reports : colors.stats.revenue, borderRadius: '16px' }}>
                    <Space align="start">
                        <ClockCircleOutlined style={{ color: hasUrgent ? colors.danger : colors.status.processing, marginTop: 4 }} />
                        <div>
                            <Text strong style={{ color: hasUrgent ? colors.danger : colors.status.processing, display: 'block' }}>
                                {hasUrgent ? `${urgentCount} Urgent Order${urgentCount > 1 ? 's' : ''} Pending!` : 'Efficiency Tip'}
                            </Text>
                            <Text style={{ fontSize: '12px', color: hasUrgent ? colors.danger : colors.status.processing }}>
                                {hasUrgent
                                    ? 'Prioritize urgent pickups immediately to maintain your SLA rating.'
                                    : 'Complete urgent tasks first to maintain your SLA rating!'}
                            </Text>
                        </div>
                    </Space>
                </div>
            </div>
        </Card>
    );
};
