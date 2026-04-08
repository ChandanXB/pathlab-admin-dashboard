import React, { useState } from 'react';
import {
    Card, Table, Tag, Space, Typography, Empty, Avatar, List, Divider,
    Button, Drawer, Row, Col, Badge, Descriptions, Timeline, Input, message
} from 'antd';
import {
    LineChartOutlined, CheckCircleOutlined, UserOutlined,
    SafetyOutlined, HeartOutlined, CalendarOutlined, FilePdfOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePatients } from '../hooks/usePatients';
import type { Patient } from '../types/patient.types';
import { CHILD_IMMUNIZATION_SCHEDULE, type ImmunizationPeriod, type Vaccine } from '../constants/vaccination.constants';
import { MedicineBoxOutlined as Syringe, SendOutlined, MessageOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

const PNCManager: React.FC = () => {
    const { patients, loadingPatients } = usePatients();
    const [selectedChild, setSelectedChild] = useState<Patient | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [clinicalNote, setClinicalNote] = useState('');
    const [sendingSchedule, setSendingSchedule] = useState(false);

    // Filter patients who are children (added by someone else, or age < 12)
    const childPatients = patients.filter(p =>
        p.added_by_id !== null || (p.dob && dayjs().diff(dayjs(p.dob), 'year') < 12)
    );

    const getParentName = (record: Patient) => {
        return record.added_by?.name || record.user?.name || null;
    };

    const getAge = (dob?: string) => {
        if (!dob) return 'N/A';
        const diffMonths = dayjs().diff(dayjs(dob), 'month');
        if (diffMonths < 1) return `${dayjs().diff(dayjs(dob), 'day')} Days`;
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
        if (!selectedChild?.added_by?.email && !selectedChild?.user?.email) {
            message.error('No parent email found to send schedule.');
            return;
        }
        setSendingSchedule(true);
        try {
            // Mock API call to send schedule
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
            // Logic to save the note as a growth record with remarks
            // This would call your addGrowthRecordToPatient API
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
                            <Text type="secondary" style={{ fontSize: '12px' }}>
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
            render: (gender: string) => (
                <Tag color={gender?.toLowerCase() === 'male' ? 'blue' : 'magenta'}>
                    {gender?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Age',
            key: 'age',
            render: (record: Patient) => getAge(record.dob),
        },
        {
            title: 'Last Growth Record',
            key: 'last_growth',
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
            render: (record: Patient) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => openDrawer(record)}
                >
                    View Details
                </Button>
            ),
        },
    ];

    const latestGrowth = selectedChild?.growth_records?.[0];

    return (
        <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={3}>Postnatal Care (PNC) Management</Title>
                <Text type="secondary">
                    Monitor child growth standards and immunization schedules across all registered children.
                </Text>
            </div>

            <Card styles={{ body: { padding: 0 } }}>
                <Table
                    dataSource={childPatients}
                    columns={columns}
                    loading={loadingPatients}
                    rowKey="id"
                    onRow={(record) => ({
                        onClick: () => openDrawer(record),
                        style: { cursor: 'pointer' },
                    })}
                    pagination={{ pageSize: 10, showTotal: (total) => `${total} children registered` }}
                />
            </Card>

            {/* Detail Drawer */}
            <Drawer
                title={
                    <Space>
                        <span>Child Health Profile</span>
                    </Space>
                }
                placement="right"
                width={680}
                open={drawerOpen}
                onClose={closeDrawer}
                styles={{ body: { padding: 20 } }}
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
                                        size={64}
                                        icon={<UserOutlined />}
                                        style={{ backgroundColor: '#3b82f6', fontSize: 28 }}
                                    />
                                </Col>
                                <Col flex={1}>
                                    <Title level={4} style={{ margin: 0 }}>{selectedChild.full_name}</Title>
                                    <Space size="small">
                                        <Tag color={selectedChild.gender?.toLowerCase() === 'male' ? 'blue' : 'magenta'}>
                                            {selectedChild.gender?.toUpperCase()}
                                        </Tag>
                                        <Text type="secondary">{getAge(selectedChild.dob)}</Text>
                                        <Text type="secondary">• {selectedChild.patient_code}</Text>
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
                                <Descriptions column={2} size="small">
                                    <Descriptions.Item label="Name">
                                        <Text strong>{getParentName(selectedChild)}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        {selectedChild.added_by?.email || selectedChild.user?.email || '—'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phone">
                                        {selectedChild.added_by?.phone || selectedChild.user?.phone || '—'}
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
                                <Row gutter={16}>
                                    {latestGrowth.weight && (
                                        <Col span={8}>
                                            <div style={{ textAlign: 'center', padding: '12px', background: '#eff6ff', borderRadius: 10 }}>
                                                <Title level={3} style={{ margin: 0, color: '#3b82f6' }}>{latestGrowth.weight}</Title>
                                                <Text type="secondary">kg • Weight</Text>
                                            </div>
                                        </Col>
                                    )}
                                    {latestGrowth.height && (
                                        <Col span={8}>
                                            <div style={{ textAlign: 'center', padding: '12px', background: '#f0fdf4', borderRadius: 10 }}>
                                                <Title level={3} style={{ margin: 0, color: '#22c55e' }}>{latestGrowth.height}</Title>
                                                <Text type="secondary">cm • Height</Text>
                                            </div>
                                        </Col>
                                    )}
                                    {latestGrowth.head_circumference && (
                                        <Col span={8}>
                                            <div style={{ textAlign: 'center', padding: '12px', background: '#fdf4ff', borderRadius: 10 }}>
                                                <Title level={3} style={{ margin: 0, color: '#a855f7' }}>{latestGrowth.head_circumference}</Title>
                                                <Text type="secondary">cm • Head</Text>
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
                                            <div>
                                                <Text strong style={{ fontSize: 13 }}>
                                                    {dayjs(item.record_date).format('DD MMM YYYY')}
                                                </Text>
                                                <br />
                                                <Space size="small" style={{ marginTop: 4 }}>
                                                    {item.weight && <Tag>{item.weight} kg</Tag>}
                                                    {item.height && <Tag color="green">{item.height} cm</Tag>}
                                                    {item.head_circumference && <Tag color="purple">{item.head_circumference} cm head</Tag>}
                                                </Space>
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
                                                        View Cert
                                                    </Button>
                                                )
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
                                                title={<Text strong>{imm.vaccine?.vaccine_name || 'Vaccine'}</Text>}
                                                description={
                                                    <Space size="small">
                                                        <Tag color="green" style={{ fontSize: '10px' }}>Dose {imm.dose_number}</Tag>
                                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                                            {dayjs(imm.date_administered).format('DD MMM YYYY')}
                                                        </Text>
                                                        {imm.facility_name && (
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
                            title={<Space><SafetyOutlined style={{ color: '#1890ff' }} /><span>Recommended Next Vaccines</span></Space>}
                            extra={
                                <Button 
                                    type="primary" 
                                    size="small" 
                                    icon={<SendOutlined />} 
                                    onClick={handleSendSchedule}
                                    loading={sendingSchedule}
                                >
                                    Send Schedule
                                </Button>
                            }
                            style={{ borderRadius: 12, border: '1px solid #d9d9d9', backgroundColor: '#fdfdfd' }}
                        >
                            {(() => {
                                if (!selectedChild.dob) return <Text type="secondary">Unable to calculate schedule without DOB.</Text>;
                                
                                const currentAgeMonths = dayjs().diff(dayjs(selectedChild.dob), 'month');
                                const recordedVaccines = (selectedChild.immunizations || []).map((i: any) => i.vaccine?.vaccine_name.toLowerCase());

                                const nextVaccines = CHILD_IMMUNIZATION_SCHEDULE.filter((period: ImmunizationPeriod) => {
                                    // Logic to find pending vaccines for current or next age periods
                                    const ageMatch = period.age.match(/(\d+)/);
                                    if (!ageMatch) return false; // Skip 'Birth' for simplified demo or handle separately
                                    
                                    const periodAgeMonths = period.age.includes('Weeks') 
                                        ? parseInt(ageMatch[1]) / 4.34 
                                        : (period.age.includes('Years') ? parseInt(ageMatch[1]) * 12 : parseInt(ageMatch[1]));
                                    
                                    // Only show periods relevant to current age or slightly ahead
                                    return periodAgeMonths >= currentAgeMonths - 1;
                                }).flatMap((period: ImmunizationPeriod) => 
                                    period.vaccines
                                        .filter((v: Vaccine) => !recordedVaccines.includes(v.name.toLowerCase()))
                                        .map((v: Vaccine) => ({ ...v, period: period.age, color: period.color }))
                                )
                                .slice(0, 5); // Show top 5 pending

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
                                                    title={<Text strong>{v.name}</Text>}
                                                    description={
                                                        <Space>
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
                                Share Feedback with User
                            </Button>
                        </Card>

                    </Space>
                )}
            </Drawer>
        </div>
    );
};

export default PNCManager;
