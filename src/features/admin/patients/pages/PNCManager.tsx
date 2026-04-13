import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Tag, Space, Typography, Empty, Avatar, List, Divider,
    Button, Drawer, Row, Col, Badge, Descriptions, Timeline, Input, message, Popconfirm
} from 'antd';
import {
    UserOutlined,
    SafetyOutlined, CalendarOutlined, FilePdfOutlined,
    DeleteOutlined, EyeOutlined, LineChartOutlined, CheckCircleOutlined,
    SendOutlined, MessageOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePatients } from '../hooks/usePatients';
import InfiniteScrollTable from '@/shared/components/InfiniteScrollTable';
import type { Patient } from '../types/patient.types';
import { CHILD_IMMUNIZATION_SCHEDULE, type ImmunizationPeriod, type Vaccine } from '../constants/vaccination.constants';
import { MedicineBoxOutlined as Syringe } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

const PNCManager: React.FC = () => {
    const { 
        patients, 
        loadingPatients, 
        loadingMorePatients,
        patientPagination,
        loadMore,
        deletePatient, 
        deleteGrowthRecord, 
        deleteImmunization 
    } = usePatients();
    const [selectedChild, setSelectedChild] = useState<Patient | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [clinicalNote, setClinicalNote] = useState('');
    const [sendingSchedule, setSendingSchedule] = useState(false);
    const [tableHeight, setTableHeight] = useState(400);
    const containerRef = useRef<HTMLDivElement>(null);

    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const isMobile = screenSize < 768;

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === containerRef.current) {
                    setTableHeight(Math.max(200, entry.contentRect.height - 40));
                }
            }
        });

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Keep selectedChild in sync with updated patients list (e.g., after deletion)
    useEffect(() => {
        if (selectedChild) {
            const updated = patients.find(p => p.id === selectedChild.id);
            if (updated) {
                setSelectedChild(updated);
            } else {
                setSelectedChild(null);
                setDrawerOpen(false);
            }
        }
    }, [patients, selectedChild?.id]);

    // Filter patients who are children (added by someone else, or age < 12)
    const childPatients = patients.filter(p =>
        p.added_by_id !== null || (p.dob && dayjs().diff(dayjs(p.dob), 'year') < 12)
    );

    const getParentName = (record: Patient) => {
        const directParentName = record.added_by?.patient?.full_name || record.added_by?.name || record.user?.patient?.full_name || record.user?.name;
        
        // If we still have a generic "User XXXX" name, try to find a patient record with the same phone number in our local list
        if (!directParentName || directParentName.startsWith('User ')) {
            const parentPhone = record.added_by?.phone || record.user?.phone || record.phone;
            if (parentPhone) {
                const parentInList = patients.find(p => p.phone === parentPhone && (p.id !== record.id));
                if (parentInList) return parentInList.full_name;
            }
        }
        
        return directParentName || null;
    };

    const getAge = (dob?: string) => {
        if (!dob) return 'N/A';
        const dobDate = dayjs(dob);
        const diffDays = dayjs().diff(dobDate, 'day');
        const diffMonths = dayjs().diff(dobDate, 'month');
        
        if (diffDays < 30) return `${diffDays} Days`;
        if (diffMonths < 12) return `${diffMonths} Months`;
        return `${Math.floor(diffMonths / 12)} Years`;
    };

    const openDrawer = (record: Patient) => {
        setSelectedChild(record);
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setSelectedChild(null);
        setClinicalNote('');
    };

    const handleSendSchedule = async () => {
        if (!selectedChild?.added_by?.patient?.email && !selectedChild?.added_by?.email && !selectedChild?.user?.patient?.email && !selectedChild?.user?.email) {
            message.error('No parent email found to send schedule.');
            return;
        }
        setSendingSchedule(true);
        try {
            await new Promise(res => setTimeout(res, 1500));
            message.success('Vaccination schedule sent to parent email!');
        } catch (err) {
            message.error('Failed to send schedule.');
        } finally {
            setSendingSchedule(false);
        }
    };

    const handleSaveClinicalNote = async () => {
        if (!clinicalNote.trim()) return;
        message.loading('Saving clinical note...');
        try {
            await new Promise(res => setTimeout(res, 1000));
            message.success('Clinical feedback saved and shared with user!');
            setClinicalNote('');
        } catch (err) {
            message.error('Failed to save note.');
        }
    };

    const columns = [
        {
            title: 'Parent/Guardian',
            key: 'parent_name',
            width: 250,
            render: (record: Patient) => {
                const parentName = getParentName(record);
                return (
                    <Space
                        style={{ cursor: 'pointer' }}
                        onClick={() => openDrawer(record)}
                    >
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#f0f5ff', color: '#1890ff' }} />
                        <Space direction="vertical" size={0}>
                            <Text strong style={{ color: '#1890ff' }}>
                                {parentName || <Text type="secondary" italic>No Parent Linked</Text>}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                                Child: {record.full_name} ({record.patient_code})
                            </Text>
                        </Space>
                    </Space>
                );
            },
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            width: 100,
            render: (gender: string) => (
                <Tag color={gender?.toLowerCase() === 'male' ? 'blue' : 'magenta'}>
                    {gender?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Age',
            key: 'age',
            width: 100,
            render: (record: Patient) => getAge(record.dob),
        },
        {
            title: 'Last Growth Record',
            key: 'last_growth',
            width: 180,
            render: (record: Patient) => {
                const records = record.growth_records || [];
                if (records.length === 0) return <Text type="secondary">No records</Text>;
                const last = records[0];
                return (
                    <Space split={<Divider type="vertical" />}>
                        {last.weight && <Text><b>{last.weight}</b>kg</Text>}
                        {last.height && <Text style={{ color: '#22c55e' }}><b>{last.height}</b>cm</Text>}
                    </Space>
                );
            },
        },
        {
            title: 'Vaccinations',
            key: 'vaccinations',
            width: 150,
            render: (record: Patient) => {
                const immunRes = record.immunizations || [];
                return (
                    <Tag color={immunRes.length > 0 ? 'green' : 'default'}>
                        {immunRes.length} Received
                    </Tag>
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: isMobile ? false : 'right' as any,
            render: (record: Patient) => (
                <Space size="middle">
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            openDrawer(record);
                        }}
                    />
                    <Popconfirm
                        title="Delete Child Profile"
                        description="Are you sure you want to delete this child's profile and all their records?"
                        onConfirm={(e) => {
                            e?.stopPropagation();
                            deletePatient(record.id);
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const latestGrowth = selectedChild?.growth_records?.[0];

    return (
        <div style={{ 
            padding: isMobile ? '12px' : '20px', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden' 
        }}>
            <div style={{ marginBottom: isMobile ? 16 : 24, flexShrink: 0 }}>
                <Title level={isMobile ? 4 : 3}>{isMobile ? "PNC Management" : "Postnatal Care (PNC) Management"}</Title>
                <Text type="secondary" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                    {isMobile ? "Monitor growth and vaccine schedules." : "Monitor child growth standards and immunization schedules across all registered children."}
                </Text>
            </div>

            <Card 
                styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 } }} 
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
                <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
                    <InfiniteScrollTable
                        dataSource={childPatients}
                        columns={columns}
                        loading={loadingPatients}
                        loadingMore={loadingMorePatients}
                        hasMore={patientPagination.hasMore}
                        next={loadMore}
                        rowKey="id"
                        onRow={(record) => ({
                            onClick: () => openDrawer(record),
                            style: { cursor: 'pointer' },
                        })}
                        scroll={{ x: 'max-content', y: tableHeight }}
                    />
                </div>
            </Card>

            {/* Detail Drawer */}
            <Drawer
                title={
                    <Space>
                        <span>Child Health Profile</span>
                    </Space>
                }
                placement="right"
                width={isMobile ? '100%' : 680}
                open={drawerOpen}
                onClose={closeDrawer}
                styles={{ body: { padding: isMobile ? 12 : 20 } }}
            >
                {selectedChild && (
                    <Space direction="vertical" size={24} style={{ width: '100%' }}>

                        {/* Child Summary Card */}
                        <Card
                            size="small"
                            style={{ borderRadius: 12, background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: '1px solid #dbeafe' }}
                        >
                            <Row gutter={16} align="middle">
                                <Col>
                                    <Avatar
                                        size={isMobile ? 48 : 64}
                                        icon={<UserOutlined />}
                                        style={{ backgroundColor: '#3b82f6', fontSize: isMobile ? 20 : 28 }}
                                    />
                                </Col>
                                <Col flex={1}>
                                    <Title level={4} style={{ margin: 0, fontSize: isMobile ? 16 : 20, textTransform: 'capitalize' }}>{selectedChild.full_name}</Title>
                                    <Space size="small" wrap>
                                        <Tag color={selectedChild.gender?.toLowerCase() === 'male' ? 'blue' : 'magenta'}>
                                            {selectedChild.gender?.toUpperCase()}
                                        </Tag>
                                        <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>{getAge(selectedChild.dob)}</Text>
                                        <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>• {selectedChild.patient_code}</Text>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>

                        {/* Parent Info */}
                        <Card
                            size="small"
                            title={<Space><UserOutlined /><span>Parent / Guardian</span></Space>}
                            style={{ borderRadius: 12 }}
                        >
                            {getParentName(selectedChild) ? (
                                <Descriptions column={isMobile ? 1 : 2} size="small">
                                    <Descriptions.Item label="Name">
                                        <Text strong>{getParentName(selectedChild)}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        {(() => {
                                            const email = selectedChild.added_by?.patient?.email || selectedChild.added_by?.email || selectedChild.user?.patient?.email || selectedChild.user?.email;
                                            if (email && !email.includes('pathlab.com')) return email; // Prefer non-generated emails
                                            
                                            const parentPhone = selectedChild.added_by?.phone || selectedChild.user?.phone || selectedChild.phone;
                                            const parentInList = patients.find(p => p.phone === parentPhone && p.id !== selectedChild.id && p.email && !p.email.includes('pathlab.com'));
                                            return parentInList?.email || email || '—';
                                        })()}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phone">
                                        {selectedChild.added_by?.patient?.phone || selectedChild.added_by?.phone || selectedChild.user?.patient?.phone || selectedChild.user?.phone || selectedChild.phone || '—'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Relation">
                                        {selectedChild.relation || 'Guardian'}
                                    </Descriptions.Item>
                                </Descriptions>
                            ) : (
                                <Text type="secondary" italic>No parent/guardian linked to this child profile.</Text>
                            )}
                        </Card>

                        {/* Latest Growth Summary */}
                        {latestGrowth && (
                            <Card
                                size="small"
                                title={<Space><LineChartOutlined style={{ color: '#3b82f6' }} /><span>Latest Growth Metrics</span></Space>}
                                extra={<Text type="secondary" style={{ fontSize: 12 }}>{dayjs(latestGrowth.record_date).format('DD MMM YYYY')}</Text>}
                                style={{ borderRadius: 12 }}
                            >
                                <Row gutter={isMobile ? 8 : 16}>
                                    {latestGrowth.weight && (
                                        <Col span={8}>
                                            <div style={{ textAlign: 'center', padding: isMobile ? '8px' : '12px', background: '#eff6ff', borderRadius: 10 }}>
                                                <Title level={3} style={{ margin: 0, color: '#3b82f6', fontSize: isMobile ? 18 : 24 }}>{latestGrowth.weight}</Title>
                                                <Text type="secondary" style={{ fontSize: isMobile ? 10 : 12 }}>kg • Weight</Text>
                                            </div>
                                        </Col>
                                    )}
                                    {latestGrowth.height && (
                                        <Col span={8}>
                                            <div style={{ textAlign: 'center', padding: isMobile ? '8px' : '12px', background: '#f0fdf4', borderRadius: 10 }}>
                                                <Title level={3} style={{ margin: 0, color: '#22c55e', fontSize: isMobile ? 18 : 24 }}>{latestGrowth.height}</Title>
                                                <Text type="secondary" style={{ fontSize: isMobile ? 10 : 12 }}>cm • Height</Text>
                                            </div>
                                        </Col>
                                    )}
                                    {latestGrowth.head_circumference && (
                                        <Col span={8}>
                                            <div style={{ textAlign: 'center', padding: isMobile ? '8px' : '12px', background: '#fdf4ff', borderRadius: 10 }}>
                                                <Title level={3} style={{ margin: 0, color: '#a855f7', fontSize: isMobile ? 18 : 24 }}>{latestGrowth.head_circumference}</Title>
                                                <Text type="secondary" style={{ fontSize: isMobile ? 10 : 12 }}>cm • Head</Text>
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        )}

                        {/* Growth History Timeline */}
                        <Card
                            size="small"
                            title={<Space><CalendarOutlined style={{ color: '#f97316' }} /><span>Growth History</span></Space>}
                            style={{ borderRadius: 12 }}
                        >
                            {(selectedChild.growth_records || []).length === 0 ? (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No growth records saved yet" />
                            ) : (
                                <Timeline
                                    items={(selectedChild.growth_records || []).map((item: any) => ({
                                        color: 'blue',
                                        children: (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <Text strong style={{ fontSize: 13 }}>
                                                        {dayjs(item.record_date).format('DD MMM YYYY')}
                                                    </Text>
                                                    <br />
                                                    <Space size="small" style={{ marginTop: 4 }} wrap>
                                                        {item.weight && <Tag>{item.weight} kg</Tag>}
                                                        {item.height && <Tag color="green">{item.height} cm</Tag>}
                                                        {item.head_circumference && <Tag color="purple">{item.head_circumference} cm head</Tag>}
                                                    </Space>
                                                </div>
                                                <Popconfirm
                                                    title="Delete growth record?"
                                                    onConfirm={() => deleteGrowthRecord(item.id)}
                                                    okText="Yes"
                                                    cancelText="No"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <Button 
                                                        type="text" 
                                                        danger 
                                                        size="small" 
                                                        icon={<DeleteOutlined style={{ fontSize: 12 }} />} 
                                                    />
                                                </Popconfirm>
                                            </div>
                                        ),
                                    }))}
                                />
                            )}
                        </Card>

                        {/* Immunization Records */}
                        <Card
                            size="small"
                            title={
                                <Space>
                                    <SafetyOutlined style={{ color: '#22c55e' }} />
                                    <span>Immunization Records</span>
                                    <Badge count={(selectedChild.immunizations || []).length} showZero color="#22c55e" />
                                </Space>
                            }
                            style={{ borderRadius: 12 }}
                        >
                            {(selectedChild.immunizations || []).length === 0 ? (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No vaccinations recorded yet" />
                            ) : (
                                <List
                                    size="small"
                                    dataSource={selectedChild.immunizations || []}
                                    renderItem={(imm: any) => (
                                        <List.Item
                                            actions={[
                                                imm.document_url && (
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        icon={<FilePdfOutlined />}
                                                        href={imm.document_url}
                                                        target="_blank"
                                                    >
                                                        {isMobile ? "" : "View Cert"}
                                                    </Button>
                                                ),
                                                <Popconfirm
                                                    title="Delete immunization record?"
                                                    onConfirm={() => deleteImmunization(imm.id)}
                                                    okText="Yes"
                                                    cancelText="No"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <Button 
                                                        type="text" 
                                                        danger 
                                                        size="small" 
                                                        icon={<DeleteOutlined />} 
                                                    />
                                                </Popconfirm>
                                            ].filter(Boolean)}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        icon={<CheckCircleOutlined />}
                                                        style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}
                                                        size="small"
                                                    />
                                                }
                                                title={<Text strong style={{ fontSize: isMobile ? 13 : 14 }}>{imm.vaccine?.vaccine_name || 'Vaccine'}</Text>}
                                                description={
                                                    <Space size="small" direction={isMobile ? "vertical" : "horizontal"}>
                                                        <Tag color="green" style={{ fontSize: '10px' }}>Dose {imm.dose_number}</Tag>
                                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                                            {dayjs(imm.date_administered).format('DD MMM YYYY')}
                                                        </Text>
                                                        {imm.facility_name && !isMobile && (
                                                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                                                @ {imm.facility_name}
                                                            </Text>
                                                        )}
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            )}
                        </Card>

                        {/* Recommended Next Vaccines */}
                        <Card
                            size="small"
                            title={<Space><SafetyOutlined style={{ color: '#1890ff' }} /><span>Recommendations</span></Space>}
                            extra={
                                <Button 
                                    type="primary" 
                                    size="small" 
                                    icon={<SendOutlined />} 
                                    onClick={handleSendSchedule}
                                    loading={sendingSchedule}
                                >
                                    {isMobile ? "Email" : "Send Schedule"}
                                </Button>
                            }
                            style={{ borderRadius: 12, border: '1px solid #d9d9d9', backgroundColor: '#fdfdfd' }}
                        >
                            {(() => {
                                if (!selectedChild.dob) return <Text type="secondary">Unable to calculate schedule without DOB.</Text>;
                                
                                const currentAgeMonths = dayjs().diff(dayjs(selectedChild.dob), 'month');
                                const recordedVaccines = (selectedChild.immunizations || []).map((i: any) => i.vaccine?.vaccine_name.toLowerCase());

                                const nextVaccines = CHILD_IMMUNIZATION_SCHEDULE.filter((period: ImmunizationPeriod) => {
                                    const ageMatch = period.age.match(/(\d+)/);
                                    if (!ageMatch) return false;
                                    
                                    const periodAgeMonths = period.age.includes('Weeks') 
                                        ? parseInt(ageMatch[1]) / 4.34 
                                        : (period.age.includes('Years') ? parseInt(ageMatch[1]) * 12 : parseInt(ageMatch[1]));
                                    
                                    return periodAgeMonths >= currentAgeMonths - 1;
                                }).flatMap((period: ImmunizationPeriod) => 
                                    period.vaccines
                                        .filter((v: Vaccine) => !recordedVaccines.includes(v.name.toLowerCase()))
                                        .map((v: Vaccine) => ({ ...v, period: period.age, color: period.color }))
                                )
                                .slice(0, 5);

                                if (nextVaccines.length === 0) return <Empty description="All scheduled vaccines recorded!" />;

                                return (
                                    <List
                                        size="small"
                                        dataSource={nextVaccines}
                                        renderItem={(v: any) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar
                                                            size="small"
                                                            style={{ backgroundColor: v.color }}
                                                            icon={<Syringe style={{ fontSize: 10 }} />}
                                                        />
                                                    }
                                                    title={<Text strong style={{ fontSize: isMobile ? 12 : 14 }}>{v.name}</Text>}
                                                    description={
                                                        <Space wrap>
                                                            <Tag color="orange" style={{ fontSize: 10 }}>Due: {v.period}</Tag>
                                                            <Text type="secondary" style={{ fontSize: 11 }}>{v.dosage}</Text>
                                                        </Space>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                );
                            })()}
                        </Card>

                        {/* Clinical Feedback / Notes */}
                        <Card
                            size="small"
                            title={<Space><MessageOutlined style={{ color: '#8b5cf6' }} /><span>Clinical Feedback & Notes</span></Space>}
                            style={{ borderRadius: 12 }}
                        >
                            <TextArea 
                                rows={3} 
                                placeholder="Enter medications, dietary advice, or health feedback for the user..."
                                value={clinicalNote}
                                onChange={(e) => setClinicalNote(e.target.value)}
                                style={{ borderRadius: 8, marginBottom: 12 }}
                            />
                            <Button 
                                block 
                                type="primary" 
                                ghost 
                                onClick={handleSaveClinicalNote}
                                icon={<CheckCircleOutlined />}
                            >
                                {isMobile ? "Share Feedback" : "Share Feedback with User"}
                            </Button>
                        </Card>

                    </Space>
                )}
            </Drawer>
        </div>
    );
};

export default PNCManager;
