import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button, Space } from 'antd';
import { EnvironmentOutlined, GlobalOutlined, PictureOutlined } from '@ant-design/icons';
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
  // ✅ NEW: State to toggle between Street and Satellite view
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div style={{ marginTop: 16 }}>
      {/* ✅ Clear Label for non-technical users */}
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
        <EnvironmentOutlined style={{ color: '#dc2626' }} />
        Campus Location & Directions
      </div>

      <div style={{ height: '220px', width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>

        {/* ✅ NEW: Floating Toggle Button inside the map */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
          <Space.Compact>
            <Button
              size="small"
              type={mapType === 'street' ? 'primary' : 'default'}
              icon={<GlobalOutlined />}
              onClick={() => setMapType('street')}
              style={{ fontWeight: 600, fontSize: 12 }}
            >
              Street
            </Button>
            <Button
              size="small"
              type={mapType === 'satellite' ? 'primary' : 'default'}
              icon={<PictureOutlined />}
              onClick={() => setMapType('satellite')}
              style={{ fontWeight: 600, fontSize: 12 }}
            >
              Satellite
            </Button>
          </Space.Compact>
        </div>

        <MapContainer center={[lat, lng]} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>

          {/* ✅ DYNAMIC TILE LAYER: Switches based on mapType state */}
          {mapType === 'street' ? (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
          ) : (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerographics, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
          )}

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
