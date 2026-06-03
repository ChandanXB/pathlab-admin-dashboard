import React from 'react';
import { Collapse, Empty, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { colors } from '@/styles/colors';
import VitalsTrendChart from './VitalsTrendChart';

const { Text } = Typography;

interface VitalsTrendSectionProps {
    visits: any[];
}

const VitalsTrendSection: React.FC<VitalsTrendSectionProps> = ({ visits }) => {
    const hasEnoughData = visits && visits.length >= 2;

    return (
        <Collapse
            ghost
            expandIconPosition="end"
            style={{
                background: '#fff',
                borderRadius: '16px',
                border: 'none',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }}
            items={[
                {
                    key: '1',
                    label: (
                        <span style={{ fontSize: 13, color: colors.ui.label, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                            <LineChartOutlined /> VITALS TRENDS
                            {!hasEnoughData && (
                                <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>
                                    (needs 2+ visits)
                                </Text>
                            )}
                        </span>
                    ),
                    children: hasEnoughData ? (
                        <div style={{ padding: '0 8px 8px' }}>
                            <VitalsTrendChart data={visits} />
                        </div>
                    ) : (
                        <Empty
                            image={<LineChartOutlined style={{ fontSize: 40, color: colors.ui.border }} />}
                            imageStyle={{ height: 50 }}
                            description={
                                <div style={{ textAlign: 'center' }}>
                                    <Text type="secondary" style={{ fontSize: 13 }}>Vitals trend chart will appear here</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Log at least <strong>2 antenatal visits</strong> to track weight and BP trends over time.
                                    </Text>
                                </div>
                            }
                            style={{ padding: '20px 0' }}
                        />
                    ),
                }
            ]}
        />
    );
};

export default VitalsTrendSection;
