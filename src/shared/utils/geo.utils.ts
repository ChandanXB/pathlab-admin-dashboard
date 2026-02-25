/**
 * Calculates the distance between two points in KM using the Haversine formula
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
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

/**
 * Fits map bounds to include all provided markers
 */
export const fitMarkersToView = (
    map: google.maps.Map | null,
    pickup: { lat: number, lng: number } | null,
    agents: { latitude?: number | null, longitude?: number | null }[]
) => {
    if (!window.google || !map) return;
    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    if (pickup) {
        bounds.extend(pickup);
        hasPoints = true;
    }

    agents.forEach(agent => {
        if (agent.latitude && agent.longitude) {
            bounds.extend({ lat: Number(agent.latitude), lng: Number(agent.longitude) });
            hasPoints = true;
        }
    });

    if (hasPoints) {
        map.fitBounds(bounds);
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
            if (map.getZoom()! > 16) map.setZoom(16);
            window.google.maps.event.removeListener(listener);
        });
    }
};
