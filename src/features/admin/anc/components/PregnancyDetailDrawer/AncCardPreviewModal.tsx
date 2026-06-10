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

/** Inline editable field: shows plain text or a compact input depending on print/edit state */
const EditableField: React.FC<{
    value: string | number;
    onChange: (val: any) => void;
    editing: boolean;
    type?: 'text' | 'number' | 'date' | 'select';
    options?: { value: string; label: string }[];
    style?: React.CSSProperties;
    isPrinting?: boolean;
    placeholder?: string;
    className?: string;
}> = ({ value, onChange, editing, type = 'text', options, style, isPrinting, placeholder, className }) => {
    if (!editing || isPrinting) {
        if (type === 'date') {
            return <span style={{ ...style, display: 'inline-block' }}>{value ? dayjs(value as string).format('DD/MM/YY') : '—'}</span>;
        }
        return <span style={{ ...style, display: 'inline-block' }}>{value || '—'}</span>;
    }
    if (type === 'number') {
        return (
            <InputNumber
                size="small"
                value={value !== undefined && value !== '' ? Number(value) : undefined}
                onChange={(v) => onChange(v ?? '')}
                style={{ width: 45, fontSize: 10, ...style }}
                min={0}
                className={className}
            />
        );
    }
    if (type === 'date') {
        return (
            <input
                type="date"
                value={value ? dayjs(value as string).format('YYYY-MM-DD') : ''}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: 100, height: 18, padding: '0 2px', border: '1px solid #cbd5e1', borderRadius: 3, fontSize: 10, outline: 'none', ...style }}
                className={className}
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
                style={{ width: 75, fontSize: 10, ...style }}
                className={className}
            />
        );
    }
    return (
        <Input
            size="small"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: 85, fontSize: 10, padding: '0 4px', height: 18, ...style }}
            placeholder={placeholder}
            className={className}
        />
    );
};

/** Custom checkable box that renders beautifully both in browser and inside PDF canvases */
const EditableCheckbox: React.FC<{
    checked: boolean;
    onChange: (val: boolean) => void;
    editing: boolean;
    label: string;
    isPrinting?: boolean;
}> = ({ checked, onChange, editing, label, isPrinting }) => {
    const boxColor = '#334155';
    const checkColor = '#0f172a';
    
    const renderBox = () => (
        <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 12, 
            height: 12, 
            border: `1.5px solid ${editing && !isPrinting ? '#004aad' : boxColor}`, 
            borderRadius: 2,
            background: checked && editing && !isPrinting ? '#004aad0c' : 'transparent',
            position: 'relative',
            flexShrink: 0,
            boxSizing: 'border-box'
        }}>
            {checked && (
                <span style={{
                    display: 'block',
                    width: 3,
                    height: 6,
                    border: `solid ${editing && !isPrinting ? '#004aad' : checkColor}`,
                    borderWidth: '0 2px 2px 0',
                    transform: 'rotate(45deg)',
                    position: 'absolute',
                    top: 0,
                    left: 3
                }} />
            )}
        </span>
    );

    if (!editing || isPrinting) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                {renderBox()}
                <span>{label}</span>
            </div>
        );
    }
    return (
        <div 
            onClick={() => onChange(!checked)} 
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, cursor: 'pointer', userSelect: 'none' }}
        >
            {renderBox()}
            <span>{label}</span>
        </div>
    );
};

