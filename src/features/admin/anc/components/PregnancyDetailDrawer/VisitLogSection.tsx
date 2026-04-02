import React from 'react';
import { Typography, Button, Collapse, Timeline, Row, Col, Empty } from 'antd';
import { HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { colors } from '@/styles/colors';

const { Title, Text } = Typography;

interface VisitLogSectionProps {
    visits: any[];
    onLogClick: () => void;
}

const VisitLogSection: React.FC<VisitLogSectionProps> = ({ visits, onLogClick }) => {
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={5} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HistoryOutlined /> Antenatal Visit Log
                </Title>
                <Button 
                    type="primary" 
                    size="small" 
                    icon={<PlusOutlined />} 
                    onClick={onLogClick}
                    style={{ borderRadius: '6px', background: colors.primary, borderColor: colors.primary }}
                >
                    Log Check-up
                </Button>
            </div>

            {visits && visits.length > 0 ? (
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
                                <span style={{ fontSize: 13, color: colors.ui.label, fontWeight: 600 }}>
                                    VIEW VISIT HISTORY ({visits.length})
                                </span>
                            ),
                            children: (
                                <div style={{ 
                                    maxHeight: '320px', 
                                    overflowY: 'auto', 
                                    padding: '10px 8px 10px 4px',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none',
                                }}>
                                    <Timeline
                                        mode="left"
                                        items={visits.map((visit: any, index: number) => ({
                                            color: index === 0 ? colors.primary : 'gray',
                                            label: dayjs(visit.visit_date).format('DD MMM YYYY'),
                                            children: (
                                                <div style={{ 
                                                    background: colors.ui.bgLight, 
                                                    padding: '12px', 
                                                    borderRadius: '12px', 
                                                    marginTop: '-10px',
                                                    border: index === 0 ? `1px solid ${colors.primary}4D` : `1px solid ${colors.ui.border}`
                                                }}>
                                                    <Row gutter={8}>
                                                        <Col span={8}>
                                                            <div style={{ color: colors.ui.label, fontSize: '10px' }}>WEIGHT</div>
                                                            <div style={{ fontWeight: 600 }}>{visit.weight_kg || '-'} kg</div>
                                                        </Col>
                                                        <Col span={10}>
                                                            <div style={{ color: colors.ui.label, fontSize: '10px' }}>BP</div>
                                                            <div style={{ fontWeight: 600, color: (visit.bp_systolic > 140) ? colors.danger : colors.ui.text }}>
                                                                {visit.bp_systolic}/{visit.bp_diastolic}
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div style={{ color: colors.ui.label, fontSize: '10px' }}>WEEK</div>
                                                            <div style={{ fontWeight: 600 }}>W{visit.gestational_age_weeks}</div>
                                                        </Col>
                                                    </Row>
                                                    {visit.notes && (
                                                        <div style={{ marginTop: '8px', padding: '6px', background: '#f5f5f5', borderRadius: '4px', fontSize: '12px', fontStyle: 'italic', color: '#595959' }}>
                                                            "{visit.notes}"
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        }))}
                                    />
                                </div>
                            ),
                        }
                    ]}
                />
            ) : (
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description={<Text type="secondary">No visit logs recorded yet</Text>} 
                />
            )}
        </>
    );
};

export default VisitLogSection;
