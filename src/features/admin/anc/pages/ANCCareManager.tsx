import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Select, Row, Col, Typography, Button } from 'antd';
import { MedicineBoxOutlined, SearchOutlined, HeartOutlined, AlertOutlined, CalendarOutlined } from '@ant-design/icons';
import { useANC } from '../hooks/useANC';
import ANCTable from '../components/ANCTable';
import PregnancyDetailDrawer from '../components/PregnancyDetailDrawer/index';
import AncCardPreviewModal from '../components/PregnancyDetailDrawer/AncCardPreviewModal';
import RegisterPregnancyModal from '../components/RegisterPregnancyModal';
import StatCard from '@/shared/components/StatCard';
import dayjs from 'dayjs';
import type { Pregnancy } from '../services/ancService';
import { PlusOutlined } from '@ant-design/icons';

import { colors } from '@/styles/colors';

const { Title, Text } = Typography;

const ANCCareManager: React.FC = () => {
    const { pregnancies, loading, fetchPregnancyById, logVisit, updatePregnancy, createPregnancy, logRiskAssessment } = useANC();
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState<string | null>(null);
    const [filteredData, setFilteredData] = useState<Pregnancy[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [registerModalVisible, setRegisterModalVisible] = useState(false);
    const [cardPreviewVisible, setCardPreviewVisible] = useState(false);
    const [previewData, setPreviewData] = useState<Pregnancy | null>(null);

    useEffect(() => {
        let data = pregnancies;
        if (searchTerm) {
            data = data.filter(p =>
                p.mother.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.mother.patient_code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (riskFilter) {
            data = data.filter(p => p.risk_level === riskFilter);
        }
        setFilteredData(data);
    }, [searchTerm, riskFilter, pregnancies]);

    const handleView = (record: Pregnancy) => {
        setSelectedId(record.id);
        setDrawerVisible(true);
    };

    const handlePreview = (record: Pregnancy) => {
        setPreviewData(record);
        setCardPreviewVisible(true);
    };

    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const isMobile = screenSize < 768;

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [tableHeight, setTableHeight] = useState(400);
    const tableCardBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Subtract thead height (~47px) so header stays fixed
                setTableHeight(Math.max(200, entry.contentRect.height - 47));
            }
        });
        if (tableCardBodyRef.current) observer.observe(tableCardBodyRef.current);
        return () => observer.disconnect();
    }, []);

    const stats = {
        total: pregnancies.length,
        highRisk: pregnancies.filter(p => p.risk_level === 'High').length,
        dueSoon: pregnancies.filter(p => {
            const daysToDue = dayjs(p.edd_date).diff(dayjs(), 'days');
            return daysToDue > 0 && daysToDue <= 30;
        }).length,
        trimester3: pregnancies.filter(p => {
            const totalDays = dayjs().diff(dayjs(p.lmp_date), 'day');
            const weeks = Math.max(1, Math.floor(totalDays / 7) + 1);
            return weeks >= 27;
        }).length
    };

    const statsCards = [
        {
            title: 'Total ANC Patients',
            value: stats.total.toString(),
            trend: 'Live',
            isUp: true,
            icon: <span style={{ fontSize: 24 }}>🤰</span>,
            color: colors.stats.patients,
            iconColor: colors.primary
        },
        {
            title: 'High Risk cases',
            value: stats.highRisk.toString(),
            trend: stats.highRisk > 0 ? 'Urgent' : 'None',
            isUp: false,
            icon: <AlertOutlined style={{ fontSize: 24 }} />,
            color: colors.stats.reports,
            iconColor: colors.danger
        },
        {
            title: 'Due within 30 days',
            value: stats.dueSoon.toString(),
            trend: 'Soon',
            isUp: true,
            icon: <CalendarOutlined style={{ fontSize: 24 }} />,
            color: colors.stats.patients,
            iconColor: colors.info
        },
        {
            title: '3rd Trimester',
            value: stats.trimester3.toString(),
            trend: 'Final',
            isUp: true,
            icon: <HeartOutlined style={{ fontSize: 24 }} />,
            color: colors.stats.patients,
            iconColor: colors.info
        }
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '16px' : '0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.info} 100%)`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${colors.primary}4D` // 4D = 30% alpha
                    }}>
                        <MedicineBoxOutlined style={{ color: '#fff', fontSize: 24 }} />
                    </div>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>ANC Care Center</Title>
                        <Text type="secondary">Monitor and manage maternal health journeys</Text>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setRegisterModalVisible(true)}
                        style={{
                            borderRadius: '10px',
                            height: '48px',
                            background: colors.primary,
                            borderColor: colors.primary,
                            padding: '0 24px',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0, 74, 173, 0.2)'
                        }}
                    >
                        Enroll New Patient
                    </Button>
                </div>
            </div>

            <Row gutter={[12, 12]}>
                {statsCards.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <StatCard data={stat} />
                    </Col>
                ))}
            </Row>

            <Card styles={{ body: { padding: '16px' } }} style={{ borderRadius: '12px', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={12}>
                        <Input
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Search by patient name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Select
                            placeholder="Filter by Risk Level"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(val) => setRiskFilter(val)}
                            options={[
                                { value: 'Low', label: 'Low Risk' },
                                { value: 'Medium', label: 'Medium Risk' },
                                { value: 'High', label: 'High Risk' },
                            ]}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                            <Text type="secondary">Total Records: {filteredData.length}</Text>
                        </div>
                    </Col>
                </Row>
            </Card>

            <Card
                styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 } }}
                style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
                <div ref={tableCardBodyRef} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <ANCTable
                        data={filteredData}
                        loading={loading}
                        onView={handleView}
                        onPreview={handlePreview}
                        scroll={{ x: 1100, y: tableHeight }}
                    />
                </div>
            </Card>

            <PregnancyDetailDrawer
                id={selectedId}
                open={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                fetchDetail={fetchPregnancyById}
                onLogVisit={logVisit}
                onUpdate={updatePregnancy}
                onLogRisk={logRiskAssessment}
                onSwitchJourney={(newId) => setSelectedId(newId)}
            />

            <AncCardPreviewModal
                open={cardPreviewVisible}
                data={previewData}
                onCancel={() => setCardPreviewVisible(false)}
            />

            <RegisterPregnancyModal
                open={registerModalVisible}
                onCancel={() => setRegisterModalVisible(false)}
                onFinish={createPregnancy}
            />
        </div>
    );
};

export default ANCCareManager;
