import React, { useState, useEffect, useRef } from 'react';
import { Input, Typography, message, Alert, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

import { MAP_LIBRARIES, GOOGLE_MAPS_API_KEY, MAP_ID } from './map-config';

const { Text } = Typography;

const defaultCenter = {
    lat: 26.4499, // default Kanpur
    lng: 80.3319
};

interface LocationPickerProps {
    value?: {
        lat: number;
        lng: number;
        address?: string;
    };
    onChange?: (data: { lat: number; lng: number; address: string }) => void;
    height?: string | number;
    showSearch?: boolean;
    placeholder?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
    value,
    onChange,
    height = 300,
    showSearch = true,
    placeholder = "Search for a location..."
}) => {
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const mapRef = useRef<google.maps.Map | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: MAP_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: MAP_LIBRARIES
    });

    // Sync internal state with incoming value
    useEffect(() => {
        if (value?.lat && value?.lng) {
            const pos = { lat: Number(value.lat), lng: Number(value.lng) };
            setMarkerPos(pos);
            setMapCenter(pos);
        }
    }, [value?.lat, value?.lng]);

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const location = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                const address = place.formatted_address || '';

                setMarkerPos(location);
                setMapCenter(location);
                if (mapRef.current) mapRef.current.panTo(location);

                onChange?.({ ...location, address });
            }
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const location = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setMarkerPos(location);
            reverseGeocode(location);
        }
    };

    const reverseGeocode = (location: google.maps.LatLngLiteral) => {
        if (!window.google) return;
        setIsGeocoding(true);
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location }, (results, status) => {
            setIsGeocoding(false);
            if (status === 'OK' && results && results[0]) {
                onChange?.({ ...location, address: results[0].formatted_address });
            } else {
                message.error('Geocoding failed');
            }
        });
    };

    if (loadError) return <Alert message="Error loading maps" type="error" />;
    if (!isLoaded) return <div style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin tip="Loading Maps..." /></div>;

    return (
        <div className="location-picker-container">
            {showSearch && (
                <div style={{ marginBottom: 8 }}>
                    <Autocomplete
                        onLoad={setAutocomplete}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <Input
                            prefix={isGeocoding ? <Spin size="small" /> : <SearchOutlined />}
                            placeholder={placeholder}
                            style={{ borderRadius: '8px' }}
                        />
                    </Autocomplete>
                </div>
            )}

            <div style={{
                height,
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #d9d9d9'
            }}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={14}
                    onClick={handleMapClick}
                    onLoad={map => { mapRef.current = map; }}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        zoomControlOptions: { position: 3 } // RIGHT_BOTTOM
                    }}
                >
                    {markerPos && <Marker position={markerPos} />}
                </GoogleMap>
            </div>
            <div style={{ marginTop: 4, textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                    Click on map to pin exact location
                </Text>
            </div>
        </div>
    );
};

export default LocationPicker;
