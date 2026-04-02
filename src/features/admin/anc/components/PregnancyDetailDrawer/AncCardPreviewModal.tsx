import React, { useState, useRef } from 'react';
import { Modal, Button, Tooltip, Tag, Input, InputNumber, Select, Space, Divider } from 'antd';
import {
    FilePdfOutlined,
    EditOutlined,
    CheckOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Pregnancy } from '../../services/ancService';
import { generateAncPdf } from '../../utils/ancPdfGenerator';
import { formatName } from '@/shared/utils/nameUtils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
    const [editing, setEditing] = useState(false);
    const [generating, setGenerating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Local editable state — mirrors the Pregnancy data
    const [fields, setFields] = useState(() => initFields(data));

    // Re-initialise when modal opens with fresh data
    React.useEffect(() => {
        if (open && data) setFields(initFields(data));
        if (!open) setEditing(false);
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

    const primaryColor = '#004aad';
    const riskColor = fields.risk_level === 'High' ? '#dc0000' : fields.risk_level === 'Medium' ? '#fa8c16' : '#00a854';

    /** Download: capture the HTML card as canvas → PDF */
    const handleDownloadPdf = async () => {
        if (!cardRef.current) {
            // fallback to jspdf generator using original data
            if (data) generateAncPdf(data);
            return;
        }
        setGenerating(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfW = pdf.internal.pageSize.getWidth();
            const pdfH = (canvas.height * pdfW) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
            pdf.save(`ANC_Card_${fields.patient_code}_${dayjs().format('YYYYMMDD')}.pdf`);
        } finally {
            setGenerating(false);
        }
    };

    const cardStyle: React.CSSProperties = {
        fontFamily: 'Helvetica, Arial, sans-serif',
        background: '#fff',
        color: '#222',
        fontSize: 13,
    };

    return (
        <Modal
            open={open}
            onCancel={() => { setEditing(false); onCancel(); }}
            width={720}
            centered
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                    <span>ANC Card Preview</span>
                    {editing && (
                        <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>
                            ✏️ Edit Mode
                        </Tag>
                    )}
                </div>
            }
            footer={
                <Space>
                    {editing ? (
                        <>
                            <Button
                                icon={<CloseOutlined />}
                                onClick={() => { setFields(initFields(data)); setEditing(false); }}
                            >
                                Cancel Edits
                            </Button>
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => setEditing(false)}
                                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                            >
                                Done Editing
                            </Button>
                        </>
                    ) : (
                        <Tooltip title="Click fields in the preview to edit them inline">
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => setEditing(true)}
                            >
                                Edit Fields
                            </Button>
                        </Tooltip>
                    )}
                    <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        loading={generating}
                        onClick={handleDownloadPdf}
                        style={{ background: primaryColor, borderColor: primaryColor }}
                    >
                        Download PDF
                    </Button>
                </Space>
            }
            styles={{ body: { padding: 0, maxHeight: '78vh', overflowY: 'auto', background: '#f0f2f5' } }}
        >
            {/* ─── LIVE HTML ANC CARD ─────────────────────────────── */}
            <div style={{ padding: '16px 20px' }}>
                <div ref={cardRef} style={cardStyle}>

                    {/* HEADER */}
                    <div style={{ background: primaryColor, padding: '22px 20px 14px', borderRadius: '6px 6px 0 0' }}>
                        <div style={{ textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>
                            ANTENATAL CARE (ANC) CARD
                        </div>
                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 }}>
                            Pathlab Maternal Health Care Center • Clinical Journey Record
                        </div>
                        <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 6 }}>
                            Card Generated: {dayjs().format('DD MMM YYYY, HH:mm')}
                        </div>
                    </div>

                    <div style={{ border: '1px solid #d9d9d9', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '16px 20px' }}>

                        {/* PATIENT PROFILE */}
                        <div style={{ color: primaryColor, fontWeight: 700, fontSize: 13, letterSpacing: 0.5, marginBottom: 6 }}>PATIENT PROFILE</div>
                        <Divider style={{ margin: '0 0 12px' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 14 }}>
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
                        <Divider style={{ margin: '0 0 12px' }} />

                        {/* G / P / A / L boxes */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                            {(['gravida', 'para', 'abortions', 'living_children'] as const).map((key, i) => {
                                const labels = ['Gravida', 'Para', 'Abortion', 'Living'];
                                return (
                                    <div key={key} style={{ flex: 1, border: `1.5px solid ${primaryColor}`, borderRadius: 6, padding: '8px 4px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>{labels[i]}</div>
                                        <EditableField
                                            value={fields[key]}
                                            onChange={set(key)}
                                            editing={editing}
                                            type="number"
                                            style={{ fontSize: 18, fontWeight: 700 }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* LMP / EDD */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 16 }}>
                            <div>
                                <span style={{ fontWeight: 600, fontSize: 12 }}>LMP Date: </span>
                                {editing ? (
                                    <EditableField value={fields.lmp_date} onChange={set('lmp_date')} editing={editing} type="date" style={{ fontSize: 12 }} />
                                ) : (
                                    <span style={{ fontSize: 12 }}>{dayjs(fields.lmp_date).format('DD MMM YYYY')}</span>
                                )}
                            </div>
                            <div>
                                <span style={{ fontWeight: 600, fontSize: 12 }}>EDD Date: </span>
                                {editing ? (
                                    <EditableField value={fields.edd_date} onChange={set('edd_date')} editing={editing} type="date" style={{ fontSize: 12 }} />
                                ) : (
                                    <span style={{ fontSize: 12, color: '#dc0000', fontWeight: 600 }}>{dayjs(fields.edd_date).format('DD MMM YYYY')}</span>
                                )}
                            </div>
                        </div>

                        {/* ANTENATAL VISIT LOG */}
                        <div style={{ color: primaryColor, fontWeight: 700, fontSize: 13, letterSpacing: 0.5, marginBottom: 6 }}>ANTENATAL VISIT LOG</div>
                        <Divider style={{ margin: '0 0 10px' }} />

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                                <tr style={{ background: primaryColor, color: '#fff' }}>
                                    {['Visit Date', 'Week', 'Weight (kg)', 'BP (mmHg)', 'Notes'].map(h => (
                                        <th key={h} style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 600 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(!fields.visits || fields.visits.length === 0) ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: 14, color: '#aaa', fontSize: 12 }}>
                                            No visits recorded yet
                                        </td>
                                    </tr>
                                ) : fields.visits.map((v: any, idx: number) => (
                                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#f8f9ff' : '#fff' }}>
                                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{dayjs(v.visit_date).format('DD MMM YYYY')}</td>
                                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>W{v.gestational_age_weeks}</td>
                                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{v.weight_kg ? `${v.weight_kg} kg` : '—'}</td>
                                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{v.bp_systolic}/{v.bp_diastolic}</td>
                                        <td style={{ padding: '6px 8px' }}>{v.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* FOOTER */}
                        <div style={{ marginTop: 18, borderTop: '1px solid #eee', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <div style={{ fontSize: 10, color: '#aaa', fontStyle: 'italic' }}>
                                    This is a computer-generated clinical record and does not require a physical signature.
                                </div>
                                <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Reported by Pathlab Admin Services</div>
                            </div>
                            <div style={{ background: primaryColor, color: '#fff', padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                                PATHLAB ANC
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {/* ─── END ANC CARD ─────────────────────────────────── */}
        </Modal>
    );
};

export default AncCardPreviewModal;
