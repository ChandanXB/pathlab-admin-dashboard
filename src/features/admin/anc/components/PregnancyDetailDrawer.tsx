import React, { useState, useEffect } from 'react';
import { Tag, Space, Typography, Card, Row, Col, Progress, Timeline, Button, Empty, Modal } from 'antd';
import { 
    HistoryOutlined, 
    PhoneOutlined,
    MedicineBoxOutlined,
    FilePdfOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Pregnancy } from '../services/ancService';
import { formatName } from '@/shared/utils/nameUtils';
import SharedDetailDrawer from '@/shared/components/SharedDetailDrawer';
import { colors } from '@/styles/colors';
import LogVisitModal from './LogVisitModal';
import EditPregnancyModal from './EditPregnancyModal';
import LogRiskModal from './LogRiskModal';
import VitalsTrendChart from './VitalsTrendChart';
import { generateAncPdf } from '../utils/ancPdfGenerator';
import { PlusOutlined, EditOutlined, AlertOutlined, LineChartOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PregnancyDetailDrawerProps {
    id: number | null;
    open: boolean;
    onClose: () => void;
    fetchDetail: (id: number) => Promise<Pregnancy | null>;
    onLogVisit: (id: number, data: any) => Promise<boolean>;
    onUpdate: (id: number, data: any) => Promise<boolean>;
    onLogRisk: (id: number, data: any) => Promise<boolean>;
    onSwitchJourney?: (id: number) => void;
}

const PregnancyDetailDrawer: React.FC<PregnancyDetailDrawerProps> = ({
    id,
    open,
    onClose,
    fetchDetail,
    onLogVisit,
    onUpdate,
    onLogRisk,
    onSwitchJourney
}) => {
    const [data, setData] = useState<Pregnancy | null>(null);
    const [loading, setLoading] = useState(false);
    const [logModalVisible, setLogModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [riskModalVisible, setRiskModalVisible] = useState(false);

    useEffect(() => {
        if (open && id) {
            setLoading(true);
            fetchDetail(id).then(res => {
                setData(res);
                setLoading(false);
            });
        }
    }, [open, id, fetchDetail]);

    if (!data && !loading) return null;

    const calculateWeeks = (lmp: string): number => {
        const totalDays = dayjs().diff(dayjs(lmp), 'day');
        return Math.max(1, Math.floor(totalDays / 7) + 1);
    };

    const weeks = data ? calculateWeeks(data.lmp_date) : 0;
    const progressPercent = Math.min(100, (weeks / 40) * 100);
    const daysToEDD = data ? dayjs(data.edd_date).diff(dayjs(), 'day') : 0;

    const getTrimester = (w: number) => {
        if (w <= 12) return 1;
        if (w <= 26) return 2;
        return 3;
    };

    const trimester = getTrimester(weeks);

    const refreshData = () => {
        if (id) {
            setLoading(true);
            fetchDetail(id).then(res => {
                setData(res);
                setLoading(false);
            });
        }
    };

    const headerStats = data ? (
        <Row gutter={16}>
            <Col span={12}>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                    <Text style={{ color: '#fff', fontSize: '12px', display: 'block' }}>CONTACT</Text>
                    <Text style={{ color: '#fff', fontWeight: 600 }}>{data.mother.phone}</Text>
                </div>
            </Col>
            <Col span={12}>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Text style={{ color: '#fff', fontSize: '10px', display: 'block' }}>RISK ASSESSED</Text>
                        <Tag color={data.risk_level === 'High' ? 'red' : data.risk_level === 'Medium' ? 'orange' : 'green'} style={{ border: 'none', margin: 0 }}>
                            {data.risk_level || 'LOW RISK'}
                        </Tag>
                    </div>
                    <Button 
                        type="primary" 
                        size="small" 
                        icon={<AlertOutlined style={{ fontSize: '12px' }} />} 
                        onClick={() => setRiskModalVisible(true)}
                        style={{ height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', border: 'none' }}
                    />
                </div>
            </Col>
        </Row>
    ) : null;

    const footer = (
        <Space direction="horizontal" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button 
                icon={<FilePdfOutlined />} 
                onClick={() => {
                    if (data) {
                        Modal.confirm({
                            title: 'Generate ANC Card?',
                            content: `Confirm to generate and download the clinical record for ${formatName(data.mother.full_name)}.`,
                            okText: 'Generate',
                            cancelText: 'Cancel',
                            centered: true,
                            onOk: () => generateAncPdf(data),
                        });
                    }
                }}
                disabled={!data}
            >
                Download ANC Card
            </Button>
            <Button icon={<MedicineBoxOutlined />} ghost type="primary">
                View Lab Reports
            </Button>
            <Button icon={<PhoneOutlined />} type="default">
                Call Mother
            </Button>
        </Space>
    );

    return (
        <SharedDetailDrawer
            open={open}
            onClose={onClose}
            loading={loading}
            title={data ? formatName(data.mother.full_name) : 'Patient Details'}
            subtitle={data ? `ANC Reg: ANC-${data.id.toString().padStart(4, '0')} | Patient: ${data.mother.patient_code}` : 'ANC Patient Profile'}
            headerGradient={`linear-gradient(135deg, ${colors.primary} 0%, ${colors.info} 100%)`}
            headerStats={headerStats}
            footer={footer}
            width={580}
        >
            {data && (
                <>
                    {/* Progress Tracker */}
                    <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <Text style={{ fontWeight: 600, fontSize: '15px' }}>Pregnancy Progress</Text>
                            <Tag color="processing" style={{ margin: 0, borderRadius: '4px' }}>Trimester {trimester}</Tag>
                        </div>

                        <Progress 
                            percent={progressPercent} 
                            strokeColor={{ '0%': colors.primary, '100%': colors.info }}
                            showInfo={false}
                            status="active"
                        />
                        
                        <Row style={{ marginTop: '12px' }} gutter={0}>
                            <Col span={12}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>Current Week</Text>
                                <div style={{ fontSize: '18px', fontWeight: 600, color: colors.primary }}>Week {weeks}</div>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>Days to EDD</Text>
                                <div style={{ fontSize: '18px', fontWeight: 600, color: colors.primary }}>
                                    {daysToEDD > 0 ? `${daysToEDD} Days` : 'Due soon'}
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    {/* Clinical Details */}
                    <Row gutter={16} style={{ marginBottom: '20px' }}>
                        <Col span={12}>
                            <Card 
                                size="small" 
                                title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 13, color: colors.ui.label }}>CLINICAL HISTORY</span>
                                        <Button 
                                            type="text" 
                                            size="small" 
                                            icon={<EditOutlined style={{ fontSize: '12px' }} />} 
                                            onClick={() => setEditModalVisible(true)}
                                            style={{ height: 'auto', padding: '0 4px', color: colors.primary }}
                                        >
                                            <span style={{ fontSize: '10px' }}>Manage</span>
                                        </Button>
                                    </div>
                                } 
                                style={{ borderRadius: '12px', border: 'none' }}
                            >
                                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 700, color: colors.ui.text }}>{data.gravida}/{data.para}/{data.abortions}/{data.living_children}</div>
                                    <Text style={{ fontSize: '11px', color: colors.ui.label }}>G / P / A / L</Text>
                                </div>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title={<span style={{ fontSize: 13, color: colors.ui.label }}>LMP / EDD</span>} style={{ borderRadius: '12px', border: 'none' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>LMP:</Text>
                                        <Text style={{ fontSize: '11px', fontWeight: 600 }}>{dayjs(data.lmp_date).format('DD MMM YY')}</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>EDD:</Text>
                                        <Text style={{ fontSize: '11px', fontWeight: 600, color: colors.danger }}>{dayjs(data.edd_date).format('DD MMM YY')}</Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Pregnancy History */}
                    {data.mother.pregnancies && data.mother.pregnancies.length > 1 && (
                        <Card 
                            size="small" 
                            title={<span style={{ fontSize: 13, color: colors.ui.label, display: 'flex', alignItems: 'center', gap: '6px' }}><HistoryOutlined /> PREVIOUS JOURNEYS</span>} 
                            style={{ borderRadius: '12px', border: 'none', marginBottom: '20px' }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                                {data.mother.pregnancies
                                    .filter(p => p.id !== data.id)
                                    .map(p => (
                                        <div 
                                            key={p.id} 
                                            onClick={() => onSwitchJourney?.(p.id)}
                                            style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                padding: '10px 12px',
                                                background: '#f8f9fa',
                                                borderRadius: '10px',
                                                cursor: onSwitchJourney ? 'pointer' : 'default',
                                                border: '1px solid transparent',
                                                transition: 'all 0.2s'
                                            }}
                                            className="journey-item"
                                        >
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: 600, color: colors.ui.text }}>LMP: {dayjs(p.lmp_date).format('DD MMM YY')}</div>
                                                <div style={{ fontSize: '10px', color: colors.ui.label }}>Reg. Date: {dayjs(p.createdAt).format('DD MMM YY')}</div>
                                            </div>
                                            <Tag color={p.risk_level === 'High' ? 'red' : p.risk_level === 'Medium' ? 'orange' : 'green'} style={{ margin: 0, fontSize: '10px', border: 'none' }}>
                                                {p.risk_level || 'Low'}
                                            </Tag>
                                        </div>
                                    ))}
                            </div>
                        </Card>
                    )}

                    {/* Medical Documents */}
                    {data.report_url && (
                        <Card 
                            size="small" 
                            title={<span style={{ fontSize: 13, color: colors.ui.label, display: 'flex', alignItems: 'center', gap: '6px' }}><FileTextOutlined /> MEDICAL DOCUMENTS</span>} 
                            style={{ borderRadius: '12px', border: 'none', marginBottom: '20px' }}
                        >
                            <div 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px', 
                                    padding: '12px', 
                                    background: colors.white, 
                                    borderRadius: '10px',
                                    border: `1px solid ${colors.ui.border}`,
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(data.report_url, '_blank')}
                            >
                                <div style={{ width: 40, height: 40, background: `${colors.primary}1A`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileTextOutlined style={{ color: colors.primary, fontSize: '20px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ui.text }}>{data.report_name || 'Clinical Report'}</div>
                                    <div style={{ fontSize: '11px', color: colors.ui.label }}>Click to view document</div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Risk history */}
                    {data.risk_assessments && data.risk_assessments.length > 0 && (
                        <Card size="small" title={<span style={{ fontSize: 13, color: colors.ui.label, display: 'flex', alignItems: 'center', gap: '6px' }}><AlertOutlined /> RISK HISTORY</span>} style={{ borderRadius: '12px', border: 'none', marginBottom: '20px' }}>
                            <Timeline
                                mode="left"
                                style={{ marginTop: '10px' }}
                                items={data.risk_assessments.slice(0, 3).map((risk: any) => ({
                                    color: risk.risk_level === 'High' ? 'red' : risk.risk_level === 'Medium' ? 'orange' : 'green',
                                    label: dayjs(risk.created_at).format('DD MMM'),
                                    children: (
                                        <div style={{ fontSize: '12px' }}>
                                            <Tag color={risk.risk_level === 'High' ? 'red' : risk.risk_level === 'Medium' ? 'orange' : 'green'} style={{ fontSize: '10px', height: '18px', lineHeight: '16px' }}>{risk.risk_level}</Tag>
                                            <div style={{ marginTop: '4px', color: colors.ui.text }}>{risk.assessment_notes}</div>
                                        </div>
                                    )
                                }))}
                            />
                        </Card>
                    )}

                    {/* Vitals Chart */}
                    {data.antenatal_visits && data.antenatal_visits.length > 1 && (
                        <Card 
                            size="small" 
                            title={<span style={{ fontSize: 13, color: colors.ui.label, display: 'flex', alignItems: 'center', gap: '6px' }}><LineChartOutlined /> VITALS TRENDS</span>} 
                            style={{ borderRadius: '12px', border: 'none', marginBottom: '20px' }}
                            styles={{ body: { padding: '8px 12px 16px' } }}
                        >
                            <VitalsTrendChart data={data.antenatal_visits} />
                        </Card>
                    )}

                    {/* Antenatal Visits History */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Title level={5} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HistoryOutlined /> Antenatal Visit Log
                        </Title>
                        <Button 
                            type="primary" 
                            size="small" 
                            icon={<PlusOutlined />} 
                            onClick={() => setLogModalVisible(true)}
                            style={{ borderRadius: '6px', background: colors.primary, borderColor: colors.primary }}
                        >
                            Log Check-up
                        </Button>
                    </div>

                    {data.antenatal_visits && data.antenatal_visits.length > 0 ? (
                        <Timeline
                            mode="left"
                            items={data.antenatal_visits.map((visit: any, index: number) => ({
                                color: index === 0 ? colors.primary : 'gray',
                                label: dayjs(visit.visit_date).format('DD MMM YYYY'),
                                children: (
                                    <div style={{ 
                                        background: colors.white, 
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
                                            <div style={{ marginTop: '8px', padding: '6px', background: '#f9f9f9', borderRadius: '4px', fontSize: '12px', fontStyle: 'italic', color: '#595959' }}>
                                                "{visit.notes}"
                                            </div>
                                        )}
                                    </div>
                                )
                            }))}
                        />
                    ) : (
                        <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            description={<Text type="secondary">No visit logs recorded yet</Text>} 
                        />
                    )}
                </>
            )}

            <LogVisitModal
                open={logModalVisible}
                onCancel={() => setLogModalVisible(false)}
                currentWeeks={weeks}
                onFinish={async (values) => {
                    if (id) {
                        const success = await onLogVisit(id, values);
                        if (success) refreshData();
                        return success;
                    }
                    return false;
                }}
            />

            <EditPregnancyModal
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                data={data}
                onFinish={async (pid, values) => {
                    const success = await onUpdate(pid, values);
                    if (success) refreshData();
                    return success;
                }}
            />

            <LogRiskModal
                open={riskModalVisible}
                onCancel={() => setRiskModalVisible(false)}
                currentRisk={data?.risk_level}
                onFinish={async (values) => {
                    if (id) {
                        const success = await onLogRisk(id, values);
                        if (success) refreshData();
                        return success;
                    }
                    return false;
                }}
            />
        </SharedDetailDrawer>
    );
};

export default PregnancyDetailDrawer;
