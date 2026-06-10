import { Card, Typography, Space, Timeline, Tag, Button, Image, Row, Col, Progress, Modal, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { 
    HistoryOutlined, 
    PhoneOutlined,
    FilePdfOutlined,
    AlertOutlined, 
    FileTextOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import type { Pregnancy } from '../../services/ancService';
import { formatName } from '@/shared/utils/nameUtils';
import SharedDetailDrawer from '@/shared/components/SharedDetailDrawer';
import { colors } from '@/styles/colors';
import LogVisitModal from './LogVisitModal';
import EditPregnancyModal from './EditPregnancyModal';
import LogRiskModal from './LogRiskModal';
import VitalsTrendSection from './VitalsTrendSection';
import VisitLogSection from './VisitLogSection';
import AncCardPreviewModal from './AncCardPreviewModal';

const { Text } = Typography;

interface PregnancyDetailDrawerProps {
    id: number | null;
    open: boolean;
    onClose: () => void;
    fetchDetail: (id: number) => Promise<Pregnancy | null>;
    onLogVisit: (id: number, data: any) => Promise<boolean>;
    onUpdate: (id: number, data: any) => Promise<boolean>;
    onLogRisk: (id: number, data: any) => Promise<boolean>;
    onDelete?: (id: number) => Promise<boolean>;
    onUpdateStatus?: (id: number, status: string) => Promise<boolean>;
    onUpdateVisit?: (visitId: number, data: any) => Promise<boolean>;
    onDeleteVisit?: (visitId: number) => Promise<boolean>;
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
    onDelete,
    onUpdateStatus,
    onUpdateVisit,
    onDeleteVisit,
    onSwitchJourney
}) => {
    const [data, setData] = useState<Pregnancy | null>(null);
    const [loading, setLoading] = useState(false);
    const [logModalVisible, setLogModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [riskModalVisible, setRiskModalVisible] = useState(false);
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [ancCardPreviewVisible, setAncCardPreviewVisible] = useState(false);
    const [showAllRisks, setShowAllRisks] = useState(false);
    const [editVisitData, setEditVisitData] = useState<any>(null);

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

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'green';
            case 'closed': return 'default';
            case 'active':
            default:
                return 'processing';
        }
    };

    const statusMenuItems: MenuProps['items'] = [
        { key: 'active', label: 'Active Journey', icon: <ClockCircleOutlined /> },
        { key: 'delivered', label: 'Delivered', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> },
        { key: 'closed', label: 'Closed / Transferred', icon: <DeleteOutlined /> }
    ];

    const handleStatusMenuClick: MenuProps['onClick'] = async (e) => {
        if (id && onUpdateStatus && data?.status !== e.key) {
            const success = await onUpdateStatus(id, e.key);
            if (success) {
                refreshData();
            }
        }
    };

    const headerStats = data ? (
        <Row gutter={16} align="stretch">
            <Col span={12}>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px', backdropFilter: 'blur(4px)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: '12px', display: 'block' }}>CONTACT</Text>
                    <Text style={{ color: '#fff', fontWeight: 600 }}>{data.mother.phone}</Text>
                </div>
            </Col>
            <Col span={12}>
                <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => setEditModalVisible(true)}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        padding: '12px', 
                        borderRadius: '12px', 
                        background: 'rgba(255,255,255,0.15)', 
                        backdropFilter: 'blur(4px)', 
                        border: 'none', 
                        color: '#fff', 
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: 'none'
                    }}
                >
                    EDIT DETAILS
                </Button>
            </Col>
        </Row>
    ) : null;

    const handleDelete = () => {
        Modal.confirm({
            title: 'Delete Pregnancy Record',
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
            content: (
                <div>
                    <p>Are you sure you want to permanently delete the ANC record for <strong>{data?.mother?.full_name}</strong>?</p>
                    <p style={{ color: '#ff4d4f', fontSize: '12px', marginBottom: 0 }}>This will also remove all visit logs and risk assessments. This action cannot be undone.</p>
                </div>
            ),
            okText: 'Delete Permanently',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: async () => {
                if (id && onDelete) {
                    const success = await onDelete(id);
                    if (success) onClose();
                }
            }
        });
    };

    const footer = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            {onDelete && (
                <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    style={{ fontSize: '13px' }}
                >
                    Delete Record
                </Button>
            )}
            <Space direction="horizontal" style={{ marginLeft: 'auto' }}>
                <Button
                    ghost
                    type="primary"
                    icon={<FilePdfOutlined />}
                    onClick={() => setAncCardPreviewVisible(true)}
                >
                    ANC CARD
                </Button>
                <Button
                    icon={<PhoneOutlined />}
                    type="default"
                    onClick={() => data?.mother?.phone && window.open(`tel:${data.mother.phone}`)}
                >
                    Call Mother
                </Button>
            </Space>
        </div>
    );

    return (
        <SharedDetailDrawer
            open={open}
            onClose={onClose}
            loading={loading}
            title={data ? formatName(data.mother.full_name) : 'Patient Details'}
            subtitle={data ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>ANC Reg: ANC-{data.id.toString().padStart(4, '0')} | Patient: {data.mother.patient_code}</span>
                    {onUpdateStatus && (
                        <Dropdown menu={{ items: statusMenuItems, onClick: handleStatusMenuClick }} trigger={['click']}>
                            <Tag color={getStatusColor(data.status)} style={{ cursor: 'pointer', borderRadius: '12px', padding: '0 8px' }}>
                                {(data.status || 'active').toUpperCase()}
                            </Tag>
                        </Dropdown>
                    )}
                </div>
            ) : 'ANC Patient Profile'}
            headerGradient={`linear-gradient(135deg, ${colors.primary} 0%, ${colors.info} 100%)`}
            headerStats={headerStats}
            footer={footer}
            width={580}
        >
            {data && (
                <>
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

                        {/* Divider */}
                        <div style={{ height: '1px', background: '#f0f0f0', margin: '14px 0' }} />

                        {/* LMP / EDD + Clinical History in one row */}
                        <Row gutter={16}>
                            {/* LMP / EDD */}
                            <Col span={12}>
                                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>LMP / EDD</Text>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>LMP</Text>
                                    <Text style={{ fontSize: '12px', fontWeight: 600 }}>{dayjs(data.lmp_date).format('DD MMM YY')}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>EDD</Text>
                                    <Text style={{ fontSize: '12px', fontWeight: 600, color: colors.danger }}>{dayjs(data.edd_date).format('DD MMM YY')}</Text>
                                </div>
                            </Col>

                            {/* Vertical separator */}
                            <Col span={1} style={{ display: 'flex', justifyContent: 'center' }}>
                                <div style={{ width: '1px', background: '#f0f0f0', height: '100%' }} />
                            </Col>

                            {/* Clinical History G/P/A/L */}
                            <Col span={11} style={{ textAlign: 'center' }}>
                                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Clinical History</Text>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: colors.ui.text }}>{data.gravida}/{data.para}/{data.abortions}/{data.living_children}</div>
                                <Text style={{ fontSize: '11px', color: colors.ui.label }}>G / P / A / L</Text>
                            </Col>
                        </Row>
                    </Card>


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

                    {/* Compact Medical Documents Section */}
                    {data.report_url && (
                        <Card 
                            size="small" 
                            style={{ borderRadius: '16px', border: 'none', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
                                <Space>
                                    <div style={{ width: 36, height: 36, background: `${colors.primary}1A`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileTextOutlined style={{ color: colors.primary, fontSize: '18px' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ui.text }}>{data.report_name || 'Clinical Document'}</div>
                                        <div style={{ fontSize: '10px', color: colors.ui.label }}>Medical Report</div>
                                    </div>
                                </Space>
                                <Space>
                                    {data.report_url.includes('application/pdf') || data.report_url.startsWith('data:application/pdf') ? (
                                        <Button 
                                            icon={<DownloadOutlined />} 
                                            size="small" 
                                            onClick={() => {
                                                const a = document.createElement('a');
                                                a.href = data.report_url || '';
                                                a.download = data.report_name || 'Medical_Report.pdf';
                                                a.click();
                                            }}
                                            style={{ borderRadius: '8px' }}
                                        >
                                            Download
                                        </Button>
                                    ) : (
                                        <>
                                            <Button 
                                                icon={<DownloadOutlined />} 
                                                size="small" 
                                                onClick={() => {
                                                    const a = document.createElement('a');
                                                    a.href = data.report_url || '';
                                                    a.download = data.report_name || 'Medical_Report';
                                                    a.click();
                                                }}
                                                style={{ borderRadius: '8px' }}
                                            >
                                                Download
                                            </Button>
                                            <div style={{ display: 'none' }}>
                                                <Image
                                                    preview={{
                                                        visible: imagePreviewOpen,
                                                        onVisibleChange: (vis) => setImagePreviewOpen(vis),
                                                    }}
                                                    src={data.report_url}
                                                />
                                            </div>
                                        </>
                                    )}
                                </Space>
                            </div>
                        </Card>
                    )}

                    {/* Risk history */}
                    {data.risk_assessments && data.risk_assessments.length > 0 && (
                        <Card size="small" title={<span style={{ fontSize: 13, color: colors.ui.label, display: 'flex', alignItems: 'center', gap: '6px' }}><AlertOutlined /> RISK HISTORY ({data.risk_assessments.length})</span>} style={{ borderRadius: '12px', border: 'none', marginBottom: '20px' }}>
                            <Timeline
                                mode="left"
                                style={{ marginTop: '10px' }}
                                items={(showAllRisks ? data.risk_assessments : data.risk_assessments.slice(0, 3)).map((risk: any) => ({
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
                            {data.risk_assessments.length > 3 && (
                                <div style={{ textAlign: 'center', marginTop: '4px' }}>
                                    <Button
                                        type="link"
                                        size="small"
                                        onClick={() => setShowAllRisks(prev => !prev)}
                                        style={{ fontSize: '12px', padding: 0 }}
                                    >
                                        {showAllRisks
                                            ? 'Show Less'
                                            : `Show All ${data.risk_assessments.length} Assessments`}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Vitals Chart Section */}
                    {data.antenatal_visits && (
                        <VitalsTrendSection visits={data.antenatal_visits} />
                    )}
                    
                    {/* Antenatal Visit Log Section */}
                    <VisitLogSection 
                        visits={data.antenatal_visits || []} 
                        onLogClick={() => {
                            setEditVisitData(null);
                            setLogModalVisible(true);
                        }}
                        onUpdateVisit={onUpdateVisit}
                        onDeleteVisit={async (visitId) => {
                            if (onDeleteVisit) {
                                const success = await onDeleteVisit(visitId);
                                if (success) refreshData();
                                return success;
                            }
                            return false;
                        }}
                        onEditClick={(visit) => {
                            setEditVisitData(visit);
                            setLogModalVisible(true);
                        }}
                    />
                </>
            )}

            <LogVisitModal
                open={logModalVisible}
                onCancel={() => {
                    setLogModalVisible(false);
                    setEditVisitData(null);
                }}
                currentWeeks={weeks}
                initialData={editVisitData}
                onFinish={async (values: any) => {
                    if (editVisitData && onUpdateVisit) {
                        const success = await onUpdateVisit(editVisitData.id, values);
                        if (success) {
                            refreshData();
                            setEditVisitData(null);
                        }
                        return success;
                    } else if (id) {
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
                onFinish={async (pid: number, values: any) => {
                    const success = await onUpdate(pid, values);
                    if (success) refreshData();
                    return success;
                }}
            />

            <LogRiskModal
                open={riskModalVisible}
                onCancel={() => setRiskModalVisible(false)}
                currentRisk={data?.risk_level}
                onFinish={async (values: any) => {
                    if (id) {
                        const success = await onLogRisk(id, values);
                        if (success) refreshData();
                        return success;
                    }
                    return false;
                }}
            />
            <AncCardPreviewModal
                open={ancCardPreviewVisible}
                data={data}
                onCancel={() => setAncCardPreviewVisible(false)}
            />
        </SharedDetailDrawer>
    );
};

export default PregnancyDetailDrawer;
