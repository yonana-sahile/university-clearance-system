import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ScaleControl, useMap } from 'react-leaflet';
import { Button, Space, message, Card, Tag } from 'antd';
import {
  EnvironmentOutlined,
  GlobalOutlined,
  PictureOutlined,
  AimOutlined,
  CopyOutlined,
  RadarChartOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ✅ Custom RED Marker for Campus
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// ✅ Custom BLUE Marker for "My Location"
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

// ✅ Helper to format distance
const formatDistance = (meters: number) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

export default function CampusMap({ lat, lng, name, address }: CampusMapProps) {
  const [mapType, setMapType] = useState<'street' | 'satellite'>('satellite');

  // ✅ NEW STATES for Live Tracking
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const hasArrivedRef = useRef(false); // Prevents spamming the "Arrived" message

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // ✅ Helper to calculate distance using Leaflet's built-in math
  const calculateDistance = (currentLat: number, currentLng: number) => {
    const campusLatLng = L.latLng(lat, lng);
    const userLatLng = L.latLng(currentLat, currentLng);
    return userLatLng.distanceTo(campusLatLng); // Returns meters
  };

  // ✅ EFFECT: Watch Position (Live Tracking)
  useEffect(() => {
    if (isTracking) {
      if (!navigator.geolocation) {
        message.error('Geolocation is not supported by your browser.');
        setIsTracking(false);
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;

          setUserLoc([currentLat, currentLng]);
          const dist = calculateDistance(currentLat, currentLng);
          setDistance(dist);

          // ✅ Proximity Alert: If within 50 meters
          if (dist < 50 && !hasArrivedRef.current) {
            hasArrivedRef.current = true;
            message.success({
              content: `🎉 You have arrived at ${name}!`,
              duration: 5,
            });
          }
        },
        (error) => {
          console.error(error);
          message.error('Failed to get your live location. Please check GPS permissions.');
          setIsTracking(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    // Cleanup: Stop watching when tracking is turned off or component unmounts
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTracking, lat, lng, name]);

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    message.success('GPS Coordinates copied to clipboard!');
  };

  const toggleTracking = () => {
    if (!isTracking) {
      message.loading({ content: 'Starting live GPS tracking...', key: 'track' });
      hasArrivedRef.current = false; // Reset arrival alert
    } else {
      message.info({ content: 'Live tracking stopped.', key: 'track' });
    }
    setIsTracking(!isTracking);
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
        <EnvironmentOutlined style={{ color: '#dc2626' }} />
        Campus Location & Directions
      </div>

      <div style={{ height: '320px', width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>

        {/* Floating Toggle Button */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
          <Space.Compact>
            <Button
              size="small"
              type={mapType === 'street' ? 'primary' : 'default'}
              icon={<GlobalOutlined />}
              onClick={() => setMapType('street')}
            >
              Street
            </Button>
            <Button
              size="small"
              type={mapType === 'satellite' ? 'primary' : 'default'}
              icon={<PictureOutlined />}
              onClick={() => setMapType('satellite')}
            >
              Satellite
            </Button>
          </Space.Compact>
        </div>

        {/* ✅ Floating Distance Card (Only shows when tracking) */}
        {isTracking && (
          <div style={{ position: 'absolute', bottom: 20, left: 10, zIndex: 1000, width: 220 }}>
            <Card
              size="small"
              style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #bfdbfe' }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <RadarChartOutlined style={{ color: '#2563eb', fontSize: 18 }} />
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1e3a8a' }}>Live Navigation</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                {distance !== null ? formatDistance(distance) : 'Searching...'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>away from destination</div>

              {distance !== null && distance < 50 && (
                <Tag color="success" icon={<CheckCircleFilled />} style={{ marginTop: 8, width: '100%', textAlign: 'center', borderRadius: 6 }}>
                  You Have Arrived!
                </Tag>
              )}
            </Card>
          </div>
        )}

        <MapContainer center={[lat, lng]} zoom={16} style={{ height: '100%', width: '100%', zIndex: 1 }} scrollWheelZoom={true}>

          {mapType === 'street' ? (
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          ) : (
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='&copy; Esri' />
          )}

          <ScaleControl imperial={false} position="bottomleft" />

          {/* ✅ Campus Destination Marker (Red) */}
          <Marker position={[lat, lng]} icon={redIcon}>
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>{name}</strong><br />
                <span style={{ fontSize: 12, color: '#64748b' }}>{address}</span>
              </div>
            </Popup>
          </Marker>

          {/* ✅ User's Current Location Marker (Blue) */}
          {userLoc && (
            <Marker position={userLoc} icon={blueIcon}>
              <Popup>
                <strong>📍 Your Current Location</strong>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Bottom Buttons */}
      <Space.Compact style={{ width: '100%', marginTop: 12, marginBottom: 8 }}>
        <Button
          type="primary"
          block
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ borderRadius: '8px 0 0 8px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontWeight: 700, height: 40 }}
        >
          🧭 Open Google Maps
        </Button>
        <Button
          icon={<CopyOutlined />}
          onClick={handleCopyCoordinates}
          style={{ borderRadius: '0 8px 8px 0', background: '#ffffff', color: '#475569', border: '1px solid #bfdbfe', fontWeight: 600, height: 40 }}
        >
          Copy GPS
        </Button>
      </Space.Compact>

      {/* ✅ Live Tracking Toggle Button */}
      <Button
        type={isTracking ? 'default' : 'primary'}
        danger={isTracking}
        block
        icon={<AimOutlined />}
        onClick={toggleTracking}
        style={{
          height: 44,
          borderRadius: 10,
          fontWeight: 700,
          background: isTracking ? '#fef2f2' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: isTracking ? '#dc2626' : '#ffffff',
          border: isTracking ? '1px solid #fecaca' : 'none',
          boxShadow: isTracking ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}
      >
        {isTracking ? '🛑 Stop Live Tracking' : '📍 Start Live Navigation Tracking'}
      </Button>
    </div>
  );
}
