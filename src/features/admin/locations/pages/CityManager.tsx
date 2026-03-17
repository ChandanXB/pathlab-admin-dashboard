import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Table, 
    Button, 
    Space, 
    Typography, 
    Modal, 
    Form, 
    Input, 
    Switch, 
    Breadcrumb, 
    message,
    Popconfirm,
    Select,
    Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { locationService } from '../services/locationService';
import type { ServiceableCity } from '../services/locationService';
import colors from '@/styles/colors';

const { Text } = Typography;

const CityManager: React.FC = () => {
    const [cities, setCities] = useState<ServiceableCity[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCity, setEditingCity] = useState<ServiceableCity | null>(null);
    const [form] = Form.useForm();

    const fetchCities = async () => {
        setLoading(true);
        try {
            const response = await locationService.getCities();
            if (response.success) {
                setCities(response.data);
            }
        } catch (error: any) {
            message.error('Failed to fetch cities: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    const handleAdd = () => {
        setEditingCity(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (city: ServiceableCity) => {
        setEditingCity(city);
        form.setFieldsValue({
            name: city.name,
            pincode: city.pincode,
            address: city.address,
            villages: city.villages || [],
            status: city.status === 'active'
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await locationService.deleteCity(id);
            if (response.success) {
                message.success('City deleted successfully');
                fetchCities();
            }
        } catch (error: any) {
            message.error('Failed to delete city');
        }
    };

    const handleToggleStatus = async (city: ServiceableCity, checked: boolean) => {
        try {
            const status = checked ? 'active' : 'inactive';
            const response = await locationService.updateCity(city.id, { status });
            if (response.success) {
                message.success(`City ${checked ? 'activated' : 'deactivated'}`);
                setCities(cities.map(c => c.id === city.id ? { ...c, status } : c));
            }
        } catch (error: any) {
            message.error('Failed to update status');
        }
    };

    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                name: values.name,
                pincode: values.pincode,
                address: values.address,
                villages: values.villages,
                status: values.status ? 'active' : 'inactive'
            };

            let response;
            if (editingCity) {
                response = await locationService.updateCity(editingCity.id, payload as any);
            } else {
                response = await locationService.createCity(payload);
            }

            if (response.success) {
                message.success(`City ${editingCity ? 'updated' : 'added'} successfully`);
                setIsModalVisible(false);
                fetchCities();
            }
        } catch (error: any) {
            message.error('Operation failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const columns = [
        {
            title: 'City Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: ServiceableCity) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <EnvironmentOutlined style={{ color: colors.primary }} />
                        <Text strong>{text}</Text>
                    </Space>
                    {record.address && (
                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '24px' }}>
                            {record.address}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Pin Code',
            dataIndex: 'pincode',
            key: 'pincode',
            render: (text: string) => text || '-',
        },
        {
            title: 'Villages/Areas',
            dataIndex: 'villages',
            key: 'villages',
            render: (villages: string[]) => (
                <div style={{ maxWidth: '200px' }}>
                    {villages && villages.length > 0 ? (
                        villages.map(v => (
                            <Tag key={v} color="blue" style={{ marginBottom: '4px' }}>{v}</Tag>
                        ))
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: ServiceableCity) => (
                <Switch 
                    checked={status === 'active'} 
                    onChange={(checked) => handleToggleStatus(record, checked)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: ServiceableCity) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                        style={{ color: colors.info }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete City"
                        description="Are you sure you want to delete this city?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Breadcrumb items={[
                { title: 'Home' },
                { title: 'Location Management' },
                { title: 'Serviceable Cities' }
            ]} />

            <Card
                title={
                    <Space>
                        <EnvironmentOutlined />
                        <span>Manage Serviceable Cities</span>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add New City
                    </Button>
                }
                bordered={false}
                className="shadow-sm"
                style={{ flex: 1 }}
            >
                <Table 
                    columns={columns as any} 
                    dataSource={cities} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingCity ? 'Edit City' : 'Add New City'}
                open={isModalVisible}
                onOk={handleModalSubmit}
                onCancel={() => setIsModalVisible(false)}
                okText={editingCity ? 'Update' : 'Add'}
                centered
            >
                <Form form={form} layout="vertical" initialValues={{ status: true, villages: [] }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            name="name"
                            label="City Name"
                            rules={[{ required: true, message: 'Please enter city name' }]}
                            style={{ flex: 1, marginBottom: '16px' }}
                        >
                            <Input placeholder="e.g. Lucknow" />
                        </Form.Item>

                        <Form.Item
                            name="pincode"
                            label="Pin Code"
                            rules={[{ pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit pincode' }]}
                            style={{ flex: 1, marginBottom: '16px' }}
                        >
                            <Input placeholder="e.g. 226001" maxLength={6} />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="address"
                        label="Representative Address"
                        tooltip="A main address or landmark to help pinpoint the location on maps"
                    >
                        <Input.TextArea placeholder="e.g. Hazratganj Main Road, Lucknow" rows={2} />
                    </Form.Item>

                    <Form.Item
                        name="villages"
                        label="Villages / Sub-Areas"
                        tooltip="Type a village name and press Enter to add multiple"
                    >
                        <Select 
                            mode="tags" 
                            style={{ width: '100%' }} 
                            placeholder="Add villages under this city"
                        />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Active Status"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CityManager;
