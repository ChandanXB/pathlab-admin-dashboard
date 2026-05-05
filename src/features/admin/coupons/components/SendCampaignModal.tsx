import React, { useState } from 'react';
import { Modal, Radio, Select, Button, Space, message, Typography, Alert, Divider, Checkbox } from 'antd';
import { MailOutlined, UserOutlined, TeamOutlined, SendOutlined, WhatsAppOutlined } from '@ant-design/icons';
import type { Campaign } from '../types/campaign.types';
import { campaignService } from '../services/campaignService';
import { patientService } from '../../patients/services/patientService';

const { Text } = Typography;

interface SendCampaignModalProps {
  visible: boolean;
  campaign: Campaign | null;
  onClose: () => void;
}

const SendCampaignModal: React.FC<SendCampaignModalProps> = ({ visible, campaign, onClose }) => {
  const [sendType, setSendType] = useState<'all' | 'specific'>('all');
  const [channels, setChannels] = useState<string[]>(['email']);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchInitialPatients = async () => {
    setFetching(true);
    try {
      // Fetch with empty query to get recent patients
      const data = await patientService.searchPatients('');
      // Show patients who have either an email or a phone
      const validPatients = data.filter((p: any) => (p.user?.email || p.email || p.phone));
      setPatients(validPatients);
    } catch (error) {
      console.error('Failed to fetch initial patients', error);
    } finally {
      setFetching(false);
    }
  };

  React.useEffect(() => {
    if (visible && sendType === 'specific') {
      fetchInitialPatients();
    }
  }, [visible, sendType]);

  const handleSearch = async (query: string) => {
    setFetching(true);
    try {
      const data = await patientService.searchPatients(query);
      // Include anyone with email or phone
      const validPatients = data.filter((p: any) => (p.user?.email || p.email || p.phone));
      setPatients(validPatients);
    } catch (error) {
      console.error('Failed to search patients', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSend = async () => {
    if (!campaign) return;
    
    if (channels.length === 0) {
      message.warning('Please select at least one delivery channel (Email or WhatsApp)');
      return;
    }

    if (sendType === 'specific' && selectedUserIds.length === 0) {
      message.warning('Please select at least one patient');
      return;
    }

    setSending(true);
    try {
      const payload = {
        userIds: sendType === 'specific' ? selectedUserIds : undefined,
        sendAll: sendType === 'all',
        channels: channels
      };
      
      const result = await campaignService.sendCampaign(campaign.id, payload);
      message.success(`Campaign sent successfully! Sent: ${result.data.successCount}, Failed: ${result.data.failedCount}`);
      onClose();
      // Reset state
      setSelectedUserIds([]);
      setPatients([]);
      setSendType('all');
      setChannels(['email']);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  if (!campaign) return null;

  return (
    <Modal
      title={
        <Space>
          <SendOutlined style={{ color: '#1890ff' }} />
          <span>Send Campaign: {campaign.title}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="send" 
          type="primary" 
          icon={<SendOutlined />} 
          loading={sending} 
          onClick={handleSend}
        >
          Send Now
        </Button>
      ]}
      centered
      width={500}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        <div>
          <Text strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>1. Delivery Channels</Text>
          <Checkbox.Group 
            options={[
              { label: <Space><MailOutlined /> Email</Space>, value: 'email' },
              { label: <Space><WhatsAppOutlined style={{ color: '#25D366' }} /> WhatsApp</Space>, value: 'whatsapp' }
            ]}
            value={channels}
            onChange={(checkedValues) => setChannels(checkedValues as string[])}
          />
        </div>

        <Divider style={{ margin: '4px 0' }} />

        <div>
          <Text strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>2. Recipients</Text>
          <Radio.Group 
            value={sendType} 
            onChange={e => setSendType(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Radio value="all" style={{ width: '100%', padding: '6px 12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                <Space align="start">
                  <TeamOutlined style={{ marginTop: '4px', color: '#1890ff' }} />
                  <div>
                    <Text strong>All Patients</Text>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Send to every registered patient.</div>
                  </div>
                </Space>
              </Radio>
              <Radio value="specific" style={{ width: '100%', padding: '6px 12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                <Space align="start">
                  <UserOutlined style={{ marginTop: '4px', color: '#1890ff' }} />
                  <div>
                    <Text strong>Specific Patients</Text>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Search and select specific patients.</div>
                  </div>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {sendType === 'specific' && (
          <div style={{ marginTop: '0px' }}>
            <Text strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Select Recipients:</Text>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Search by name, phone or patient code"
              filterOption={false}
              onSearch={handleSearch}
              onChange={(values) => setSelectedUserIds(values)}
              loading={fetching}
              notFoundContent={fetching ? 'Searching...' : 'No patients found'}
            >
              {patients.map(p => (
                <Select.Option key={p.id} value={p.user_id ? p.user_id : `patient_${p.id}`}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong style={{ fontSize: '13px' }}>{p.full_name}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {p.patient_code} | {p.email || p.user?.email || p.phone}
                      {!p.user_id && <Text type="warning" style={{ fontSize: '10px', marginLeft: '4px' }}>(Guest)</Text>}
                    </Text>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>
        )}

        <Divider style={{ margin: '8px 0' }} />
        
        <Alert
          message="Campaign messages are sent immediately. Please verify content."
          type="warning"
          showIcon
          style={{ padding: '8px 12px' }}
        />
      </div>
    </Modal>
  );
};

export default SendCampaignModal;