const AncCardPreviewModal: React.FC<AncCardPreviewModalProps> = ({ open, data, onCancel }) => {
    const [sharing, setSharing] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const [editing] = useState(true);

    // Local editable state — mirrors the Pregnancy booklet data model
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
            
            // Obstetric Complications default matching booklet ticks
            comp_aph: true,
            comp_eclampsia: true,
            comp_pih: true,
            comp_anaemia: true,
            comp_obstructed_labor: true,
            comp_pph: true,
            comp_lscs: true,
            comp_congenital_anomaly: true,
            comp_abortion: false,
            comp_other: false,

            // Past History default matching booklet ticks
            hist_tuberculosis: true,
            hist_hypertension: true,
            hist_heart_disease: true,
            hist_diabetes: true,
            hist_asthma: true,
            hist_others: '',

            // Physical Exam
            exam_height: '157 cm',
            exam_heart: '',
            exam_lungs: '',
            exam_breasts: '',

            // E-PMSMA Check-ups
            epmsma_1_date: '',
            epmsma_2_date: '',
            epmsma_3_date: '',

            // Essential Investigations defaults matching booklet scan
            inv_hemoglobin: '12gm',
            inv_urine_albumin: 'NIL',
            inv_urine_sugar: 'NIL',
            inv_hiv_screening: '',
            inv_syphilis: '',
            inv_ultrasound: '',
            inv_gestational_diabetes: '',
            inv_naat: '',
            blood_group: 'AB+ve',
            inv_date: '2025-01-21',
            inv_date_2: '2025-03-23',

            // Optional Investigations defaults matching booklet scan
            opt_tsh: '2.16',
            opt_tsh_date: '2025-01-21',
            opt_hbsag: 'neg',
            opt_hbsag_date: '2025-01-21',
            opt_blood_sugar: '75mg/119',
            opt_blood_sugar_date: '2025-01-21',
            opt_others: '',
            opt_others_date: '',
            
            visits: [] as any[],
        };

        if (!d) return defaults;

        // Build 5 columns for visits. Map DB logs to them.
        const dbVisits = d.antenatal_visits || [];
        const visits = Array.from({ length: 5 }, (_, i) => {
            const v = dbVisits[i] || {};
            // Prepopulate 1st visit column with booklet data if db is empty
            const isFirstVisitEmpty = (i === 0 && dbVisits.length === 0);
            return {
                visit_date: v.visit_date ? dayjs(v.visit_date).format('YYYY-MM-DD') : (isFirstVisitEmpty ? '2025-03-17' : ''),
                gestational_age_weeks: v.gestational_age_weeks || (isFirstVisitEmpty ? '19' : ''),
                weight_kg: v.weight_kg || (isFirstVisitEmpty ? '51' : ''),
                pulse_rate: v.pulse_rate || '',
                bp: v.bp_systolic && v.bp_diastolic ? `${v.bp_systolic}/${v.bp_diastolic}` : (isFirstVisitEmpty ? '98/58' : ''),
                pallor: v.pallor || (isFirstVisitEmpty ? 'No' : ''),
                oedema: v.oedema || (isFirstVisitEmpty ? 'No' : ''),
                jaundice: v.jaundice || (isFirstVisitEmpty ? 'No' : ''),
                complaints: v.complaints || (isFirstVisitEmpty ? 'No' : ''),
                cough_fever: v.cough_fever || (isFirstVisitEmpty ? 'No' : ''),
                no_weight_gain: v.no_weight_gain || (isFirstVisitEmpty ? 'No' : ''),
                night_sweat: v.night_sweat || (isFirstVisitEmpty ? 'No' : ''),
                localized_swelling: v.localized_swelling || (isFirstVisitEmpty ? 'No' : ''),
                
                // Abdominal exam
                fundal_height: v.fundal_height || '',
                lie_presentation: v.lie_presentation || '',
                fetal_movement: v.fetal_movement || '',
                fetal_heart_rate: v.fetal_heart_rate || '',
                pv_done: v.pv_done || '',
            };
        });

        return {
            ...defaults,
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
            previous_complications: d.previous_complications || '',
            visits,
        };
    }

    const set = (key: string) => (val: any) => setFields((prev: any) => ({ ...prev, [key]: val }));

    const primaryColor = colors.primary || '#004aad';
    const riskColor = fields.risk_level === 'High' ? '#dc0000' : fields.risk_level === 'Medium' ? '#fa8c16' : '#00a854';

    /** Share: Save to Backend via Helper */
    const handleShareViaEmail = async () => {
        if (!data) return;
        setSharing(true);
        // Wait for React to re-render print-friendly DOM (inputs replaced by spans)
        await new Promise((resolve) => setTimeout(resolve, 150));
        
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
        // Wait for React to re-render print-friendly DOM (inputs replaced by spans)
        await new Promise((resolve) => setTimeout(resolve, 150));
        
        await downloadAncCardLocally(cardRef.current, fields);
        setDownloading(false);
    };

    const cardStyle: React.CSSProperties = {
        fontFamily: 'Inter, Helvetica, Arial, sans-serif',
        background: '#fff',
        color: '#1e293b',
        fontSize: 11,
        width: 790,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        borderRadius: 8,
        margin: '0 auto',
        padding: '24px 30px',
        boxSizing: 'border-box',
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            width={1100}
            centered
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                    <span>ANC Card Editor & PDF Preview</span>
                </div>
            }
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 24px 20px' }}>
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
            styles={{ body: { padding: 0, maxHeight: '82vh', overflowY: 'auto', background: '#f1f5f9' } }}
        >
            <Row gutter={0}>
                {/* ─── LEFT SIDEBAR: ACTIONS ────────────────────── */}
                <Col span={6} style={{ 
                    borderRight: '1px solid #cbd5e1', 
                    padding: '24px 16px', 
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }}>
                    <div>
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
                                    height: 44,
                                    borderRadius: 8,
                                    borderColor: '#cbd5e1',
                                    color: primaryColor,
                                    fontWeight: 700,
                                    fontSize: 13,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}
                            >
                                Share via Email
                            </Button>
                        </Tooltip>
                    </div>

                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 10, color: '#0369a1', fontWeight: 700, marginBottom: 4 }}>PRINT PREVIEW MODE</div>
                        <div style={{ fontSize: 10, color: '#0ea5e9', lineHeight: 1.4 }}>
                            Modify the data inline in the template. The downloaded PDF will match this styled record exactly.
                        </div>
                    </div>
                </Col>

                {/* ─── RIGHT CONTENT: REDESIGNED ANC CARD ──────────────────────────── */}
                <Col span={18} style={{ padding: '24px 20px', background: '#f1f5f9', display: 'flex', justifyContent: 'center' }}>
                    <div ref={cardRef} style={cardStyle}>
                        {/* 1. CLINICAL HEADER */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2.5px solid ${primaryColor}`, paddingBottom: 10, marginBottom: 12 }}>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: primaryColor, letterSpacing: 0.5 }}>ANTENATAL CARE (ANC) CARD</div>
                                <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>Pathlab Maternal Health Care Center • Mother's Journey Book</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>ANC ID: <span style={{ color: primaryColor }}>{fields.anc_id}</span></div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>Patient Code: {fields.patient_code}</div>
                            </div>
                        </div>

                        {/* 2. PATIENT PROFILE & OBSTETRIC STATUS */}
                        <div style={{ display: 'grid', gridTemplateColumns: '4fr 3fr', gap: 14, marginBottom: 12 }}>
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', background: '#fafafa' }}>
                                <div style={{ fontWeight: 700, fontSize: 10, color: primaryColor, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Patient Details</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 10 }}>Full Name: </span>
                                        <EditableField value={fields.full_name} onChange={set('full_name')} editing={editing} isPrinting={sharing || downloading} style={{ fontWeight: 600 }} />
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 10 }}>Contact: </span>
                                        <EditableField value={fields.phone} onChange={set('phone')} editing={editing} isPrinting={sharing || downloading} />
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 10 }}>LMP Date: </span>
                                        <EditableField value={fields.lmp_date} onChange={set('lmp_date')} editing={editing} type="date" isPrinting={sharing || downloading} />
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 10 }}>EDD Date: </span>
                                        <EditableField value={fields.edd_date} onChange={set('edd_date')} editing={editing} type="date" isPrinting={sharing || downloading} style={{ color: '#dc0000', fontWeight: 600 }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', background: '#fafafa', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontWeight: 700, fontSize: 10, color: primaryColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>Obstetric Status</span>
                                    <span style={{ fontSize: 9 }}>
                                        Risk: <EditableField
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
                                            isPrinting={sharing || downloading}
                                        />
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {([ 'gravida', 'para', 'abortions', 'living_children' ] as const).map((key, i) => {
                                        const labels = ['Gravida', 'Para', 'Abortion', 'Living'];
                                        return (
                                            <div key={key} style={{ flex: 1, border: `1px solid ${primaryColor}1a`, background: '#fff', borderRadius: 4, padding: '4px 2px', textAlign: 'center' }}>
                                                <div style={{ fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>{labels[i]}</div>
                                                <EditableField
                                                    value={fields[key]}
                                                    onChange={set(key)}
                                                    editing={editing}
                                                    type="number"
                                                    style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', textAlign: 'center' }}
                                                    isPrinting={sharing || downloading}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 3. COMPLICATIONS & MEDICAL HISTORY */}
                        <div style={{ display: 'grid', gridTemplateColumns: '4fr 3fr', gap: 14, marginBottom: 12 }}>
                            {/* Complications */}
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px' }}>
                                <div style={{ fontWeight: 700, fontSize: 10, color: primaryColor, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>OBSTETRIC COMPLICATION IN PREVIOUS PREGNANCY</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px' }}>
                                    <EditableCheckbox checked={fields.comp_aph} onChange={set('comp_aph')} editing={editing} label="A. APH" isPrinting={sharing || downloading} />
                                    <EditableCheckbox checked={fields.comp_pih} onChange={set('comp_pih')} editing={editing} label="C. PIH" isPrinting={sharing || downloading} />
                                    <EditableCheckbox checked={fields.comp_obstructed_labor} onChange={set('comp_obstructed_labor')} editing={editing} label="E. Obstructed Labor" isPrinting={sharing || downloading} />
                                    <EditableCheckbox checked={fields.comp_lscs} onChange={set('comp_lscs')} editing={editing} label="G. LSCS" isPrinting={sharing || downloading} />
                                    <EditableCheckbox checked={fields.comp_abortion} onChange={set('comp_abortion')} editing={editing} label="I. Abortion" isPrinting={sharing || downloading} />
                                    <EditableCheckbox checked={fields.comp_eclampsia} onChange={set('comp_eclampsia')} editing={editing} label="B. Eclampsia" isPrinting={sharing || downloading} />
                                    <EditableCheckbox checked={fields.comp_anaemia} onChange={set('comp_anaemia')} editing={editing} label="D. Anaemia" isPrinting={sharing || downloading} />
                                    <EditableCheckbox checked={fields.comp_pph} onChange={set('comp_pph')} editing={editing} label="F. PPH" isPrinting={sharing || downloading} />
                                    <EditableCheckbox checked={fields.comp_congenital_anomaly} onChange={set('comp_congenital_anomaly')} editing={editing} label="H. Congenital Anomaly" isPrinting={sharing || downloading} />
                                    <EditableCheckbox checked={fields.comp_other} onChange={set('comp_other')} editing={editing} label="J. Other" isPrinting={sharing || downloading} />
                                </div>
                            </div>

                            {/* Past History & General Exam */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 10, color: primaryColor, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>PAST MEDICAL HISTORY</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px' }}>
                                        <EditableCheckbox checked={fields.hist_tuberculosis} onChange={set('hist_tuberculosis')} editing={editing} label="Tuberculosis" isPrinting={sharing || downloading} />
                                        <EditableCheckbox checked={fields.hist_hypertension} onChange={set('hist_hypertension')} editing={editing} label="Hypertension" isPrinting={sharing || downloading} />
                                        <EditableCheckbox checked={fields.hist_heart_disease} onChange={set('hist_heart_disease')} editing={editing} label="Heart Disease" isPrinting={sharing || downloading} />
                                        <EditableCheckbox checked={fields.hist_diabetes} onChange={set('hist_diabetes')} editing={editing} label="Diabetes" isPrinting={sharing || downloading} />
                                        <EditableCheckbox checked={fields.hist_asthma} onChange={set('hist_asthma')} editing={editing} label="Asthma" isPrinting={sharing || downloading} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ fontSize: 9, color: '#64748b' }}>Others:</span>
                                            <EditableField value={fields.hist_others} onChange={set('hist_others')} editing={editing} isPrinting={sharing || downloading} style={{ width: 60 }} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', background: '#fafafa' }}>
                                    <div style={{ fontWeight: 700, fontSize: 10, color: primaryColor, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>PHYSICAL EXAMINATION</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                                        <div>
                                            <span style={{ fontSize: 9, color: '#64748b' }}>Height:</span>
                                            <EditableField value={fields.exam_height} onChange={set('exam_height')} editing={editing} isPrinting={sharing || downloading} style={{ width: 50, marginLeft: 4 }} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 9, color: '#64748b' }}>Heart:</span>
                                            <EditableField value={fields.exam_heart} onChange={set('exam_heart')} editing={editing} isPrinting={sharing || downloading} style={{ width: 55, marginLeft: 4 }} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 9, color: '#64748b' }}>Lungs:</span>
                                            <EditableField value={fields.exam_lungs} onChange={set('exam_lungs')} editing={editing} isPrinting={sharing || downloading} style={{ width: 55, marginLeft: 4 }} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 9, color: '#64748b' }}>Breasts:</span>
                                            <EditableField value={fields.exam_breasts} onChange={set('exam_breasts')} editing={editing} isPrinting={sharing || downloading} style={{ width: 50, marginLeft: 4 }} placeholder="Inverted?" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. ANTENATAL VISITS & ABDOMINAL EXAMS (Combined 5-Column Table) */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 10, color: primaryColor, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>ANTENATAL VISITS & CLINICAL LOG</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, tableLayout: 'fixed' }} className="anc-visits-table">
                                <thead>
                                    <tr style={{ background: primaryColor, color: '#fff' }}>
                                        <th style={{ width: '28%', padding: '4px 6px', textAlign: 'left', fontWeight: 600 }}>Parameter / Visit Log</th>
                                        {[1, 2, 3, 4, '5 (PMSMA)'].map((col, idx) => (
                                            <th key={idx} style={{ width: '14.4%', padding: '4px 6px', textAlign: 'center', fontWeight: 600 }}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Date Row */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Date</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.visit_date}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].visit_date = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    type="date"
                                                    isPrinting={sharing || downloading}
                                                    style={{ width: '95%', fontSize: 9 }}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* POG Row */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>POG (Weeks)</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.gestational_age_weeks}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].gestational_age_weeks = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Weight Row */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Weight (Kg)</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.weight_kg}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].weight_kg = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Pulse Rate */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Pulse Rate</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.pulse_rate}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].pulse_rate = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Blood Pressure */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Blood Pressure (BP)</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.bp}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].bp = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Pallor */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Pallor</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.pallor}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].pallor = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Oedema */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Oedema</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.oedema}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].oedema = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Jaundice */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Jaundice</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.jaundice}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].jaundice = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Any Complaints */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Any Complaints</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.complaints}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].complaints = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Cough/Fever */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Cough/Fever (&gt; 2 wks)</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.cough_fever}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].cough_fever = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* No Weight Gain */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>No Weight Gain (last 3 mths)</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.no_weight_gain}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].no_weight_gain = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Night Sweat */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Night Sweat</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.night_sweat}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].night_sweat = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Localized swelling */}
                                    <tr style={{ borderBottom: `1.5px solid ${primaryColor}`, background: '#f8fafc' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Localized swelling in body</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.localized_swelling}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].localized_swelling = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* ABDOMINAL EXAMINATION TITLE ROW */}
                                    <tr style={{ background: `${primaryColor}14` }}>
                                        <td colSpan={6} style={{ padding: '4px 6px', fontWeight: 700, fontSize: 9, color: primaryColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            ABDOMINAL EXAMINATION
                                        </td>
                                    </tr>

                                    {/* Fundal Height */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Fundal Height (Weeks/cm)</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.fundal_height}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].fundal_height = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Lie/Presentation */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Lie/Presentation</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.lie_presentation}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].lie_presentation = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Fetal Movements */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Fetal Movements</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.fetal_movement}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].fetal_movement = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* FHR */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>Fetal Heart Rate / min</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.fetal_heart_rate}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].fetal_heart_rate = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* P/V Done */}
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>P/V if Done</td>
                                        {fields.visits.map((v: any, idx: number) => (
                                            <td key={idx} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                <EditableField
                                                    value={v.pv_done}
                                                    onChange={(val) => {
                                                        const newVisits = [...fields.visits];
                                                        newVisits[idx].pv_done = val;
                                                        set('visits')(newVisits);
                                                    }}
                                                    editing={editing}
                                                    isPrinting={sharing || downloading}
                                                    className="compact-input"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                            
                            {/* E-PMSMA Additional Check-ups */}
                            <div style={{ marginTop: 8, display: 'flex', gap: 14, alignItems: 'center', fontSize: 9, borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
                                <span style={{ fontWeight: 600, color: primaryColor }}>Additional ANC check-up under E-PMSMA:</span>
                                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                    <span>1st:</span>
                                    <EditableField value={fields.epmsma_1_date} onChange={set('epmsma_1_date')} editing={editing} type="date" isPrinting={sharing || downloading} style={{ fontSize: 9 }} />
                                </div>
                                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                    <span>2nd:</span>
                                    <EditableField value={fields.epmsma_2_date} onChange={set('epmsma_2_date')} editing={editing} type="date" isPrinting={sharing || downloading} style={{ fontSize: 9 }} />
                                </div>
                                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                    <span>3rd:</span>
                                    <EditableField value={fields.epmsma_3_date} onChange={set('epmsma_3_date')} editing={editing} type="date" isPrinting={sharing || downloading} style={{ fontSize: 9 }} />
                                </div>
                            </div>
                        </div>

                        {/* 5. INVESTIGATIONS (ESSENTIAL & OPTIONAL) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '13fr 8fr', gap: 14, marginBottom: 12 }}>
                            {/* Essential Investigations */}
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px' }}>
                                <div style={{ fontWeight: 700, fontSize: 10, color: primaryColor, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>ESSENTIAL INVESTIGATIONS</div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '3px 4px', fontWeight: 600, width: '60%' }}>Hemoglobin (Gms)</td>
                                            <td style={{ padding: '3px 4px' }}>
                                                <EditableField value={fields.inv_hemoglobin} onChange={set('inv_hemoglobin')} editing={editing} isPrinting={sharing || downloading} style={{ width: '90%' }} />
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '3px 4px', fontWeight: 600 }}>Urine Albumin</td>
                                            <td style={{ padding: '3px 4px' }}>
                                                <EditableField value={fields.inv_urine_albumin} onChange={set('inv_urine_albumin')} editing={editing} isPrinting={sharing || downloading} style={{ width: '90%' }} />
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '3px 4px', fontWeight: 600 }}>Urine Sugar</td>
                                            <td style={{ padding: '3px 4px' }}>
                                                <EditableField value={fields.inv_urine_sugar} onChange={set('inv_urine_sugar')} editing={editing} isPrinting={sharing || downloading} style={{ width: '90%' }} />
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '3px 4px', fontWeight: 600 }}>HIV Screening</td>
                                            <td style={{ padding: '3px 4px' }}>
                                                <EditableField value={fields.inv_hiv_screening} onChange={set('inv_hiv_screening')} editing={editing} isPrinting={sharing || downloading} style={{ width: '90%' }} />
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '3px 4px', fontWeight: 600 }}>Syphilis</td>
                                            <td style={{ padding: '3px 4px' }}>
                                                <EditableField value={fields.inv_syphilis} onChange={set('inv_syphilis')} editing={editing} isPrinting={sharing || downloading} style={{ width: '90%' }} />
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '3px 4px', fontWeight: 600 }}>Ultrasonography (Y/N)</td>
                                            <td style={{ padding: '3px 4px' }}>
                                                <EditableField value={fields.inv_ultrasound} onChange={set('inv_ultrasound')} editing={editing} isPrinting={sharing || downloading} style={{ width: '90%' }} />
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '3px 4px', fontWeight: 600 }}>Gestational Diabetes Mellitus</td>
                                            <td style={{ padding: '3px 4px' }}>
                                                <EditableField value={fields.inv_gestational_diabetes} onChange={set('inv_gestational_diabetes')} editing={editing} isPrinting={sharing || downloading} style={{ width: '90%' }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '3px 4px', fontWeight: 600 }}>NAAT test (if TB symptoms present)</td>
                                            <td style={{ padding: '3px 4px' }}>
                                                <EditableField value={fields.inv_naat} onChange={set('inv_naat')} editing={editing} isPrinting={sharing || downloading} style={{ width: '90%' }} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Right: Blood Group Box & Optional Intro */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ border: `1.5px dashed ${primaryColor}44`, background: `${primaryColor}04`, borderRadius: 6, padding: '10px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                    <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>Blood Group & Rh Typing</div>
                                    <EditableField 
                                        value={fields.blood_group} 
                                        onChange={set('blood_group')} 
                                        editing={editing} 
                                        isPrinting={sharing || downloading} 
                                        style={{ fontSize: 22, fontWeight: 800, color: primaryColor, margin: '2px 0', borderBottom: 'none', textAlign: 'center' }} 
                                    />
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 9, color: '#64748b', marginTop: 2 }}>
                                        <span>Date:</span>
                                        <EditableField value={fields.inv_date} onChange={set('inv_date')} editing={editing} type="date" isPrinting={sharing || downloading} style={{ fontSize: 9 }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 9, color: '#64748b', marginTop: 1 }}>
                                        <span>Date:</span>
                                        <EditableField value={fields.inv_date_2} onChange={set('inv_date_2')} editing={editing} type="date" isPrinting={sharing || downloading} style={{ fontSize: 9 }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Optional Investigations */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 10, color: primaryColor, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>OPTIONAL INVESTIGATIONS</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 9 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>
                                    <span style={{ fontWeight: 600 }}>1. Thyroid-Stimulating Hormone (TSH)</span>
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                        <EditableField value={fields.opt_tsh} onChange={set('opt_tsh')} editing={editing} isPrinting={sharing || downloading} style={{ width: 45 }} />
                                        <span style={{ color: '#94a3b8' }}>Date:</span>
                                        <EditableField value={fields.opt_tsh_date} onChange={set('opt_tsh_date')} editing={editing} type="date" isPrinting={sharing || downloading} style={{ fontSize: 9 }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>
                                    <span style={{ fontWeight: 600 }}>3. Blood Sugar</span>
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                        <EditableField value={fields.opt_blood_sugar} onChange={set('opt_blood_sugar')} editing={editing} isPrinting={sharing || downloading} style={{ width: 45 }} />
                                        <span style={{ color: '#94a3b8' }}>Date:</span>
                                        <EditableField value={fields.opt_blood_sugar_date} onChange={set('opt_blood_sugar_date')} editing={editing} type="date" isPrinting={sharing || downloading} style={{ fontSize: 9 }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 2 }}>
                                    <span style={{ fontWeight: 600 }}>2. Hbs Ag.</span>
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                        <EditableField value={fields.opt_hbsag} onChange={set('opt_hbsag')} editing={editing} isPrinting={sharing || downloading} style={{ width: 45 }} />
                                        <span style={{ color: '#94a3b8' }}>Date:</span>
                                        <EditableField value={fields.opt_hbsag_date} onChange={set('opt_hbsag_date')} editing={editing} type="date" isPrinting={sharing || downloading} style={{ fontSize: 9 }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 2 }}>
                                    <span style={{ fontWeight: 600 }}>4. Others</span>
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                        <EditableField value={fields.opt_others} onChange={set('opt_others')} editing={editing} isPrinting={sharing || downloading} style={{ width: 45 }} />
                                        <span style={{ color: '#94a3b8' }}>Date:</span>
                                        <EditableField value={fields.opt_others_date} onChange={set('opt_others_date')} editing={editing} type="date" isPrinting={sharing || downloading} style={{ fontSize: 9 }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. CLINICAL FOOTER */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1.5px solid #e2e8f0', paddingTop: 8, marginTop: 8 }}>
                            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                                Participate in monthly fixed Village Health Sanitation and Nutrition Day
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ textAlign: 'right', fontSize: 9, color: '#64748b' }}>
                                    <span style={{ fontWeight: 700, color: '#334155' }}>Digitally Certified Record</span>
                                    <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 1 }}>Pathlab Diagnostics Quality Assurance</div>
                                </div>
                                <img 
                                    src={PATHLAB_STAMP_BASE64} 
                                    alt="Certified Stamp" 
                                    crossOrigin="anonymous"
                                    style={{ width: 48, height: 48, opacity: 0.8 }} 
                                />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <style>{`
                .ant-input, .ant-input-number, .ant-select-selector {
                    border-color: #cbd5e1 !important;
                    background: transparent !important;
                    border-bottom: 1px solid ${primaryColor}33 !important;
                    border-radius: 0px !important;
                    padding-left: 2px !important;
                    padding-right: 2px !important;
                }
                .ant-input:focus, .ant-input-number-focused {
                    border-bottom-color: ${primaryColor} !important;
                    box-shadow: none !important;
                }
                .compact-input {
                    border: none !important;
                    border-bottom: 1px solid #cbd5e1 !important;
                    border-radius: 0px !important;
                    padding: 0 !important;
                    font-size: 10px !important;
                    text-align: center !important;
                    background: transparent !important;
                    width: 85% !important;
                    height: 18px !important;
                }
                .compact-input:focus {
                    border-bottom-color: ${primaryColor} !important;
                    box-shadow: none !important;
                }
                /* Style the native date inputs to be beautifully aligned and compact */
                input[type="date"] {
                    height: 18px !important;
                    line-height: 1.5 !important;
                    padding: 0 2px !important;
                    box-sizing: border-box !important;
                    font-family: inherit !important;
                    vertical-align: middle !important;
                }
                .anc-visits-table td, .anc-visits-table th {
                    border: 1px solid #cbd5e1;
                }
            `}</style>
        </Modal>
    );
};

export default AncCardPreviewModal;
