import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, ScaleControl, Polyline, Circle, useMap,
} from 'react-leaflet';
import { Button, Space, message, Card, Tag, Tooltip } from 'antd';
import {
  EnvironmentOutlined, GlobalOutlined, PictureOutlined, AimOutlined,
  RadarChartOutlined, CheckCircleFilled, BankOutlined, FullscreenOutlined,
  ShareAltOutlined, StopOutlined, SendOutlined, LoadingOutlined,
} from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ─── Custom Markers ─────────────────────────────────────────────────
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// ─── Helpers ────────────────────────────────────────────────────────
const formatDistance = (meters: number) =>
  meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(2)} km`;

const getETAs = (meters: number) => ({
  walkMin: Math.max(1, Math.round((meters / 1000) * 12)), // ~5 km/h
  driveMin: Math.max(1, Math.round((meters / 1000) * 1.5)), // ~40 km/h
});

// ─── Map Controller (handles pan/fly/fit logic) ─────────────────────
function MapController({
  userLoc, destLoc, isTracking, shouldFitBounds, onFitDone, manualFocus,
}: {
  userLoc: [number, number] | null;
  destLoc: [number, number];
  isTracking: boolean;
  shouldFitBounds: boolean;
  onFitDone: () => void;
  manualFocus: { type: 'user' | 'dest' | 'both'; trigger: number } | null;
}) {
  const map = useMap();
  const lastTrackedLocRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (shouldFitBounds && userLoc) {
      const bounds = L.latLngBounds([userLoc, destLoc]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
      onFitDone();
    }
  }, [shouldFitBounds, userLoc, destLoc, map, onFitDone]);

  useEffect(() => {
    if (isTracking && userLoc && !lastTrackedLocRef.current) {
      map.flyTo(userLoc, 17, { duration: 1.5 });
      lastTrackedLocRef.current = userLoc;
    }
    if (!isTracking) {
      lastTrackedLocRef.current = null;
    }
  }, [isTracking, userLoc, map]);

  useEffect(() => {
    if (!isTracking || !userLoc || !lastTrackedLocRef.current) return;
    const [prevLat, prevLng] = lastTrackedLocRef.current;
    if (prevLat !== userLoc[0] || prevLng !== userLoc[1]) {
      map.panTo(userLoc, { animate: true, duration: 0.8 });
      lastTrackedLocRef.current = userLoc;
    }
  }, [isTracking, userLoc, map]);

  useEffect(() => {
    if (!manualFocus) return;
    const { type } = manualFocus;
    if (type === 'user' && userLoc) {
      map.flyTo(userLoc, 18, { duration: 1 }); // Tighter zoom for user location
    } else if (type === 'dest') {
      map.flyTo(destLoc, 17, { duration: 1 });
    } else if (type === 'both' && userLoc) {
      const bounds = L.latLngBounds([userLoc, destLoc]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
    }
  }, [manualFocus?.trigger]); // eslint-disable-line

  return null;
}

// ─── Main Component ─────────────────────────────────────────────────
interface CampusMapProps {
  lat: number;
  lng: number;
  name: string;
  address: string;
  height?: number;
}

export default function CampusMap({ lat, lng, name, address, height = 320 }: CampusMapProps) {
  const [mapType, setMapType] = useState<'street' | 'satellite'>('satellite');
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0); // ✅ NEW: GPS accuracy in meters
  const [distance, setDistance] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [hasInitialFit, setHasInitialFit] = useState(false);
  const [manualFocus, setManualFocus] = useState<{ type: 'user' | 'dest' | 'both'; trigger: number } | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const hasArrivedRef = useRef(false);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // ─── GPS Settings for Maximum Accuracy ─────────────────────────────
  const GPS_OPTIONS = {
    enableHighAccuracy: true, // Force the device to use GPS, not just Wi-Fi/IP
    maximumAge: 0,            // Do not use cached locations; get a fresh reading
    timeout: 15000,           // Wait up to 15s for a strong signal
  };

  // ─── Reset state when destination changes ──────────────────────────
  useEffect(() => {
    setUserLoc(null);
    setDistance(null);
    setAccuracy(0);
    setHasInitialFit(false);
    hasArrivedRef.current = false;
    if (isTracking) setIsTracking(false);
    // eslint-disable-next-line
  }, [lat, lng]);

  // ─── Calculate distance ────────────────────────────────────────────
  const calculateDistance = (uLat: number, uLng: number) =>
    L.latLng(uLat, uLng).distanceTo(L.latLng(lat, lng));

  // ─── Watch Position (Live Tracking) ────────────────────────────────
  useEffect(() => {
    if (!isTracking) return;

    if (!navigator.geolocation) {
      message.error('Geolocation is not supported by your browser.');
      setIsTracking(false);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const cLat = pos.coords.latitude;
        const cLng = pos.coords.longitude;
        setUserLoc([cLat, cLng]);
        setAccuracy(pos.coords.accuracy); // ✅ Save accuracy radius
        const d = calculateDistance(cLat, cLng);
        setDistance(d);

        // ✅ Arrival alert (within 50m)
        if (d < 50 && !hasArrivedRef.current) {
          hasArrivedRef.current = true;
          message.success({
            content: `🎉 You have arrived at ${name}!`,
            duration: 6,
          });
          setIsTracking(false); // Auto-stop
        }
      },
      (err) => {
        console.error(err);
        if (err.code === 1) {
          message.error('Location permission denied. Please enable GPS in your browser settings.');
        } else {
          message.error('Unable to get your location. Please go near a window or outside.');
        }
        setIsTracking(false);
      },
      GPS_OPTIONS
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [isTracking]);

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleShowMyLocation = () => {
    if (!navigator.geolocation) {
      message.error('Geolocation not supported.');
      return;
    }
    setIsLocating(true);
    message.loading({ content: 'Getting exact GPS location...', key: 'locate' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cLat = pos.coords.latitude;
        const cLng = pos.coords.longitude;
        setUserLoc([cLat, cLng]);
        setAccuracy(pos.coords.accuracy); // ✅ Save accuracy radius
        setDistance(calculateDistance(cLat, cLng));
        setHasInitialFit(false); // trigger re-fit

        setIsLocating(false);

        // ✅ Warn if accuracy is poor (likely on a laptop with Wi-Fi location)
        if (pos.coords.accuracy > 1000) {
          message.warning({
            content: 'Location found, but accuracy is low. Tip: Open this on your phone for exact GPS!',
            key: 'locate',
            duration: 6
          });
        } else {
          message.success({ content: 'Exact location found!', key: 'locate', duration: 4 });
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          message.error({ content: '❌ GPS access denied. Enable location permissions in your browser.', key: 'locate', duration: 5 });
        } else {
          message.error({ content: 'Could not get your location. Please try again.', key: 'locate' });
        }
      },
      GPS_OPTIONS
    );
  };

  const handleStartTracking = () => {
    if (!userLoc) {
      handleShowMyLocation();
      return;
    }
    hasArrivedRef.current = false;
    setIsTracking(true);
    message.success('🎯 Live navigation started! The map will follow you.');
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    message.info('Live navigation stopped.');
  };

  const handleShare = async () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const shareData = {
      title: name,
      text: `📍 ${name} — ${address}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        message.success('Location link copied to clipboard!');
      }
    } catch {
      /* user cancelled */
    }
  };

  const focusOn = (type: 'user' | 'dest' | 'both') => {
    setManualFocus({ type, trigger: Date.now() });
  };

  const etas = distance !== null ? getETAs(distance) : null;
  const hasArrived = distance !== null && distance < 50;

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div style={{ marginTop: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
        <EnvironmentOutlined style={{ color: '#dc2626' }} />
        Campus Location & Live Directions
      </div>

      <div style={{ height, width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
        {/* ── Top-Right: Map Type Toggle ─────────────────────────── */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
          <Space.Compact>
            <Button
              size="small"
              type={mapType === 'street' ? 'primary' : 'default'}
              icon={<GlobalOutlined />}
              onClick={() => setMapType('street')}
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              Street
            </Button>
            <Button
              size="small"
              type={mapType === 'satellite' ? 'primary' : 'default'}
              icon={<PictureOutlined />}
              onClick={() => setMapType('satellite')}
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              Satellite
            </Button>
          </Space.Compact>
        </div>

        {/* ── Right Side: Recenter Buttons ───────────────────────── */}
        {userLoc && (
          <div style={{ position: 'absolute', top: 50, right: 10, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Tooltip title="Recenter to me" placement="left">
              <Button size="small" shape="circle" icon={<AimOutlined />} onClick={() => focusOn('user')} />
            </Tooltip>
            <Tooltip title="Show destination" placement="left">
              <Button size="small" shape="circle" icon={<BankOutlined />} onClick={() => focusOn('dest')} />
            </Tooltip>
            <Tooltip title="Show both" placement="left">
              <Button size="small" shape="circle" icon={<FullscreenOutlined />} onClick={() => focusOn('both')} />
            </Tooltip>
          </div>
        )}

        {/* ── Bottom-Left: Distance Card ─────────────────────────── */}
        {distance !== null && (
          <div style={{ position: 'absolute', bottom: 20, left: 10, zIndex: 1000, width: 210 }}>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: hasArrived ? '2px solid #10b981' : '1px solid #bfdbfe',
              }}
              styles={{ body: { padding: '12px 14px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <RadarChartOutlined style={{ color: '#2563eb', fontSize: 16 }} />
                <span style={{ fontWeight: 700, fontSize: 12, color: '#1e3a8a' }}>
                  {isTracking ? 'Navigating' : 'Distance'}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                {formatDistance(distance)}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                away from destination
              </div>

              {!hasArrived && etas && (
                <div style={{ paddingTop: 8, borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 11, color: '#475569' }}>🚶 ~{etas.walkMin} min walk</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>🚗 ~{etas.driveMin} min drive</div>
                </div>
              )}

              {hasArrived && (
                <Tag color="success" icon={<CheckCircleFilled />} style={{ width: '100%', textAlign: 'center', borderRadius: 6, margin: 0 }}>
                  You Have Arrived!
                </Tag>
              )}
            </Card>
          </div>
        )}

        {/* ── Bottom-Center: First-time hint ─────────────────────── */}
        {!userLoc && (
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000, background: 'rgba(37, 99, 235, 0.95)', color: '#fff',
            padding: '10px 18px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            boxShadow: '0 4px 16px rgba(37,99,235,0.5)', whiteSpace: 'nowrap',
            animation: 'pulse 2s infinite',
          }}>
            📍 Tap "Show My Location" below to get directions
          </div>
        )}

        {/* ── The Map ────────────────────────────────────────────── */}
        <MapContainer
          center={[lat, lng]}
          zoom={16}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          scrollWheelZoom={true}
        >
          {mapType === 'street' ? (
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          ) : (
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='&copy; Esri' />
          )}

          <ScaleControl imperial={false} position="bottomleft" />

          <MapController
            userLoc={userLoc}
            destLoc={[lat, lng]}
            isTracking={isTracking}
            shouldFitBounds={!hasInitialFit && !!userLoc}
            onFitDone={() => setHasInitialFit(true)}
            manualFocus={manualFocus}
          />

          {/* Dashed line showing direction */}
          {userLoc && distance !== null && distance < 20000 && (
            <Polyline
              positions={[userLoc, [lat, lng]]}
              pathOptions={{ color: '#2563eb', weight: 3, dashArray: '8, 8', opacity: 0.7 }}
            />
          )}

          {/* ✅ NEW: Accuracy Circle (shows the margin of error just like Google Maps) */}
          {userLoc && accuracy > 0 && (
            <Circle
              center={userLoc}
              radius={accuracy}
              pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 1 }}
            />
          )}

          {/* Destination Marker */}
          <Marker position={[lat, lng]} icon={redIcon}>
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>{name}</strong>
                <br />
                <span style={{ fontSize: 12, color: '#64748b' }}>{address}</span>
              </div>
            </Popup>
          </Marker>

          {/* User Marker */}
          {userLoc && (
            <Marker position={userLoc} icon={blueIcon}>
              <Popup>
                <strong>📍 You Are Here</strong>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* ── PRIMARY ACTION BUTTON ────────────────────────────────── */}
      <Button
        block
        size="large"
        icon={
          isLocating ? <LoadingOutlined /> :
          isTracking ? <StopOutlined /> :
          userLoc ? <SendOutlined /> :
          <AimOutlined />
        }
        onClick={
          isTracking ? handleStopTracking :
          userLoc ? handleStartTracking :
          handleShowMyLocation
        }
        loading={isLocating}
        style={{
          marginTop: 12,
          height: 48,
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 14,
          border: 'none',
          background: isTracking
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : userLoc
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#ffffff',
          boxShadow: isTracking
            ? '0 6px 18px rgba(239, 68, 68, 0.4)'
            : userLoc
            ? '0 6px 18px rgba(16, 185, 129, 0.4)'
            : '0 6px 18px rgba(37, 99, 235, 0.4)',
        }}
      >
        {isTracking
          ? '⏹️ Stop Live Navigation'
          : userLoc
          ? '🎯 Start Live Navigation'
          : '📍 Show My Location & Get Directions'}
      </Button>

      {/* ── SECONDARY ACTIONS ────────────────────────────────────── */}
      <Space.Compact style={{ width: '100%', marginTop: 8 }}>
        <Button
          block
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            height: 40,
            borderRadius: '10px 0 0 10px',
            background: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            fontWeight: 700,
          }}
        >
          🧭 Open in Google Maps
        </Button>
        <Button
          icon={<ShareAltOutlined />}
          onClick={handleShare}
          style={{
            height: 40,
            borderRadius: '0 10px 10px 0',
            background: '#ffffff',
            color: '#475569',
            border: '1px solid #bfdbfe',
            fontWeight: 600,
          }}
        >
          Share
        </Button>
      </Space.Compact>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
