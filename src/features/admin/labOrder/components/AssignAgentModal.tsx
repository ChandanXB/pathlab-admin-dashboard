import React, { useState, useEffect } from 'react';
import { Modal, Select, Space, Typography, Badge, Button, Alert, Card, Tag } from 'antd';
import {
    EnvironmentOutlined,
    UserAddOutlined,
    PhoneOutlined,
    CompassOutlined,
    CheckCircleOutlined,
    ReloadOutlined,
    SendOutlined
} from '@ant-design/icons';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import type { LabOrder } from '../types/labOrder.types';
import { collectionAgentService, type CollectionAgent } from '@/features/admin/collectionAgent/services/collectionAgentService';

const { Text, Title } = Typography;
const { Option } = Select;

// Helper to calculate distance in KM
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(1);
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
};

const center = {
    lat: 26.4499, // default Kanpur
    lng: 80.3319
};

interface AssignAgentModalProps {
    visible: boolean;
    order: LabOrder | null;
    onClose: () => void;
    onAssignAgent: (orderId: number, agentId: number | null) => Promise<any>;
}

const AssignAgentModal: React.FC<AssignAgentModalProps> = ({ visible, order, onClose, onAssignAgent }) => {
    const [agents, setAgents] = useState<CollectionAgent[]>([]);
    const [assigning, setAssigning] = useState(false);
    const [selectedMapAgent, setSelectedMapAgent] = useState<CollectionAgent | null>(null);
    const [mapCenter, setMapCenter] = useState(center);
    const [geocodedPickup, setGeocodedPickup] = useState<{ lat: number; lng: number } | null>(null);
    const [fetchingAgents, setFetchingAgents] = useState(false);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });

    useEffect(() => {
        if (visible && isLoaded && order) {
            fetchAgents();
            if (!order.latitude && order.address) {
                geocodeAddress(order.address);
            } else if (order.latitude && order.longitude) {
                const loc = { lat: order.latitude, lng: order.longitude };
                setGeocodedPickup(loc);
                setMapCenter(loc);
            }
        }
    }, [visible, isLoaded, order]);

    useEffect(() => {
        if (selectedMapAgent && geocodedPickup && window.google && isLoaded) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: geocodedPickup,
                    destination: { lat: selectedMapAgent.latitude!, lng: selectedMapAgent.longitude! },
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    } else {
                        console.error('Directions request failed due to ' + status);
                    }
                }
            );
        } else {
            setDirections(null);
        }
    }, [selectedMapAgent, geocodedPickup, isLoaded]);

    const geocodeAddress = (address: string) => {
        if (!window.google) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const location = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                };
                setGeocodedPickup(location);
                setMapCenter(location);
            }
        });
    };

    const fetchAgents = async () => {
        try {
            setFetchingAgents(true);
            const response = await collectionAgentService.getAgents({ status: 'active' });
            const agentsData = response.data;

            if (window.google) {
                const geocoder = new window.google.maps.Geocoder();
                const processedAgents = await Promise.all(agentsData.map(async (agent: any) => {
                    if (!agent.latitude && agent.address) {
                        return new Promise((resolve) => {
                            geocoder.geocode({ address: agent.address }, (results, status) => {
                                if (status === 'OK' && results?.[0]) {
                                    resolve({
                                        ...agent,
                                        latitude: results[0].geometry.location.lat(),
                                        longitude: results[0].geometry.location.lng()
                                    });
                                } else {
                                    resolve(agent);
                                }
                            });
                        });
                    }
                    return agent;
                }));
                setAgents(processedAgents as CollectionAgent[]);
            } else {
                setAgents(agentsData);
            }
        } catch (error) {
            console.error('Failed to fetch agents', error);
        } finally {
            setFetchingAgents(false);
        }
    };

    const sortedAgents = [...agents].sort((a, b) => {
        if (!geocodedPickup || !a.latitude || !b.latitude) return 0;
        const distA = parseFloat(calculateDistance(geocodedPickup.lat, geocodedPickup.lng, a.latitude, a.longitude!));
        const distB = parseFloat(calculateDistance(geocodedPickup.lat, geocodedPickup.lng, b.latitude, b.longitude!));
        return distA - distB;
    });

    const handleAssign = async (agentId: number | null) => {
        if (!order) return;

        try {
            setAssigning(true);
            await onAssignAgent(order.id, agentId);
            onClose(); // Close modal on success
        } catch (error) {
            console.error('Failed to assign agent', error);
        } finally {
            setAssigning(false);
        }
    };

    if (!order) return null;

    return (
        <Modal
            title={
                <Space>
                    <UserAddOutlined style={{ color: '#1890ff' }} />
                    <span>Assign Collection Agent - {order.order_code}</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={850}
            centered
            styles={{ body: { padding: '24px' } }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Upper Info Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>PICKUP ADDRESS</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <EnvironmentOutlined style={{ color: '#ff4d4f' }} />
                            <Text strong>{order.address || order.patient?.address || 'Address not provided'}</Text>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>CURRENT ASSIGNMENT</Text>
                        <div style={{ marginTop: '4px' }}>
                            {order.collection_agent ? (
                                <Badge status="success" text={order.collection_agent.name} />
                            ) : (
                                <Badge status="warning" text="Unassigned" />
                            )}
                        </div>
                    </div>
                </div>

                {!order.latitude && (
                    <Alert
                        message="Exact coordinates missing"
                        description="Patient has provided an address but valid GPS coordinates are missing for precise map plotting."
                        type="warning"
                        showIcon
                    />
                )}

                {/* Map and Selection Container */}
                <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Map Side */}
                    <div style={{ flex: 2, position: 'relative' }}>
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={mapCenter}
                                zoom={14}
                                options={{
                                    streetViewControl: false,
                                    mapTypeControl: false,
                                }}
                            >
                                {/* Pickup Location */}
                                {geocodedPickup && (
                                    <Marker
                                        position={geocodedPickup}
                                        icon={{
                                            url: 'http://maps.google.com/mapfiles/ms/icons/red-pushpin.png'
                                        }}
                                        title="Patient Location"
                                        zIndex={100}
                                    />
                                )}

                                {/* Road Directions or Fallback Line */}
                                {directions ? (
                                    <DirectionsRenderer
                                        directions={directions}
                                        options={{
                                            suppressMarkers: true,
                                            polylineOptions: {
                                                strokeColor: '#1890ff',
                                                strokeWeight: 4,
                                                strokeOpacity: 0.7
                                            }
                                        }}
                                    />
                                ) : (
                                    geocodedPickup && selectedMapAgent?.latitude && (
                                        <Polyline
                                            path={[
                                                geocodedPickup,
                                                { lat: selectedMapAgent.latitude, lng: selectedMapAgent.longitude! }
                                            ]}
                                            options={{
                                                strokeColor: '#ff4d4f',
                                                strokeOpacity: 0.5,
                                                strokeWeight: 2,
                                                visible: true,
                                                zIndex: 1
                                            }}
                                        />
                                    )
                                )}

                                {/* Agent Markers */}
                                {agents.map(agent => (
                                    agent.latitude && agent.longitude && (
                                        <Marker
                                            key={agent.id}
                                            position={{ lat: agent.latitude, lng: agent.longitude }}
                                            onClick={() => setSelectedMapAgent(agent)}
                                            icon={{
                                                url: (agent._count?.lab_orders || 0) > 0
                                                    ? 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                                                    : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                            }}
                                        />
                                    )
                                ))}

                                {selectedMapAgent && (
                                    <InfoWindow
                                        position={{ lat: selectedMapAgent.latitude!, lng: selectedMapAgent.longitude! }}
                                        onCloseClick={() => setSelectedMapAgent(null)}
                                    >
                                        <div style={{ padding: '8px', minWidth: '180px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Title level={5} style={{ margin: 0 }}>{selectedMapAgent.name}</Title>
                                                {directions?.routes[0]?.legs[0] && (
                                                    <Tag color="cyan">
                                                        <SendOutlined /> {directions.routes[0].legs[0].distance?.text}
                                                    </Tag>
                                                )}
                                            </div>
                                            <Text type="secondary"><PhoneOutlined /> {selectedMapAgent.phone}</Text>
                                            <div style={{ marginTop: '8px' }}>
                                                <Badge
                                                    status={(selectedMapAgent._count?.lab_orders || 0) > 0 ? 'warning' : 'success'}
                                                    text={(selectedMapAgent._count?.lab_orders || 0) > 0 ? `${selectedMapAgent._count?.lab_orders} Active Orders` : 'Available Now'}
                                                />
                                            </div>
                                            <Button
                                                type="primary"
                                                size="small"
                                                block
                                                style={{ marginTop: '12px' }}
                                                onClick={() => handleAssign(selectedMapAgent.id)}
                                                loading={assigning}
                                            >
                                                Assign This Agent
                                            </Button>
                                        </div>
                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        ) : (
                            <div style={{ height: '400px', background: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CompassOutlined spin style={{ fontSize: '32px', color: '#bfbfbf' }} />
                            </div>
                        )}
                    </div>

                    {/* Selector Side */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Card
                            size="small"
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Quick Selection</span>
                                    <Button
                                        type="text"
                                        icon={<ReloadOutlined spin={fetchingAgents} />}
                                        size="small"
                                        onClick={fetchAgents}
                                        title="Refresh Locations"
                                    />
                                </div>
                            }
                            style={{ borderRadius: '8px' }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>
                                        AGENTS BY PROXIMITY
                                    </Text>
                                    <Select
                                        placeholder="Select nearest agent"
                                        style={{ width: '100%' }}
                                        loading={assigning || fetchingAgents}
                                        value={order.collection_agent_id || undefined}
                                        onChange={handleAssign}
                                        allowClear
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {sortedAgents.map(agent => {
                                            const activeOrders = agent._count?.lab_orders || 0;
                                            const dist = geocodedPickup && agent.latitude
                                                ? calculateDistance(geocodedPickup.lat, geocodedPickup.lng, agent.latitude, agent.longitude!)
                                                : null;

                                            return (
                                                <Option key={agent.id} value={agent.id}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Space>
                                                            <span>{agent.name}</span>
                                                            {dist && <Text type="secondary" style={{ fontSize: '11px' }}>({dist} km)</Text>}
                                                        </Space>
                                                        <Badge count={activeOrders} color={activeOrders > 0 ? 'orange' : 'green'} />
                                                    </div>
                                                </Option>
                                            );
                                        })}
                                    </Select>
                                </div>

                                {order.collection_agent && (
                                    <Button
                                        danger
                                        block
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => handleAssign(null)}
                                        loading={assigning}
                                    >
                                        Unassign Current Agent
                                    </Button>
                                )}
                            </div>
                        </Card>

                        <div style={{ background: '#e6f7ff', padding: '12px', borderRadius: '8px', border: '1px solid #91d5ff' }}>
                            <Title level={5} style={{ color: '#0050b3', marginBottom: '8px', fontSize: '14px' }}>Legend</Title>
                            <Space direction="vertical" size={4}>
                                <Space><Badge status="success" /> <Text style={{ fontSize: '12px' }}>Agent Available</Text></Space>
                                <Space><Badge status="warning" /> <Text style={{ fontSize: '12px' }}>Agent Occupied</Text></Space>
                                <Space><Badge status="error" /> <Text style={{ fontSize: '12px' }}>Pickup Location</Text></Space>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AssignAgentModal;
