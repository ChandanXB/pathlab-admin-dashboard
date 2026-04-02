import React from 'react';
import { Collapse } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { colors } from '@/styles/colors';
import VitalsTrendChart from './VitalsTrendChart';

interface VitalsTrendSectionProps {
    visits: any[];
}

const VitalsTrendSection: React.FC<VitalsTrendSectionProps> = ({ visits }) => {
    if (!visits || visits.length <= 1) return null;

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
                        </span>
                    ),
                    children: (
                        <div style={{ padding: '0 8px 8px' }}>
                            <VitalsTrendChart data={visits} />
                        </div>
                    ),
                }
            ]}
        />
    );
};

export default VitalsTrendSection;
