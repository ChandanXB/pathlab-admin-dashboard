import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Switch, Row, Col, Divider } from 'antd';
import dayjs from 'dayjs';
import type { Coupon } from '../types/coupon.types';

interface CouponFormModalProps {
  visible: boolean;
  editingCoupon: Coupon | null;
  form: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  tests: any[];
  packages: any[];
}

const CouponFormModal: React.FC<CouponFormModalProps> = ({
  visible,
  editingCoupon,
  form,
  onSubmit,
  onCancel,
  tests,
  packages,
}) => {
  useEffect(() => {
    if (visible && editingCoupon) {
      form.setFieldsValue({
        ...editingCoupon,
        startDate: dayjs(editingCoupon.startDate),
        endDate: dayjs(editingCoupon.endDate),
        discountValue: Number(editingCoupon.discountValue),
        minOrderValue: Number(editingCoupon.minOrderValue),
        status: editingCoupon.status === 'active',
        showOnLandingPage: editingCoupon.showOnLandingPage,
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        status: true,
        showOnLandingPage: false,
        discountType: 'percentage',
        applicableTo: 'all',
        startDate: dayjs(),
        endDate: dayjs().add(1, 'month'),
      });
    }

  }, [visible, editingCoupon, form]);

  const handleSubmit = () => {
    form.validateFields().then((values: any) => {
      const formattedValues = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        status: values.status ? 'active' : 'inactive',
        showOnLandingPage: values.showOnLandingPage || false,
      };

      onSubmit(formattedValues);
    });
  };

  const applicableTo = Form.useWatch('applicableTo', form);

  return (
    <Modal
      title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={800}
      okText={editingCoupon ? 'Update' : 'Create'}
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="code"
              label="Coupon Code"
              rules={[{ required: true, message: 'Please enter coupon code' }]}
              normalize={(value) => (value || '').toUpperCase()}
            >
              <Input placeholder="e.g. SUMMER50" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="showOnLandingPage" label="Show on Web" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>



        <Divider orientation={"left" as any}>Discount Details</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="discountType"
              label="Discount Type"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="percentage">Percentage (%)</Select.Option>
                <Select.Option value="fixed">Fixed Amount</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="discountValue"
              label="Discount Value"
              rules={[{ required: true, message: 'Please enter discount value' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="minOrderValue" label="Minimum Order Value">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation={"left" as any}>Validity & Limits</Divider>

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
            <Form.Item name="usageLimit" label="Usage Limit (Total)">
              <InputNumber style={{ width: '100%' }} min={1} placeholder="Unlimited if empty" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation={"left" as any}>Applicability</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="applicableTo"
              label="Applicable To"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="all">Entire Order</Select.Option>
                <Select.Option value="test">Specific Tests</Select.Option>
                <Select.Option value="package">Specific Packages</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          {applicableTo !== 'all' && (
            <Col span={16}>
              <Form.Item
                name="applicableIds"
                label={applicableTo === 'test' ? 'Select Tests' : 'Select Packages'}
                rules={[{ required: true, message: 'Please select at least one' }]}
              >
                <Select mode="multiple" placeholder="Search and select" filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={
                  applicableTo === 'test'
                    ? tests.map(t => ({ label: `${t.test_name} (${t.test_code})`, value: t.id }))
                    : packages.map(p => ({ label: p.title, value: p.id }))
                }
                />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export default CouponFormModal;
