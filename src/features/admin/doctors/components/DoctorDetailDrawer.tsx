import React from 'react';
import { Drawer, Descriptions, Tag, Typography, Space, Divider } from 'antd';
import { MedicineBoxOutlined, PhoneOutlined, MailOutlined, HomeOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import type { Doctor } from '../types/doctor.types';
import colors from '@/styles/colors';
import { format } from 'date-fns';

const { Title, Text, Paragraph } = Typography;

interface DoctorDetailDrawerProps {
    visible: boolean;
    doctor: Doctor | null;
    onClose: () => void;
}

const DoctorDetailDrawer: React.FC<DoctorDetailDrawerProps> = ({ visible, doctor, onClose }) => {
    if (!doctor) return null;

    return (
        <Drawer
            title={
                <Space>
                    <MedicineBoxOutlined style={{ color: colors.primary }} />
                    <span>Doctor Details</span>
                </Space>
            }
            placement="right"
            width={500}
            onClose={onClose}
            open={visible}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%', backgroundColor: colors.primary + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16
                }}>
                    <UserOutlined style={{ fontSize: 32, color: colors.primary }} />
                </div>
                <div>
                    <Title level={4} style={{ margin: 0, color: colors.textDark }}>{doctor.name}</Title>
                    <Tag color="blue" style={{ marginTop: 8, fontSize: '14px', padding: '4px 12px', borderRadius: '4px' }}>
                        {doctor.specialty || 'General'}
                    </Tag>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <Tag color={doctor.status === 'active' ? 'green' : 'red'}>
                        {doctor.status.toUpperCase()}
                    </Tag>
                </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions layout="vertical" column={2} style={{ marginTop: 24 }}>
                <Descriptions.Item label={<span><PhoneOutlined /> Phone</span>}>
                    <Text copyable>{doctor.phone}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
                    <Text copyable>{doctor.email}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<span><ClockCircleOutlined /> Experience</span>}>
                    {doctor.experience_years ? `${doctor.experience_years} Years` : 'Not specified'}
                </Descriptions.Item>
                <Descriptions.Item label="Joined On">
                    {doctor.user?.createdAt ? format(new Date(doctor.user.createdAt), 'dd MMM yyyy') : (doctor.createdAt ? format(new Date(doctor.createdAt), 'dd MMM yyyy') : 'N/A')}
                </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <Title level={5}>
                <HomeOutlined style={{ marginRight: 8, color: colors.textDark }} />
                Address
            </Title>
            <Paragraph style={{ color: colors.textDark }}>
                {doctor.address || 'No address provided.'}
            </Paragraph>

            <Divider style={{ margin: '16px 0' }} />

            <Title level={5}>About</Title>
            <Paragraph style={{ color: colors.textDark }}>
                {doctor.bio || 'No bio provided for this doctor.'}
            </Paragraph>

        </Drawer>
    );
};

export default DoctorDetailDrawer;
