import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Switch, Row, Col, Upload, message } from 'antd';
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
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        startDate: dayjs(),
        endDate: dayjs().add(1, 'month'),
        ctaText: 'Book Now',
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
      };
      onSubmit(formattedValues);
    });
  };

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
            >
              <Input placeholder="e.g. Summer Health Fest 2026" />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="subtitle" label="Subtitle / Hook Line">
              <Input placeholder="e.g. Get up to 50% off on all routine checkups" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="bannerImage" label="Banner Image URL">
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
            <Form.Item name="couponId" label="Link Coupon (Optional)">
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
            <Form.Item name="ctaText" label="CTA Button Text">
              <Input placeholder="e.g. Book Now" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="targetUrl" label="Target URL (Optional)">
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
            >
              <DatePicker style={{ width: '100%' }} showTime format="DD/MM/YY hh:mm A" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: '100%' }} showTime format="DD/MM/YY hh:mm A" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Instructions" style={{ color: '#8c8c8c' }}>
              <div style={{ fontSize: '11px', lineHeight: '1.2', paddingTop: '4px' }}>
                Ensure dates are within valid ranges. Target URL is internal by default.
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Description" style={{ marginBottom: 0 }}>
          <Input.TextArea rows={2} placeholder="Provide details about the campaign..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CampaignFormModal;
