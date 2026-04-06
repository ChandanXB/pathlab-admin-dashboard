import React, { useState, useRef } from 'react';
import { Modal, Button, Input, InputNumber, Select, Divider, Row, Col, Tooltip } from 'antd';
import {
    FilePdfOutlined,
    MailOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Pregnancy } from '../../services/ancService';
import { formatName } from '@/shared/utils/nameUtils';
import { shareAncCardViaBackend, downloadAncCardLocally } from '../../utils/ancShareHelper';
import { colors } from '@/styles/colors';
import { PATHLAB_STAMP_BASE64 } from '@/shared/constants/assets';

interface AncCardPreviewModalProps {
    open: boolean;
    data: Pregnancy | null;
    onCancel: () => void;
}

/** Inline editable field: shows plain text or an input depending on edit mode */
const EditableField: React.FC<{
    value: string | number;
    onChange: (val: any) => void;
    editing: boolean;
    type?: 'text' | 'number' | 'date' | 'select';
    options?: { value: string; label: string }[];
    style?: React.CSSProperties;
}> = ({ value, onChange, editing, type = 'text', options, style }) => {
    if (!editing) {
        return <span style={style}>{value}</span>;
    }
    if (type === 'number') {
        return (
            <InputNumber
                size="small"
                value={Number(value)}
                onChange={(v) => onChange(v ?? 0)}
                style={{ width: 60, ...style }}
                min={0}
            />
        );
    }
    if (type === 'date') {
        return (
            <Input
                size="small"
                type="date"
                value={dayjs(value as string).format('YYYY-MM-DD')}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: 140, ...style }}
            />
        );
    }
    if (type === 'select' && options) {
        return (
            <Select
                size="small"
                value={value as string}
                onChange={onChange}
                options={options}
                style={{ width: 110, ...style }}
            />
        );
    }
    return (
        <Input
            size="small"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: 160, ...style }}
        />
    );
};

