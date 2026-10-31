import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for missing default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface CampusMapProps {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

export default function CampusMap({ lat, lng, name, address }: CampusMapProps) {
  // Google Maps Directions link
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div style={{ height: '200px', width: '100%', borderRadius: 12, overflow: 'hidden', marginTop: 16, border: '1px solid #e2e8f0' }}>
      <MapContainer center={[lat, lng]} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <strong>{name}</strong><br />
            {address}<br />
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 8, color: '#2563eb', fontWeight: 'bold' }}>
              🧭 Get Directions
            </a>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
