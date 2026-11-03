import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ScaleControl, useMap } from 'react-leaflet';
import { Button, Space, message } from 'antd';
import {
  EnvironmentOutlined,
  GlobalOutlined,
  PictureOutlined,
  AimOutlined,
  CopyOutlined
} from '@ant-design/icons';
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

// ✅ Custom Blue Marker for "My Location"
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
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

// ✅ Helper Component to handle "Find My Location" (Requires access to the map instance)
function LocateControl() {
  const map = useMap();

  const handleLocate = () => {
    if (!navigator.geolocation) {
      message.error('Geolocation is not supported by your browser.');
      return;
    }

    message.loading({ content: 'Finding your location...', key: 'locate' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 16, { duration: 1.5 });
        message.success({ content: 'Location found!', key: 'locate' });
      },
      () => {
        message.error({ content: 'Unable to retrieve your location. Please check browser permissions.', key: 'locate' });
      }
    );
  };

  return (
    <button
      onClick={handleLocate}
      title="Find My Location"
      style={{
        position: 'absolute',
        top: 10,
        left: 50,
        zIndex: 1000,
        background: '#ffffff',
        border: '2px solid rgba(0,0,0,0.2)',
        borderRadius: 4,
        width: 34,
        height: 34,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        color: '#2563eb',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <AimOutlined />
    </button>
  );
}

export default function CampusMap({ lat, lng, name, address }: CampusMapProps) {
  // ✅ Default is now SATELLITE
  const [mapType, setMapType] = useState<'street' | 'satellite'>('satellite');

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    message.success('GPS Coordinates copied to clipboard!');
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* ✅ Clear Label for non-technical users */}
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
        <EnvironmentOutlined style={{ color: '#dc2626' }} />
        Campus Location & Directions
      </div>

      <div style={{ height: '280px', width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>

        {/* ✅ Floating Toggle Button inside the map */}
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

        <MapContainer
          center={[lat, lng]}
          zoom={16}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          scrollWheelZoom={true} // Allow zooming with mouse wheel
        >

          {/* ✅ DYNAMIC TILE LAYER: Default is Satellite */}
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

          {/* ✅ Scale Bar (Shows distance) */}
          <ScaleControl imperial={false} position="bottomleft" />

          {/* ✅ Locate Me Button */}
          <LocateControl />

          {/* ✅ Campus Marker */}
          <Marker position={[lat, lng]} icon={redIcon}>
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>{name}</strong><br />
                <span style={{ fontSize: 12, color: '#64748b' }}>{address}</span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* ✅ Helper Buttons below the map */}
      <Space.Compact style={{ width: '100%', marginTop: 12 }}>
        <Button
          type="primary"
          block
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            borderRadius: '8px 0 0 8px',
            background: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            fontWeight: 700,
            height: 40
          }}
        >
          🧭 Open in Google Maps
        </Button>
        <Button
          icon={<CopyOutlined />}
          onClick={handleCopyCoordinates}
          style={{
            borderRadius: '0 8px 8px 0',
            background: '#ffffff',
            color: '#475569',
            border: '1px solid #bfdbfe',
            fontWeight: 600,
            height: 40
          }}
        >
          Copy GPS
        </Button>
      </Space.Compact>
    </div>
  );
}
