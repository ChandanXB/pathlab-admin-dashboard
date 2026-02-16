import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { StatData } from '../data/dashboardData';

const { Title, Text } = Typography;

interface StatCardProps {
    data: StatData;
}

const StatCard: React.FC<StatCardProps> = ({ data }) => {
    return (
        <Card
            bordered={false}
            className="stat-card"
            style={{
                borderRadius: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                overflow: 'hidden'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <Text type="secondary" style={{ fontSize: 14 }}>{data.title}</Text>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                        <Title level={3} style={{ margin: 0 }}>{data.value}</Title>
                        <Tag color={data.isUp ? 'success' : 'error'} bordered={false} style={{ margin: 0 }}>
                            {data.isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {data.trend}
                        </Tag>
                    </div>
                </div>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: data.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: data.iconColor
                }}>
                    {data.icon}
                </div>
            </div>
        </Card>
    );
};

export default StatCard;
