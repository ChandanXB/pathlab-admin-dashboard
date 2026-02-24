import React, { useState, useEffect } from 'react';
import { Modal, Select, Space, Typography, Badge, Button, Alert, Card, Spin } from 'antd';
import {
    EnvironmentOutlined,
    UserAddOutlined,
    CompassOutlined,
    CheckCircleOutlined,
    ReloadOutlined,
    SendOutlined
} from '@ant-design/icons';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import type { LabOrder } from '../types/labOrder.types';
import { collectionAgentService, type CollectionAgent } from '@/features/admin/collectionAgent/services/collectionAgentService';

import { labOrderService } from '../services/labOrderService';

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

const center = {
    lat: 26.4499, // default Kanpur
    lng: 80.3319
};

interface AssignAgentModalProps {
    visible: boolean;
    order: LabOrder | null;
    onClose: () => void;
    onAssignAgent: (orderId: number, agentId: number | null) => Promise<any>;
    onBroadcast?: (orderId: number) => Promise<any>;
}

const AssignAgentModal: React.FC<AssignAgentModalProps> = ({ visible, order, onClose, onAssignAgent, onBroadcast }) => {
    const [agents, setAgents] = useState<CollectionAgent[]>([]);
    const [assigning, setAssigning] = useState(false);
    const [selectedMapAgent, setSelectedMapAgent] = useState<CollectionAgent | null>(null);
    const [mapCenter, setMapCenter] = useState(center);
    const [geocodedPickup, setGeocodedPickup] = useState<{ lat: number; lng: number } | null>(null);
    const [fetchingAgents, setFetchingAgents] = useState(false);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });

    const geocodeAddress = async (address: string, orderId?: number, force = false) => {
        if (!window.google) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, async (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const location = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                };
                setGeocodedPickup(location);
                setMapCenter(location);
                if (map) map.panTo(location);

                // Auto-save coordinates if they were missing or if we forced it
                if (orderId && (!order?.latitude || force)) {
                    try {
                        await labOrderService.updateOrder(orderId, {
                            latitude: location.lat,
                            longitude: location.lng
                        });
                    } catch (err) {
                        console.error('Failed to save order coordinates', err);
                    }
                }
            } else {
                console.warn('Geocode failed for address:', address, status);
            }
        });
    };

    const fitAllMarkers = (mapInstance: google.maps.Map, pickup: any, agentsList: CollectionAgent[]) => {
        if (!window.google || !mapInstance) return;
        const bounds = new window.google.maps.LatLngBounds();
        let hasPoints = false;

        if (pickup) {
            bounds.extend(pickup);
            hasPoints = true;
        }

        agentsList.forEach(agent => {
            if (agent.latitude && agent.longitude) {
                // Ensure they are numbers
                bounds.extend({ lat: Number(agent.latitude), lng: Number(agent.longitude) });
                hasPoints = true;
            }
        });

        if (hasPoints) {
            mapInstance.fitBounds(bounds);
            // Limit zoom level on auto-fit
            const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
                if (mapInstance.getZoom()! > 16) mapInstance.setZoom(16);
                window.google.maps.event.removeListener(listener);
            });
        }
    };

    // Auto-fit bounds logic
    useEffect(() => {
        if (map && isLoaded && (geocodedPickup || agents.length > 0)) {
            fitAllMarkers(map, geocodedPickup, agents);
        }
    }, [map, isLoaded, geocodedPickup, agents]);

    useEffect(() => {
        if (visible && isLoaded && order) {
            fetchAgents();
            // Geocode if missing coordinates entirely
            if (!order.latitude && order.address) {
                geocodeAddress(order.address, order.id);
            } else if (order.latitude && order.longitude) {
                const loc = { lat: Number(order.latitude), lng: Number(order.longitude) };
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
                    destination: {
                        lat: Number(selectedMapAgent.latitude!),
                        lng: Number(selectedMapAgent.longitude!)
                    },
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

    const fetchAgents = async (forceGeocode = false) => {
        try {
            setFetchingAgents(true);
            const response = await collectionAgentService.getAgents({ status: 'active' });
            const agentsData = response.data;

            if (window.google) {
                const geocoder = new window.google.maps.Geocoder();
                const processedAgents = await Promise.all(agentsData.map(async (agent: any) => {
                    // Re-geocode if coordinates are missing (0, null) OR if we are forcing a refresh
                    const hasCoordinates = agent.latitude && agent.latitude !== 0;

                    if ((!hasCoordinates || forceGeocode) && agent.address) {
                        return new Promise((resolve) => {
                            geocoder.geocode({ address: agent.address }, async (results, status) => {
                                if (status === 'OK' && results?.[0]) {
                                    const lat = results[0].geometry.location.lat();
                                    const lng = results[0].geometry.location.lng();

                                    // Save the new coordinates back to the database
                                    try {
                                        await collectionAgentService.updateAgent(agent.id, {
                                            latitude: lat,
                                            longitude: lng
                                        });
                                    } catch (err) {
                                        console.error(`Failed to save agent ${agent.name} coordinates`, err);
                                    }

                                    resolve({
                                        ...agent,
                                        latitude: lat,
                                        longitude: lng
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
        const distA = parseFloat(calculateDistance(geocodedPickup.lat, geocodedPickup.lng, Number(a.latitude), Number(a.longitude!)));
        const distB = parseFloat(calculateDistance(geocodedPickup.lat, geocodedPickup.lng, Number(b.latitude), Number(b.longitude!)));
        return distA - distB;
    });

    const handleAssign = async (agentId: number | null) => {
        if (!order) return;

        try {
            setAssigning(true);
            await onAssignAgent(order.id, agentId);
        } catch (error) {
            console.error('Failed to assign agent', error);
        } finally {
            setAssigning(false);
        }
    };

    const handleBroadcast = async () => {
        if (!order || !onBroadcast) return;

        try {
            setAssigning(true);
            const success = await onBroadcast(order.id);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Failed to broadcast order', error);
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
            styles={{ body: { padding: '20px 24px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' } }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Upper Info Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>PICKUP ADDRESS</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <EnvironmentOutlined style={{ color: '#ff4d4f' }} />
                            <Text strong>{order.address || order.patient?.address || 'Address not provided'}</Text>
                            <Button
                                type="text"
                                size="small"
                                icon={<ReloadOutlined style={{ fontSize: '12px' }} />}
                                onClick={() => geocodeAddress(order.address || order.patient?.address || '', order.id, true)}
                                title="Recalculate Pickup Location"
                            />
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>CURRENT ASSIGNMENT</Text>
                        <div style={{ marginTop: '4px' }}>
                            {order.collection_agent ? (
                                <Badge status="success" text={order.collection_agent.name} />
                            ) : order.assignment_status === 'broadcasted' ? (
                                <Badge status="processing" text="Broadcasted (Waiting)" color="blue" />
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

                <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                    {/* Map Side */}
                    <div style={{ flex: 2, position: 'relative' }}>
                        <div style={{ height: '370px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '100%' }}
                                    center={mapCenter}
                                    zoom={12}
                                    onLoad={map => setMap(map)}
                                    options={{
                                        disableDefaultUI: true,
                                        zoomControl: true,
                                        styles: [
                                            {
                                                featureType: 'poi',
                                                elementType: 'labels',
                                                stylers: [{ visibility: 'off' }]
                                            }
                                        ]
                                    }}
                                >
                                    {/* Pickup Marker */}
                                    {geocodedPickup && (
                                        <Marker
                                            position={geocodedPickup}
                                            icon={{
                                                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                            }}
                                            zIndex={10}
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
                                            <div style={{ padding: '4px' }}>
                                                <Text strong style={{ fontSize: '12px', display: 'block' }}>{selectedMapAgent.name}</Text>
                                                <Text type="secondary" style={{ fontSize: '10px' }}>{selectedMapAgent.phone}</Text>
                                                <div style={{ marginTop: '8px' }}>
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        disabled={(selectedMapAgent._count?.lab_orders || 0) > 0 || assigning}
                                                        onClick={() => {
                                                            Modal.confirm({
                                                                title: 'Confirm Assignment',
                                                                content: `Assign this order to ${selectedMapAgent.name}?`,
                                                                onOk: () => handleAssign(selectedMapAgent.id)
                                                            });
                                                        }}
                                                        style={{ borderRadius: '6px', fontSize: '11px' }}
                                                    >
                                                        Assign Sample
                                                    </Button>
                                                </div>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </GoogleMap>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', background: '#f5f5f5' }}>
                                    <Spin tip="Loading Map..." />
                                </div>
                            )}

                            {isLoaded && (
                                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }}>
                                    <Button
                                        size="small"
                                        icon={<CompassOutlined />}
                                        onClick={() => map && fitAllMarkers(map, geocodedPickup, agents)}
                                        title="Fit all markers in view"
                                        style={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                                    >
                                        Fit to View
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selector Side */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {onBroadcast && (
                            <Card
                                size="small"
                                title={<span style={{ fontSize: '13px' }}>Dispatch to All</span>}
                                style={{ borderRadius: '8px', border: '1px dashed #1890ff' }}
                                bodyStyle={{ padding: '8px 12px' }}
                            >
                                <Button
                                    type="primary"
                                    ghost
                                    block
                                    size="small"
                                    icon={<SendOutlined />}
                                    onClick={() => {
                                        Modal.confirm({
                                            title: 'Confirm Broadcast',
                                            content: 'This will notify all active agents about this pickup. The first agent to accept will be assigned.',
                                            okText: 'Broadcast Now',
                                            cancelText: 'Cancel',
                                            onOk: handleBroadcast
                                        });
                                    }}
                                    loading={assigning}
                                    disabled={order.assignment_status === 'broadcasted'}
                                >
                                    {order.assignment_status === 'broadcasted' ? 'Broadcasting Active' : 'Broadcast to All Agents'}
                                </Button>
                                {order.assignment_status === 'broadcasted' && (
                                    <Text type="secondary" style={{ fontSize: '10px', marginTop: '4px', display: 'block' }}>
                                        Waiting for first agent to accept...
                                    </Text>
                                )}
                            </Card>
                        )}

                        {/* Recommended Agent Quick Action */}
                        {!order.collection_agent && !assigning && sortedAgents.length > 0 && sortedAgents.find(a => (a._count?.lab_orders || 0) === 0) && (
                            <Card
                                size="small"
                                title={<Space size={4}><CompassOutlined style={{ color: '#52c41a' }} /><span style={{ fontSize: '12px' }}>Recommended Agent</span></Space>}
                                style={{ borderRadius: '8px', border: '1px solid #b7eb8f', background: '#f6ffed' }}
                                bodyStyle={{ padding: '8px 12px' }}
                            >
                                {(() => {
                                    const recommended = sortedAgents.find(a => (a._count?.lab_orders || 0) === 0);
                                    if (!recommended) return null;
                                    const dist = geocodedPickup && recommended.latitude
                                        ? calculateDistance(geocodedPickup.lat, geocodedPickup.lng, recommended.latitude, recommended.longitude!)
                                        : null;

                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div>
                                                <Text strong style={{ fontSize: '12px', display: 'block' }}>{recommended.name}</Text>
                                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                                    Nearest Available {dist ? `(${dist} km away)` : ''}
                                                </Text>
                                            </div>
                                            <Button
                                                type="primary"
                                                size="small"
                                                block
                                                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                                onClick={() => {
                                                    Modal.confirm({
                                                        title: 'Confirm Assignment',
                                                        content: `Assign this order to ${recommended.name}?`,
                                                        okText: 'Confirm',
                                                        cancelText: 'Cancel',
                                                        onOk: () => handleAssign(recommended.id)
                                                    });
                                                }}
                                            >
                                                Quick Assign
                                            </Button>
                                        </div>
                                    );
                                })()}
                            </Card>
                        )}

                        <Card
                            size="small"
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                    <span>Quick Selection</span>
                                    <Button
                                        type="text"
                                        icon={<ReloadOutlined spin={fetchingAgents} />}
                                        size="small"
                                        onClick={() => fetchAgents(true)}
                                        title="Force Refresh All Agent Locations"
                                    />
                                </div>
                            }
                            style={{ borderRadius: '8px' }}
                            bodyStyle={{ padding: '8px 12px' }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '10px', display: 'block', marginBottom: '4px' }}>
                                        AGENTS BY PROXIMITY
                                    </Text>
                                    <Select
                                        placeholder="Select nearest agent"
                                        style={{ width: '100%' }}
                                        loading={assigning || fetchingAgents}
                                        value={order.collection_agent_id || undefined}
                                        onChange={(agentId) => {
                                            if (!agentId) {
                                                handleAssign(null);
                                                return;
                                            }
                                            const agent = agents.find(a => a.id === agentId);
                                            Modal.confirm({
                                                title: 'Confirm Assignment',
                                                content: `Are you sure you want to assign this order to ${agent?.name}?`,
                                                onOk: () => handleAssign(agentId)
                                            });
                                        }}
                                        allowClear
                                        showSearch
                                        optionFilterProp="children"
                                        size="small"
                                    >
                                        {sortedAgents.map(agent => {
                                            const activeOrders = agent._count?.lab_orders || 0;
                                            const dist = geocodedPickup && agent.latitude
                                                ? calculateDistance(geocodedPickup.lat, geocodedPickup.lng, agent.latitude, agent.longitude!)
                                                : null;

                                            return (
                                                <Option key={agent.id} value={agent.id} disabled={activeOrders > 0}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Space size={4}>
                                                            <span style={{ fontSize: '12px' }}>{agent.name}</span>
                                                            {dist && <Text type="secondary" style={{ fontSize: '10px' }}>({dist} km)</Text>}
                                                        </Space>
                                                        <Badge count={activeOrders} color={activeOrders > 0 ? 'orange' : 'green'} style={{ fontSize: '10px' }} />
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
                                        size="small"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => {
                                            Modal.confirm({
                                                title: 'Confirm Unassign',
                                                content: 'Are you sure you want to remove the current agent?',
                                                okText: 'Unassign',
                                                okButtonProps: { danger: true },
                                                onOk: () => handleAssign(null)
                                            });
                                        }}
                                        loading={assigning}
                                        style={{ fontSize: '12px' }}
                                    >
                                        Unassign Current Agent
                                    </Button>
                                )}
                            </div>
                        </Card>

                        <div style={{ background: '#e6f7ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #91d5ff' }}>
                            <Title level={5} style={{ color: '#0050b3', marginBottom: '4px', fontSize: '13px' }}>Legend</Title>
                            <Space direction="vertical" size={2}>
                                <Space size={8}><Badge status="success" style={{ fontSize: '11px' }} /> <Text style={{ fontSize: '11px' }}>Agent Available</Text></Space>
                                <Space size={8}><Badge status="warning" style={{ fontSize: '11px' }} /> <Text style={{ fontSize: '11px' }}>Agent Occupied</Text></Space>
                                <Space size={8}><Badge status="error" style={{ fontSize: '11px' }} /> <Text style={{ fontSize: '11px' }}>Pickup Location</Text></Space>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AssignAgentModal;
