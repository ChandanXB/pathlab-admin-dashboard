import React from 'react';
import { Drawer, Typography, Space, Divider, Button, Tag, Descriptions, Card, Empty, Row, Col } from 'antd';
import { 
    UserOutlined, 
    CalendarOutlined, 
    FileTextOutlined, 
    MedicineBoxOutlined, 
    DownloadOutlined,
    PhoneOutlined,
    InfoCircleOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import colors from '@/styles/colors';
import { formatName, formatDoctorName } from '@/shared/utils/nameUtils';

const { Title, Text, Paragraph } = Typography;

interface ConsultationDetailDrawerProps {
    open: boolean;
    appointment: any;
    onClose: () => void;
}

const ConsultationDetailDrawer: React.FC<ConsultationDetailDrawerProps> = ({ open, appointment, onClose }) => {
    if (!appointment) return null;

    const downloadFile = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            let finalFilename = filename;
            if (!filename.toLowerCase().match(/\.(pdf|jpg|jpeg|png|webp)$/)) {
                let extension = 'pdf'; 
                const mimeType = blob.type.split('/')[1];
                
                if (mimeType && mimeType !== 'octet-stream') {
                    extension = mimeType === 'jpeg' ? 'jpg' : mimeType;
                } else {
                    const urlExtension = url.split(/[#?]/)[0].split('.').pop()?.toLowerCase();
                    if (urlExtension && ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(urlExtension)) {
                        extension = urlExtension === 'jpeg' ? 'jpg' : urlExtension;
                    }
                }
                finalFilename = `${filename}.${extension}`;
            }

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = finalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed, opening in new tab:', error);
            window.open(url, '_blank');
        }
    };

    const patientReportUrl = appointment.notes?.split('Attached Report:')[1]?.trim();
    const patientConcern = appointment.notes?.split('Attached Report:')[0]?.trim() || 'No notes provided';
    const prescriptionUrl = appointment.precaution_file_url;

    const statusColor = 
        appointment.status === 'scheduled' ? 'blue' : 
        appointment.status === 'pending' ? 'orange' : 
        appointment.status === 'completed' ? 'green' : 
        'red';

    return (
        <Drawer
            title={
                <Space>
                    <InfoCircleOutlined style={{ color: colors.primary }} />
                    <span>Consultation Details</span>
                </Space>
            }
            placement="right"
            width={500}
            onClose={onClose}
            open={open}
            extra={
                <Tag color={statusColor}>{appointment.status?.toUpperCase()}</Tag>
            }
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Patient Information */}
                <section>
                    <Title level={5}><UserOutlined /> Patient Information</Title>
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Name">{formatName(appointment.patient?.full_name)}</Descriptions.Item>
                        <Descriptions.Item label="Patient ID">{appointment.patient?.patient_code}</Descriptions.Item>
                        <Descriptions.Item label="Contact">
                            <Space><PhoneOutlined /> {appointment.patient?.phone}</Space>
                        </Descriptions.Item>
                    </Descriptions>
                </section>

                <Divider style={{ margin: '12px 0' }} />

                {/* Appointment Schedule */}
                <section>
                    <Title level={5}><CalendarOutlined /> Schedule Details</Title>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Card size="small" bordered={false} style={{ background: '#f8fafc' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Date</Text>
                                <div style={{ fontWeight: 700, marginTop: 4 }}>
                                    {dayjs(appointment.appointment_date).format('DD MMM YYYY')}
                                </div>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" bordered={false} style={{ background: '#f8fafc' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Time</Text>
                                <div style={{ fontWeight: 700, marginTop: 4 }}>
                                    {appointment.appointment_time}
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </section>

                <Divider style={{ margin: '12px 0' }} />

                {/* Patient's Concern & Reports */}
                <section>
                    <Title level={5}><FileTextOutlined /> Patient's Concern</Title>
                    <Paragraph style={{ background: '#f1f5f9', padding: 12, borderRadius: 8, minHeight: 60 }}>
                        {patientConcern}
                    </Paragraph>
                    {patientReportUrl && (
                        <Button 
                            type="primary" 
                            ghost 
                            icon={<DownloadOutlined />} 
                            block
                            onClick={() => downloadFile(patientReportUrl, `Patient_Report_${appointment.patient?.full_name?.replace(/\s+/g, '_')}`)}
                        >
                            Download Patient's Uploaded Report
                        </Button>
                    )}
                </section>

                <Divider style={{ margin: '12px 0' }} />

                {/* Doctor's Prescription & Notes */}
                <section>
                    <Title level={5}><MedicineBoxOutlined /> Your Prescription & Notes</Title>
                    {appointment.precaution ? (
                        <Paragraph style={{ background: '#f0fdf4', padding: 12, border: '1px solid #bbf7d0', borderRadius: 8, minHeight: 60 }}>
                            <Title level={5} style={{ fontSize: 12, color: '#166534', marginBottom: 8 }}>
                                <SafetyCertificateOutlined /> DOCTOR'S PRECAUTIONS
                            </Title>
                            {appointment.precaution}
                        </Paragraph>
                    ) : (
                        <Empty description="No precautions or notes added yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                    
                    {prescriptionUrl && (
                        <Button 
                            type="primary" 
                            icon={<DownloadOutlined />} 
                            block
                            style={{ marginTop: 12 }}
                            onClick={() => downloadFile(prescriptionUrl, `Prescription_${formatDoctorName(appointment.doctor?.name).replace(/\s+/g, '_')}`)}
                        >
                            Download Your Prescription File
                        </Button>
                    )}
                </section>
            </Space>
        </Drawer>
    );
};

export default ConsultationDetailDrawer;
