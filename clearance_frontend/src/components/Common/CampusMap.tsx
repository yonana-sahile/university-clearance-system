import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ✅ Custom RED Marker Icon
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface CampusMapProps {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

export default function CampusMap({ lat, lng, name, address }: CampusMapProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div style={{ marginTop: 16 }}>
      {/* ✅ Clear Label for non-technical users */}
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
        <EnvironmentOutlined style={{ color: '#dc2626' }} />
        Campus Location & Directions
      </div>

      <div style={{ height: '180px', width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <MapContainer center={[lat, lng]} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <Marker position={[lat, lng]} icon={redIcon}>
            <Popup>
              <strong>{name}</strong><br />
              {address}<br />
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* ✅ Big obvious button for non-technical users */}
      <Button
        type="primary"
        block
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: 8,
          borderRadius: 8,
          background: '#eff6ff',
          color: '#2563eb',
          border: '1px solid #bfdbfe',
          fontWeight: 700
        }}
      >
        🧭 Open in Google Maps
      </Button>
    </div>
  );
}
