import React from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend,
    ReferenceLine
} from 'recharts';
import dayjs from 'dayjs';
import { colors } from '@/styles/colors';

interface VitalsTrendChartProps {
    data: any[];
}

const VitalsTrendChart: React.FC<VitalsTrendChartProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    // Sort data by visit date ascending for the chart
    const chartData = [...data]
        .sort((a, b) => dayjs(a.visit_date).unix() - dayjs(b.visit_date).unix())
        .map(visit => ({
            date: dayjs(visit.visit_date).format('DD MMM'),
            systolic: visit.bp_systolic,
            diastolic: visit.bp_diastolic,
            weight: visit.weight_kg,
            week: `W${visit.gestational_age_weeks}`
        }));

    return (
        <div style={{ width: '100%', height: 300, marginTop: '10px' }}>
            <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: colors.ui.label }}
                    />
                    <YAxis 
                        yAxisId="bp"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: colors.ui.label }}
                        domain={[60, 180]}
                    />
                    <YAxis 
                        yAxisId="weight"
                        orientation="right"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: colors.ui.label }}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    
                    {/* Normal BP Reference Lines */}
                    <ReferenceLine yAxisId="bp" y={140} stroke={colors.danger} strokeDasharray="3 3" label={{ position: 'right', value: 'High BP Limit', fill: colors.danger, fontSize: 8 }} />
                    
                    <Line 
                        yAxisId="bp"
                        type="monotone" 
                        dataKey="systolic" 
                        name="BP Systolic"
                        stroke={colors.primary} 
                        strokeWidth={3}
                        dot={{ r: 4, fill: colors.primary }}
                        activeDot={{ r: 6 }}
                    />
                    <Line 
                        yAxisId="bp"
                        type="monotone" 
                        dataKey="diastolic" 
                        name="BP Diastolic"
                        stroke={colors.info} 
                        strokeWidth={2}
                        dot={{ r: 3, fill: colors.info }}
                    />
                    <Line 
                        yAxisId="weight"
                        type="monotone" 
                        dataKey="weight" 
                        name="Weight (kg)"
                        stroke="#52c41a" 
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#52c41a' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VitalsTrendChart;