const AncCardPreviewModal: React.FC<AncCardPreviewModalProps> = ({ open, data, onCancel }) => {
    const [sharing, setSharing] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const [editing] = useState(true);

    // Local editable state — mirrors the Pregnancy data
    const [fields, setFields] = useState(() => initFields(data));

    // Re-initialise when modal opens with fresh data
    React.useEffect(() => {
        if (open && data) setFields(initFields(data));
    }, [open, data]);

    function initFields(d: Pregnancy | null) {
        const defaults = {
            full_name: '',
            patient_code: '',
            anc_id: 'ANC-0000',
            phone: '',
            risk_level: 'Low',
            lmp_date: new Date().toISOString(),
            edd_date: new Date().toISOString(),
            gravida: 0,
            para: 0,
            abortions: 0,
            living_children: 0,
            visits: [],
            previous_complications: '',
        };

        if (!d) return defaults as any;

        return {
            full_name: formatName(d.mother.full_name),
            patient_code: d.mother.patient_code,
            anc_id: `ANC-${d.id.toString().padStart(4, '0')}`,
            phone: d.mother.phone,
            risk_level: d.risk_level || 'Low',
            lmp_date: d.lmp_date || new Date().toISOString(),
            edd_date: d.edd_date || new Date().toISOString(),
            gravida: d.gravida ?? 0,
            para: d.para ?? 0,
            abortions: d.abortions ?? 0,
            living_children: d.living_children ?? 0,
            visits: d.antenatal_visits || [],
            previous_complications: d.previous_complications || '',
        };
    }

    const set = (key: string) => (val: any) => setFields((prev: any) => ({ ...prev, [key]: val }));

    const primaryColor = colors.primary || '#004aad';
    const riskColor = fields.risk_level === 'High' ? '#dc0000' : fields.risk_level === 'Medium' ? '#fa8c16' : '#00a854';

    /** Share: Save to Backend via Helper */
    const handleShareViaEmail = async () => {
        if (!data) return;
        setSharing(true);
        const success = await shareAncCardViaBackend({
            element: cardRef.current,
            pregnancyData: data,
            fields: fields,
        });
        if (success) onCancel();
        setSharing(false);
    };

    /** Download: Save locally via Helper */
    const handleLocalDownload = async () => {
        setDownloading(true);
        await downloadAncCardLocally(cardRef.current, fields);
        setDownloading(false);
    };

    const cardStyle: React.CSSProperties = {
        fontFamily: 'Helvetica, Arial, sans-serif',
        background: '#fff',
        color: '#222',
        fontSize: 13,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRadius: 8,
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            width={850}
            centered
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                    <span>ANC Card Editor</span>
                </div>
            }
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        loading={downloading}
                        onClick={handleLocalDownload}
                        style={{ 
                            background: primaryColor, 
                            borderColor: primaryColor,
                            height: 40,
                            padding: '0 24px',
                            fontWeight: 600,
                            borderRadius: 8
                        }}
                    >
                        Save & Download PDF
                    </Button>
                </div>
            }
            styles={{ body: { padding: 0, maxHeight: '82vh', overflowY: 'auto', background: '#f8fafc' } }}
        >
            <Row gutter={0}>
                {/* ─── LEFT SIDEBAR: SHARED ACTIONS ────────────────────── */}
                <Col span={5} style={{ 
                    borderRight: '1px solid #e2e8f0', 
                    padding: '24px 16px', 
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }}>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Notify</div>
                        <Divider style={{ margin: '4px 0 12px' }} />
                        <Tooltip title="Send this ANC card directly to the patient's email via Pathlab NodeMailer">
                            <Button
                                block
                                type="default"
                                icon={<MailOutlined />}
                                loading={sharing}
                                onClick={handleShareViaEmail}
                                style={{ 
                                    height: 48,
                                    borderRadius: 12,
                                    borderColor: '#e2e8f0',
                                    color: primaryColor,
                                    fontWeight: 700,
                                    fontSize: 13,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                }}
                            >
                                Share via Email
                            </Button>
                        </Tooltip>
                    </div>

                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 10, color: '#0369a1', fontWeight: 700, marginBottom: 4 }}>SECURITY NOTE</div>
                        <div style={{ fontSize: 10, color: '#0ea5e9', lineHeight: 1.4 }}>
                            PDF is encrypted during transit. Email is sent to the verified patient address only.
                        </div>
                    </div>
                </Col>

                {/* ─── RIGHT CONTENT: ANC CARD ──────────────────────────── */}
                <Col span={19} style={{ padding: '30px 40px', background: '#f8fafc' }}>
                    <div ref={cardRef} style={cardStyle}>
                        {/* HEADER */}
                        <div style={{ background: primaryColor, padding: '22px 20px 14px', borderRadius: '8px 8px 0 0' }}>
                            <div style={{ textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>
                                ANTENATAL CARE (ANC) CARD
                            </div>
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 }}>
                                Pathlab Maternal Health Care Center • Clinical Journey Record
                            </div>
                        </div>

                        <div style={{ padding: '24px 30px' }}>
                            {/* PATIENT PROFILE */}
                            <div style={{ color: primaryColor, fontWeight: 700, fontSize: 13, letterSpacing: 0.5, marginBottom: 6 }}>PATIENT PROFILE</div>
                            <Divider style={{ margin: '0 0 16px' }} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 20 }}>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: 12 }}>ANC Reg. ID: </span>
                                    <span style={{ color: primaryColor, fontWeight: 600 }}>{fields.anc_id}</span>
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: 12 }}>Patient Code: </span>
                                    <span>{fields.patient_code}</span>
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: 12 }}>Full Name: </span>
                                    <EditableField value={fields.full_name} onChange={set('full_name')} editing={editing} />
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: 12 }}>Risk Level: </span>
                                    <EditableField
                                        value={fields.risk_level}
                                        onChange={set('risk_level')}
                                        editing={editing}
                                        type="select"
                                        options={[
                                            { value: 'Low', label: 'LOW' },
                                            { value: 'Medium', label: 'MEDIUM' },
                                            { value: 'High', label: 'HIGH' },
                                        ]}
                                        style={{ color: riskColor, fontWeight: 700 }}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: 12 }}>Contact No: </span>
                                    <EditableField value={fields.phone} onChange={set('phone')} editing={editing} />
                                </div>
                            </div>

                            {/* CLINICAL HIGHLIGHTS */}
                            <div style={{ color: primaryColor, fontWeight: 700, fontSize: 13, letterSpacing: 0.5, marginBottom: 6 }}>CLINICAL HIGHLIGHTS</div>
                            <Divider style={{ margin: '0 0 16px' }} />

                            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                                {(['gravida', 'para', 'abortions', 'living_children'] as const).map((key, i) => {
                                    const labels = ['Gravida', 'Para', 'Abortion', 'Living'];
                                    return (
                                        <div key={key} style={{ flex: 1, border: `1.5px solid ${primaryColor}22`, background: `${primaryColor}05`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>{labels[i]}</div>
                                            <EditableField
                                                value={fields[key]}
                                                onChange={set(key)}
                                                editing={editing}
                                                type="number"
                                                style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 20 }}>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: 12, display: 'block', marginBottom: 4 }}>LMP Date</span>
                                    <EditableField value={fields.lmp_date} onChange={set('lmp_date')} editing={editing} type="date" style={{ fontSize: 12 }} />
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: 12, display: 'block', marginBottom: 4 }}>EDD Date</span>
                                    <EditableField value={fields.edd_date} onChange={set('edd_date')} editing={editing} type="date" style={{ fontSize: 12, color: '#dc0000', fontWeight: 700 }} />
                                </div>
                            </div>

                            {/* VISIT LOG */}
                            <div style={{ color: primaryColor, fontWeight: 700, fontSize: 13, letterSpacing: 0.5, marginBottom: 6 }}>ANTENATAL VISIT LOG</div>
                            <Divider style={{ margin: '0 0 12px' }} />
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead>
                                    <tr style={{ background: primaryColor, color: '#fff' }}>
                                        {['Visit Date', 'Week', 'Weight', 'BP', 'Notes'].map(h => (
                                            <th key={h} style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(fields.visits || []).map((v: any, idx: number) => (
                                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#f8f9ff' : '#fff', borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>{dayjs(v.visit_date).format('DD MMM')}</td>
                                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>W{v.gestational_age_weeks}</td>
                                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>{v.weight_kg}kg</td>
                                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>{v.bp_systolic}/{v.bp_diastolic}</td>
                                            <td style={{ padding: '8px 10px', color: '#64748b' }}>{v.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* FOOTER CERTIFICATION & STAMP */}
                            <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic', maxWidth: '60%' }}>
                                    This clinical record is officially certified and digitally validated by Pathlab Diagnostics.
                                    <div style={{ color: '#64748b', fontStyle: 'normal', marginTop: 4 }}>Reported by Pathlab Maternal Health Services</div>
                                </div>
                                <img 
                                    src={PATHLAB_STAMP_BASE64} 
                                    alt="Certified Stamp" 
                                    crossOrigin="anonymous"
                                    style={{ width: 80, height: 80, opacity: 0.9, marginRight: 10 }} 
                                />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <style>{`
                .ant-input, .ant-input-number, .ant-select-selector {
                    border-color: #f1f5f9 !important;
                    background: transparent !important;
                    border-bottom: 2px solid ${primaryColor}22 !important;
                    border-radius: 0px !important;
                    padding-left: 0 !important;
                }
                .ant-input:focus, .ant-input-number-focused {
                    border-bottom-color: ${primaryColor} !important;
                    box-shadow: none !important;
                }
            `}</style>
        </Modal>
    );
};

export default AncCardPreviewModal;
