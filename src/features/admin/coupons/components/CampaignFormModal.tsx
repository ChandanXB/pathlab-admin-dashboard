import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Switch, Row, Col, Upload, message, Divider, InputNumber, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Campaign } from '../types/campaign.types';
import type { Coupon } from '../types/coupon.types';

interface CampaignFormModalProps {
  visible: boolean;
  editingCampaign: Campaign | null;
  form: any;
  coupons: Coupon[];
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const CampaignFormModal: React.FC<CampaignFormModalProps> = ({
  visible,
  editingCampaign,
  form,
  coupons,
  onSubmit,
  onCancel,
}) => {
  useEffect(() => {
    if (visible && editingCampaign) {
      form.setFieldsValue({
        ...editingCampaign,
        startDate: dayjs(editingCampaign.startDate),
        endDate: dayjs(editingCampaign.endDate),
        scheduledShowTime: editingCampaign.scheduledShowTime ? dayjs(editingCampaign.scheduledShowTime) : undefined,
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        startDate: dayjs(),
        endDate: dayjs().add(1, 'month'),
        ctaText: 'Book Now',
        useAdvancedScheduling: false,
        durationUnit: 'minutes',
      });
    }
  }, [visible, editingCampaign, form]);

  const handleFileUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    const reader = new FileReader();
    reader.onload = () => {
      form.setFieldsValue({ bannerImage: reader.result });
      message.success('Image loaded successfully');
    };
    reader.readAsDataURL(file);

    return false; // Prevent default auto-upload
  };

  const handleSubmit = () => {
    form.validateFields().then((values: any) => {
      const formattedValues = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        scheduledShowTime: values.scheduledShowTime ? values.scheduledShowTime.toISOString() : undefined,
      };
      onSubmit(formattedValues);
    });
  };

  const useAdvanced = Form.useWatch('useAdvancedScheduling', form);

  return (
    <Modal
      title={editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={850}
      okText={editingCampaign ? 'Update' : 'Create'}
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={19}>
            <Form.Item
              name="title"
              label="Campaign Title"
              rules={[{ required: true, message: 'Please enter campaign title' }]}
              style={{ marginBottom: '12px' }}
            >
              <Input placeholder="e.g. Summer Health Fest 2026" />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="isActive" label="Status" valuePropName="checked" style={{ marginBottom: '12px' }}>
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="subtitle" label="Subtitle / Hook Line" style={{ marginBottom: '12px' }}>
              <Input placeholder="e.g. Get up to 50% off on all routine checkups" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="bannerImage" label="Banner Image URL" style={{ marginBottom: '12px' }}>
              <Input 
                placeholder="https://example.com/banner.jpg" 
                prefix={<UploadOutlined />} 
                addonAfter={
                  <Upload 
                    showUploadList={false} 
                    beforeUpload={handleFileUpload} 
                    accept="image/*"
                  >
                    <span style={{ cursor: 'pointer' }}>Upload</span>
                  </Upload>
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="couponId" label="Link Coupon (Optional)" style={{ marginBottom: '12px' }}>
              <Select placeholder="Select a coupon" allowClear>
                {coupons.map(coupon => (
                  <Select.Option key={coupon.id} value={coupon.id}>
                    {coupon.code}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="ctaText" label="CTA Button Text" style={{ marginBottom: '12px' }}>
              <Input placeholder="e.g. Book Now" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="targetUrl" label="Target URL (Optional)" style={{ marginBottom: '12px' }}>
              <Input placeholder="e.g. /packages/routine-checkup" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true }]}
              style={{ marginBottom: '12px' }}
            >
              <DatePicker style={{ width: '100%' }} showTime format="DD/MM/YY hh:mm A" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true }]}
              style={{ marginBottom: '12px' }}
            >
              <DatePicker style={{ width: '100%' }} showTime format="DD/MM/YY hh:mm A" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Instructions" style={{ marginBottom: '12px', color: '#8c8c8c' }}>
              <div style={{ fontSize: '10px', lineHeight: '1.1', paddingTop: '0px' }}>
                Dates must be valid. URL is internal.
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Description" style={{ marginBottom: '12px' }}>
          <Input.TextArea rows={1} placeholder="Provide details about the campaign..." />
        </Form.Item>

        <Divider style={{ marginTop: '8px', marginBottom: '8px' }} />
        <Typography.Text strong style={{ fontSize: '13px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
          Advanced Scheduling Settings
        </Typography.Text>

        <Row gutter={16} align="middle">
          <Col span={24}>
            <Form.Item 
              name="useAdvancedScheduling" 
              label="Enable Cron-style Scheduling" 
              valuePropName="checked"
              style={{ marginBottom: useAdvanced ? '8px' : '0' }}
              extra={!useAdvanced && <span style={{ fontSize: '11px' }}>If disabled, modal shows whenever active.</span>}
            >
              <Switch size="small" checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Col>
        </Row>

        {useAdvanced && (
          <Row gutter={16} style={{ background: '#f9f9f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
            <Col span={12}>
              <Form.Item 
                name="scheduledShowTime" 
                label={<span style={{ fontSize: '12px' }}>Show Time</span>}
                rules={[{ required: useAdvanced, message: 'Required' }]}
                style={{ marginBottom: 0 }}
              >
                <DatePicker 
                  size="small"
                  style={{ width: '100%' }} 
                  showTime 
                  format="DD/MM/YY hh:mm A" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ fontSize: '12px' }}>Duration</span>} style={{ marginBottom: 0 }}>
                <Input.Group compact>
                  <Form.Item
                    name="displayDuration"
                    noStyle
                    rules={[{ required: useAdvanced, message: 'Required' }]}
                  >
                    <InputNumber size="small" style={{ width: '60%' }} min={1} />
                  </Form.Item>
                  <Form.Item name="durationUnit" noStyle>
                    <Select size="small" style={{ width: '40%' }}>
                      <Select.Option value="minutes">Min</Select.Option>
                      <Select.Option value="hours">Hrs</Select.Option>
                    </Select>
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};

export default CampaignFormModal;
