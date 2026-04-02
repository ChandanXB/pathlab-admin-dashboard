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
            styles={{ body: { padding: '10px 14px' } }}
            style={{
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                overflow: 'hidden'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{data.title}</Text>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                        <Title level={4} style={{ margin: 0 }}>{data.value}</Title>
                        <Tag color={data.isUp ? 'success' : 'error'} bordered={false} style={{ margin: 0, fontSize: 11 }}>
                            {data.isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {data.trend}
                        </Tag>
                    </div>
                </div>
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: data.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: data.iconColor,
                    flexShrink: 0
                }}>
                    {data.icon}
                </div>
            </div>
        </Card>
    );
};

export default StatCard;
