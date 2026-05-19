import React, { useState, useEffect, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
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
    Tag,
    Tabs,
    InputNumber,
    Row,
    Col,
    Divider,
    TimePicker
} from 'antd';
import { 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    EnvironmentOutlined,
    HomeOutlined,
    ClockCircleOutlined,
    CompassOutlined,
    FormOutlined,
    EnvironmentTwoTone
} from '@ant-design/icons';
import { locationService } from '../services/locationService';
import { collectionCenterService, type CollectionCenter } from '../services/collectionCenterService';
import type { ServiceableCity } from '../services/locationService';
import LocationPicker from '@/shared/components/Maps/LocationPicker';
import colors from '@/styles/colors';

const { Text } = Typography;

const CityTab: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
    const [allCities, setAllCities] = useState<ServiceableCity[]>([]);
    const [visibleCount, setVisibleCount] = useState(10);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCity, setEditingCity] = useState<ServiceableCity | null>(null);
    const [form] = Form.useForm();

    const fetchCities = async () => {
        setLoading(true);
        try {
            const response = await locationService.getCities();
            if (response.success) {
                setAllCities(response.data);
            }
        } catch (error: any) {
            message.error('Failed to fetch cities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    const cities = useMemo(() => {
        return allCities.slice(0, visibleCount);
    }, [allCities, visibleCount]);

    const hasMore = visibleCount < allCities.length;
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setVisibleCount(prev => prev + 10);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [hasMore, loading]);

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
            const response = await locationService.updateCity(city.id, { status } as any);
            if (response.success) {
                message.success(`City ${checked ? 'activated' : 'deactivated'}`);
                setAllCities(allCities.map(c => c.id === city.id ? { ...c, status } : c));
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
            message.error('Operation failed');
        }
    };

    const columns = [
        {
            title: 'City Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    <EnvironmentOutlined style={{ color: colors.primary }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Pin Code',
            dataIndex: 'pincode',
            key: 'pincode',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: ServiceableCity) => (
                <Switch 
                    checked={status === 'active'} 
                    onChange={(checked) => handleToggleStatus(record, checked)}
                    size={isMobile ? "small" : "default"}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: ServiceableCity) => (
                <Space size={isMobile ? 4 : "middle"}>
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: colors.info }} />
                    <Popconfirm title="Delete City" onConfirm={() => handleDelete(record.id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add City</Button>
            </div>
            <Table 
                columns={columns as any} 
                dataSource={cities} 
                rowKey="id" 
                loading={loading}
                pagination={false}
                size="middle"
                scroll={{ y: 'calc(100vh - 350px)', x: isMobile ? 'max-content' : undefined }}
            />
            {hasMore && (
                <div 
                    ref={loadMoreRef} 
                    style={{ 
                        padding: '16px 0', 
                        textAlign: 'center', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        gap: '8px',
                        color: colors.primary,
                        fontWeight: 500
                    }}
                >
                    <ClockCircleOutlined spin style={{ fontSize: 16 }} />
                    <span>Loading more cities...</span>
                </div>
            )}
            <Modal
                title={editingCity ? 'Edit City' : 'Add New City'}
                open={isModalVisible}
                onOk={handleModalSubmit}
                onCancel={() => setIsModalVisible(false)}
                centered
            >
                <Form form={form} layout="vertical" initialValues={{ status: true }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="City Name" rules={[{ required: true }]}>
                                <Input placeholder="Lucknow" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="pincode" label="Pin Code">
                                <Input maxLength={6} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="address" label="Address">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="villages" label="Villages / Sub-Areas">
                        <Select mode="tags" placeholder="Add multiple" />
                    </Form.Item>
                    <Form.Item name="status" label="Active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const CenterTab: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
    const [allCenters, setAllCenters] = useState<CollectionCenter[]>([]);
    const [visibleCount, setVisibleCount] = useState(10);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCenter, setEditingCenter] = useState<CollectionCenter | null>(null);
    const [form] = Form.useForm();

    const fetchCenters = async () => {
        setLoading(true);
        try {
            const response = await collectionCenterService.getCenters();
            if (response.success) {
                setAllCenters(response.data);
            }
        } catch (error: any) {
            message.error('Failed to fetch centers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    const centers = useMemo(() => {
        return allCenters.slice(0, visibleCount);
    }, [allCenters, visibleCount]);

    const hasMore = visibleCount < allCenters.length;
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setVisibleCount(prev => prev + 10);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [hasMore, loading]);

    const handleAdd = () => {
        setEditingCenter(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (center: CollectionCenter) => {
        setEditingCenter(center);
        form.setFieldsValue({
            ...center,
            status: center.status === 'active',
            open_time: center.open_time ? dayjs(center.open_time, 'hh:mm A') : null,
            close_time: center.close_time ? dayjs(center.close_time, 'hh:mm A') : null
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await collectionCenterService.deleteCenter(id);
            if (response.success) {
                message.success('Center deleted successfully');
                fetchCenters();
            }
        } catch (error: any) {
            message.error('Failed to delete center');
        }
    };

    const handleLocationChange = (data: { lat: number; lng: number; address: string; city?: string; state?: string; pincode?: string }) => {
        form.setFieldsValue({
            latitude: data.lat,
            longitude: data.lng,
            address: data.address,
            city: data.city || form.getFieldValue('city'),
            state: data.state || form.getFieldValue('state'),
            pincode: data.pincode || form.getFieldValue('pincode')
        });
    };

    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                open_time: values.open_time ? values.open_time.format('hh:mm A') : null,
                close_time: values.close_time ? values.close_time.format('hh:mm A') : null,
                status: values.status ? 'active' : 'inactive'
            };

            let response;
            if (editingCenter) {
                response = await collectionCenterService.updateCenter(editingCenter.id, payload);
            } else {
                response = await collectionCenterService.createCenter(payload);
            }

            if (response.success) {
                message.success(`Center ${editingCenter ? 'updated' : 'added'} successfully`);
                setIsModalVisible(false);
                fetchCenters();
            }
        } catch (error: any) {
            message.error('Operation failed');
        }
    };

    const columns = [
        {
            title: 'Center Details',
            key: 'details',
            render: (_: any, record: CollectionCenter) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ textTransform: 'capitalize' }}>{record.center_name}</Text>
                    <Tag color={record.type.includes('NABL') ? 'gold' : 'blue'} style={{ marginTop: 4 }}>
                        {record.type}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Location',
            key: 'location',
            render: (_: any, record: CollectionCenter) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.city}, {record.state}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.address}</Text>
                </Space>
            ),
        },
        {
            title: 'Timing',
            key: 'timing',
            render: (_: any, record: CollectionCenter) => (
                <Space>
                    <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                    <Text>{record.open_time} - {record.close_time}</Text>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'success' : 'error'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: CollectionCenter) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: colors.info }} />
                    <Popconfirm title="Delete Center?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Center</Button>
            </div>
            <Table 
                columns={columns as any} 
                dataSource={centers} 
                rowKey="id" 
                loading={loading}
                pagination={false}
                size="middle"
                scroll={{ y: 'calc(100vh - 350px)', x: isMobile ? 'max-content' : undefined }}
            />
            {hasMore && (
                <div 
                    ref={loadMoreRef} 
                    style={{ 
                        padding: '16px 0', 
                        textAlign: 'center', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        gap: '8px',
                        color: colors.primary,
                        fontWeight: 500
                    }}
                >
                    <ClockCircleOutlined spin style={{ fontSize: 16 }} />
                    <span>Loading more collection centers...</span>
                </div>
            )}
            <Modal
                title={editingCenter ? 'Edit Center' : 'Add New Center'}
                open={isModalVisible}
                onOk={handleModalSubmit}
                onCancel={() => setIsModalVisible(false)}
                centered
                width={700}
            >
                <Form form={form} layout="vertical" initialValues={{ status: true, review_count: 0, services_available: ['Sample Collection Available'] }}>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item name="center_name" label="Center Name" rules={[{ required: true }]}>
                                <Input placeholder="e.g. Medoq Collection Centre" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="type" label="Center Type" rules={[{ required: true }]}>
                                <Select options={[
                                    { label: 'Medoq Center', value: 'Medoq Collection Center' },
                                    { label: 'NABL Lab', value: 'NABL Accredited Lab' },
                                    { label: 'Partner Lab', value: 'Partner Laboratory' }
                                ]} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider style={{ margin: '8px 0 16px 0' }} orientation={"left" as any}>
                        <Space><EnvironmentTwoTone twoToneColor="#eb2f96" /> Location & Address</Space>
                    </Divider>

                    <Form.Item name="latitude" noStyle><Input type="hidden" /></Form.Item>
                    <Form.Item name="longitude" noStyle><Input type="hidden" /></Form.Item>

                    <Tabs
                        defaultActiveKey="1"
                        type="card"
                        items={[
                            {
                                key: '1',
                                label: <Space><FormOutlined /> Manual Address</Space>,
                                children: (
                                    <div style={{ padding: '16px', background: '#fff', borderRadius: '0 0 8px 8px', border: '1px solid #f0f0f0', borderTop: 'none' }}>
                                        <Form.Item
                                            name="address"
                                            rules={[{ required: true, message: 'Please enter address' }]}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Input.TextArea
                                                rows={4}
                                                placeholder="Enter center's full address here..."
                                            />
                                        </Form.Item>
                                    </div>
                                )
                            },
                            {
                                key: '2',
                                label: <Space><CompassOutlined /> Select on Map</Space>,
                                children: (
                                    <div style={{ padding: '16px', background: '#fff', borderRadius: '0 0 8px 8px', border: '1px solid #f0f0f0', borderTop: 'none' }}>
                                        <LocationPicker
                                            height={250}
                                            value={{
                                                lat: form.getFieldValue('latitude'),
                                                lng: form.getFieldValue('longitude'),
                                                address: form.getFieldValue('address')
                                            }}
                                            onChange={handleLocationChange}
                                        />
                                    </div>
                                )
                            }
                        ]}
                    />

                    <Row gutter={16} style={{ marginTop: 16 }}>
                        <Col span={6}>
                            <Form.Item name="city" label="City" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="state" label="State" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="pincode" label="Pincode" rules={[{ required: true }]}>
                                <Input maxLength={6} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="rating" label="Initial Rating">
                                <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: 16 }}>
                        <Col span={12}>
                            <Form.Item name="open_time" label="Opening Time" rules={[{ required: true }]}>
                                <TimePicker format="hh:mm A" use12Hours style={{ width: '100%' }} placeholder="Select opening time" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="close_time" label="Closing Time" rules={[{ required: true }]}>
                                <TimePicker format="hh:mm A" use12Hours style={{ width: '100%' }} placeholder="Select closing time" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="services_available" label="Services Available">
                        <Select mode="tags" />
                    </Form.Item>
                    <Form.Item name="status" label="Active Status" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const CityManager: React.FC = () => {
    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const isMobile = screenSize < 768;

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const items = [
        {
            key: 'cities',
            label: (
                <span>
                    <EnvironmentOutlined />
                    {!isMobile && ' Serviceable Cities'}
                </span>
            ),
            children: <CityTab isMobile={isMobile} />,
        },
        {
            key: 'centers',
            label: (
                <span>
                    <HomeOutlined />
                    {!isMobile && ' Collection Centers'}
                </span>
            ),
            children: <CenterTab isMobile={isMobile} />,
        },
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Breadcrumb items={[
                { title: 'Home' },
                { title: 'Location Management' },
                { title: 'Cities & Centers' }
            ]} />
            <Card 
                bordered={false} 
                className="shadow-sm"
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px 24px' } }}
            >
                <Tabs defaultActiveKey="cities" items={items} style={{ height: '100%' }} />
            </Card>
            <style>{`
                .ant-tabs { height: 100%; display: flex; flex-direction: column; }
                .ant-tabs-content-holder { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .ant-tabs-content { height: 100%; }
                .ant-tabs-tabpane { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
            `}</style>
        </div>
    );
};

export default CityManager;
