import React, { useEffect } from 'react';
import {
  Modal, Form, Input, Select, DatePicker, Switch, Row, Col,
  Upload, message, Divider, InputNumber, Typography, Space, Tag, Button
} from 'antd';
import { UploadOutlined, InfoCircleOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Campaign, BannerDisplayType } from '../types/campaign.types';

interface HeroBannerFormModalProps {
  visible: boolean;
  editingBanner: Campaign | null;
  form: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  confirmLoading?: boolean;
}

const BANNER_TYPE_OPTIONS: { value: BannerDisplayType; label: string; description: string; color: string }[] = [
  {
    value: 'hero_carousel',
    label: '🎠 Carousel Slide',
    description: 'Rotating slide shown in the hero section carousel',
    color: 'blue',
  },
  {
    value: 'hero_banner',
    label: '🖼️ Hero Banner',
    description: 'Full-width static banner shown in the hero section',
    color: 'purple',
  },
  {
    value: 'event_banner',
    label: '🎟️ Event Banner',
    description: 'Promotional event strip shown below hero content',
    color: 'orange',
  },
];

const HeroBannerFormModal: React.FC<HeroBannerFormModalProps> = ({
  visible,
  editingBanner,
  form,
  onSubmit,
  onCancel,
  confirmLoading,
}) => {
  useEffect(() => {
    if (visible && editingBanner) {
      let bannerImages: string[] = [''];
      if (editingBanner.bannerImage) {
        bannerImages = editingBanner.bannerImage.split(',').map(s => s.trim()).filter(Boolean);
        if (bannerImages.length === 0) bannerImages = [''];
      }
      form.setFieldsValue({
        ...editingBanner,
        bannerImages,
        startDate: dayjs(editingBanner.startDate),
        endDate: dayjs(editingBanner.endDate),
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        startDate: dayjs(),
        endDate: dayjs().add(30, 'day'),
        ctaText: 'Book Now',
        displayType: 'hero_carousel',
        sortOrder: 0,
        bannerImages: [''],
      });
    }
  }, [visible, editingBanner, form]);

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
    return false;
  };

  const handleMultipleFileUpload = (file: File, index: number) => {
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
      const bannerImages = form.getFieldValue('bannerImages') || [];
      const updatedImages = [...bannerImages];
      updatedImages[index] = reader.result as string;
      form.setFieldsValue({ bannerImages: updatedImages });
      message.success('Image loaded successfully');
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleSubmit = () => {
    form.validateFields().then((values: any) => {
      const { bannerImages, ...rest } = values;
      let finalBannerImage = values.bannerImage;

      if (values.displayType === 'hero_carousel' && bannerImages) {
        const filteredList = bannerImages.filter((img: string) => img && img.trim() !== '');
        finalBannerImage = filteredList.join(',');
      }

      const formattedValues = {
        ...rest,
        bannerImage: finalBannerImage,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };
      onSubmit(formattedValues);
    });
  };

  const selectedType = Form.useWatch('displayType', form);
  const bannerTypeInfo = BANNER_TYPE_OPTIONS.find(o => o.value === selectedType);

  return (
    <Modal
      title={
        <Space>
          {editingBanner ? 'Edit Hero Banner' : 'Create Hero Banner'}
          {bannerTypeInfo && (
            <Tag color={bannerTypeInfo.color} style={{ marginLeft: 4 }}>
              {bannerTypeInfo.label}
            </Tag>
          )}
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={880}
      okText={editingBanner ? 'Update Banner' : 'Create Banner'}
      confirmLoading={confirmLoading}
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical">
        {/* Banner Type Selection */}
        <Form.Item
          name="displayType"
          label={<strong>Banner Type</strong>}
          rules={[{ required: true, message: 'Please select a banner type' }]}
          style={{ marginBottom: '16px' }}
        >
          <Select placeholder="Select banner type" size="large">
            {BANNER_TYPE_OPTIONS.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>
                <Space>
                  <Tag color={opt.color} style={{ margin: 0 }}>{opt.label}</Tag>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    {opt.description}
                  </Typography.Text>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {bannerTypeInfo && (
          <div
            style={{
              background: '#f6f8ff',
              border: '1px solid #d0d9ff',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <InfoCircleOutlined style={{ color: '#4361ee' }} />
            <Typography.Text style={{ fontSize: '12px', color: '#4361ee' }}>
              {bannerTypeInfo.description}
            </Typography.Text>
          </div>
        )}

        <Divider style={{ marginTop: 0, marginBottom: 12 }} />

        {/* Title + Status Row */}
        <Row gutter={16}>
          <Col span={19}>
            <Form.Item
              name="title"
              label="Banner Title"
              rules={[{ required: true, message: 'Please enter banner title' }]}
              style={{ marginBottom: '12px' }}
            >
              <Input placeholder="e.g. Summer Health Fest — Up to 50% Off!" />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="isActive" label="Status" valuePropName="checked" style={{ marginBottom: '12px' }}>
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>

        {/* Subtitle + Banner Image Row */}
        {selectedType === 'hero_carousel' ? (
          <>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="subtitle" label="Subtitle / Tagline" style={{ marginBottom: '12px' }}>
                  <Input placeholder="e.g. Book Now & Save Big on Routine Checkups" />
                </Form.Item>
              </Col>
            </Row>
            
            <div style={{ marginBottom: '16px', background: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Carousel Slide Images (Multiple)
              </Typography.Text>
              <Form.List name="bannerImages">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Form.Item
                          {...field}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message: "Please input image URL or upload an image.",
                            },
                          ]}
                          noStyle
                        >
                          <Input
                            placeholder={`Image URL #${index + 1}`}
                            prefix={<UploadOutlined />}
                            addonAfter={
                              <Upload
                                showUploadList={false}
                                beforeUpload={(file) => handleMultipleFileUpload(file, index)}
                                accept="image/*"
                              >
                                <span style={{ cursor: 'pointer' }}>Upload</span>
                              </Upload>
                            }
                            style={{ flex: 1 }}
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                            style={{ fontSize: '18px', color: '#ff4d4f', cursor: 'pointer' }}
                          />
                        )}
                      </div>
                    ))}
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        style={{ width: '100%' }}
                      >
                        Add Slide Image
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          </>
        ) : (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="subtitle" label="Subtitle / Tagline" style={{ marginBottom: '12px' }}>
                <Input placeholder="e.g. Book Now & Save Big on Routine Checkups" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bannerImage" label="Banner Image URL" style={{ marginBottom: '12px' }}>
                <Input
                  placeholder="https://example.com/banner.jpg"
                  prefix={<UploadOutlined />}
                  addonAfter={
                    <Upload showUploadList={false} beforeUpload={handleFileUpload} accept="image/*">
                      <span style={{ cursor: 'pointer' }}>Upload</span>
                    </Upload>
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Description */}
        <Form.Item name="description" label="Description" style={{ marginBottom: '12px' }}>
          <Input.TextArea
            rows={2}
            placeholder="Short description displayed on the banner (optional)..."
          />
        </Form.Item>

        {/* CTA + Target URL + Sort Order */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="ctaText" label="CTA Button Text" style={{ marginBottom: '12px' }}>
              <Input placeholder="e.g. Book Now" />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="targetUrl" label="Target URL" style={{ marginBottom: '12px' }}>
              <Input placeholder="e.g. /packages or https://..." />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="sortOrder"
              label="Sort Order"
              tooltip="Lower numbers appear first in the carousel"
              style={{ marginBottom: '12px' }}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        {/* Date Range */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: 'Please select a start date' }]}
              style={{ marginBottom: '12px' }}
            >
              <DatePicker style={{ width: '100%' }} showTime format="DD/MM/YY hh:mm A" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true, message: 'Please select an end date' }]}
              style={{ marginBottom: '12px' }}
            >
              <DatePicker style={{ width: '100%' }} showTime format="DD/MM/YY hh:mm A" />
            </Form.Item>
          </Col>
        </Row>

        {/* Live Preview hint */}
        <Form.Item shouldUpdate style={{ marginBottom: 0 }}>
          {() => {
            const displayType = form.getFieldValue('displayType');
            if (displayType === 'hero_carousel') {
              const bannerImages = form.getFieldValue('bannerImages') || [];
              const validImages = bannerImages.filter((img: string) => img && img.trim() !== '');
              if (validImages.length === 0) return null;
              return (
                <div
                  style={{
                    border: '1px dashed #d9d9d9',
                    borderRadius: 8,
                    padding: 12,
                    background: '#fafafa',
                  }}
                >
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8, textAlign: 'center' }}>
                    Carousel Slides Preview ({validImages.length})
                  </Typography.Text>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {validImages.map((imgUrl: string, idx: number) => (
                      <div key={idx} style={{ position: 'relative', border: '1px solid #eee', borderRadius: 4, padding: 2, background: 'white' }}>
                        <img
                          src={imgUrl}
                          alt={`Preview ${idx + 1}`}
                          style={{
                            display: 'block',
                            height: 60,
                            width: 100,
                            objectFit: 'cover',
                            borderRadius: 2,
                          }}
                        />
                        <Tag style={{ position: 'absolute', top: 2, left: 2, margin: 0, padding: '0 4px', fontSize: '9px', lineHeight: '12px' }}>
                          #{idx + 1}
                        </Tag>
                      </div>
                    ))}
                  </div>
                </div>
              );
            } else {
              const imgUrl = form.getFieldValue('bannerImage');
              return imgUrl ? (
                <div
                  style={{
                    border: '1px dashed #d9d9d9',
                    borderRadius: 8,
                    padding: 8,
                    textAlign: 'center',
                    background: '#fafafa',
                  }}
                >
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    Banner Preview
                  </Typography.Text>
                  <img
                    src={imgUrl}
                    alt="Banner preview"
                    style={{
                      display: 'block',
                      maxHeight: 120,
                      maxWidth: '100%',
                      margin: '6px auto 0',
                      objectFit: 'contain',
                      borderRadius: 4,
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ) : null;
            }
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HeroBannerFormModal;
