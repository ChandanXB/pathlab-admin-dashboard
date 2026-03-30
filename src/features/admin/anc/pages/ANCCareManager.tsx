import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Select, Row, Col, Typography } from 'antd';
import { MedicineBoxOutlined, SearchOutlined, HeartOutlined, AlertOutlined, CalendarOutlined } from '@ant-design/icons';
import { useANC } from '../hooks/useANC';
import ANCTable from '../components/ANCTable';
import StatCard from '@/shared/components/StatCard';
import dayjs from 'dayjs';
import type { Pregnancy } from '../services/ancService';

const { Title, Text } = Typography;

const ANCCareManager: React.FC = () => {
    const { pregnancies, loading } = useANC();
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState<string | null>(null);
    const [filteredData, setFilteredData] = useState<Pregnancy[]>([]);

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
        console.log('Viewing pregnancy detail:', record);
        // Could open a drawer with more details
    };

    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const isMobile = screenSize < 768;

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [tableHeight, setTableHeight] = useState(400);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === containerRef.current) {
                    setTableHeight(Math.max(200, entry.contentRect.height - 20));
                }
            }
        });

        if (containerRef.current) observer.observe(containerRef.current);
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
            color: '#fff0f6',
            iconColor: '#eb2f96'
        },
        {
            title: 'High Risk cases',
            value: stats.highRisk.toString(),
            trend: stats.highRisk > 0 ? 'Urgent' : 'None',
            isUp: false,
            icon: <AlertOutlined style={{ fontSize: 24 }} />,
            color: '#fff1f0',
            iconColor: '#ff4d4f'
        },
        {
            title: 'Due within 30 days',
            value: stats.dueSoon.toString(),
            trend: 'Soon',
            isUp: true,
            icon: <CalendarOutlined style={{ fontSize: 24 }} />,
            color: '#e6f7ff',
            iconColor: '#1890ff'
        },
        {
            title: '3rd Trimester',
            value: stats.trimester3.toString(),
            trend: 'Final',
            isUp: true,
            icon: <HeartOutlined style={{ fontSize: 24 }} />,
            color: '#f9f0ff',
            iconColor: '#722ed1'
        }
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s ease' }}>
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
                        background: 'linear-gradient(135deg, #eb2f96 0%, #ff85c0 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(235, 47, 150, 0.3)'
                    }}>
                        <MedicineBoxOutlined style={{ color: '#fff', fontSize: 24 }} />
                    </div>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>ANC Care Center</Title>
                        <Text type="secondary">Monitor and manage maternal health journeys</Text>
                    </div>
                </div>
            </div>

            <Row gutter={[20, 20]}>
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
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
                <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
                    <ANCTable
                        data={filteredData}
                        loading={loading}
                        onView={handleView}
                        scroll={{ x: 1100, y: tableHeight }}
                    />
                </div>
            </Card>
        </div>
    );
};

export default ANCCareManager;
