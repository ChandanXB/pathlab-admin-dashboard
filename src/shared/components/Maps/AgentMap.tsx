import React, { useRef, useEffect } from 'react';
import { Spin, Alert, Button, Typography } from 'antd';
import { CompassOutlined } from '@ant-design/icons';
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    InfoWindow,
    DirectionsRenderer,
    Polyline
} from '@react-google-maps/api';
import type { CollectionAgent } from '@/features/admin/collectionAgent/services/collectionAgentService';
import { fitMarkersToView } from '@/shared/utils/geo.utils';
import { MAP_LIBRARIES, GOOGLE_MAPS_API_KEY, MAP_ID } from './map-config';

const { Text } = Typography;

interface AgentMapProps {
    pickup: { lat: number; lng: number } | null;
    agents: CollectionAgent[];
    selectedAgent: CollectionAgent | null;
    onAgentSelect: (agent: CollectionAgent | null) => void;
    onAssign: (agent: CollectionAgent) => void;
    directions: google.maps.DirectionsResult | null;
    height?: string | number;
    showFitButton?: boolean;
    assigning?: boolean;
}

const AgentMap: React.FC<AgentMapProps> = ({
    pickup,
    agents,
    selectedAgent,
    onAgentSelect,
    onAssign,
    directions,
    height = 370,
    showFitButton = true,
    assigning = false
}) => {
    const mapRef = useRef<google.maps.Map | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: MAP_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: MAP_LIBRARIES
    });

    // Auto-fit bounds when markers change
    useEffect(() => {
        if (isLoaded && mapRef.current && (pickup || agents.length > 0)) {
            fitMarkersToView(mapRef.current, pickup, agents);
        }
    }, [isLoaded, pickup, agents]);

    const handleFitView = () => {
        if (mapRef.current) {
            fitMarkersToView(mapRef.current, pickup, agents);
        }
    };

    if (loadError) return <Alert message="Error loading maps" type="error" />;
    if (!isLoaded) return <div style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}><Spin tip="Loading Map..." /></div>;

    return (
        <div style={{ position: 'relative', height, borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={pickup || { lat: 26.4499, lng: 80.3319 }}
                zoom={12}
                onLoad={map => { mapRef.current = map; }}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles: [
                        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
                    ]
                }}
            >
                {/* Pickup Marker */}
                {pickup && (
                    <Marker
                        position={pickup}
                        icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
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
                    pickup && selectedAgent?.latitude && (
                        <Polyline
                            path={[
                                pickup,
                                { lat: Number(selectedAgent.latitude), lng: Number(selectedAgent.longitude!) }
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
                            position={{ lat: Number(agent.latitude), lng: Number(agent.longitude) }}
                            onClick={() => onAgentSelect(agent)}
                            icon={{
                                url: (agent._count?.lab_orders || 0) > 0
                                    ? 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                                    : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                            }}
                        />
                    )
                ))}

                {/* Info Window for Selected Agent */}
                {selectedAgent && (
                    <InfoWindow
                        position={{ lat: Number(selectedAgent.latitude!), lng: Number(selectedAgent.longitude!) }}
                        onCloseClick={() => onAgentSelect(null)}
                    >
                        <div style={{ padding: '4px' }}>
                            <Text strong style={{ fontSize: '12px', display: 'block' }}>{selectedAgent.name}</Text>
                            <Text type="secondary" style={{ fontSize: '10px' }}>{selectedAgent.phone}</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Button
                                    type="primary"
                                    size="small"
                                    disabled={(selectedAgent._count?.lab_orders || 0) > 0 || assigning}
                                    onClick={() => onAssign(selectedAgent)}
                                    style={{ borderRadius: '6px', fontSize: '11px' }}
                                >
                                    Assign Sample
                                </Button>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {showFitButton && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }}>
                    <Button
                        size="small"
                        icon={<CompassOutlined />}
                        onClick={handleFitView}
                        style={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                    >
                        Fit to View
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AgentMap;
