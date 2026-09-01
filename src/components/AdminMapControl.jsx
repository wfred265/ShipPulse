import React, { useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Navigation, 
  Zap,
  CheckCircle2,
  AlertOctagon,
  Clock
} from 'lucide-react';
import { useShipments } from '../context/ShipmentContext';
import { formatTownLocationString } from '../utils/geo';

import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const createCustomIcon = (iconHtml, color = '#00A8E8') => {
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.35);
      border: 3px solid #FFFFFF;
      font-size: 18px;
      cursor: grab;
    ">${iconHtml}</div>`,
    className: '',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -21]
  });
};

const originIcon = createCustomIcon('🚩', '#0B192C');
const destIcon = createCustomIcon('🏁', '#059669');

const getTransportEmoji = (mode) => {
  switch (mode) {
    case 'airplane': return '✈️';
    case 'boat': return '🚢';
    case 'bus': return '🚌';
    default: return '🚚';
  }
};

// Component to dynamically auto-fit map viewport bounds to origin and destination
function MapBoundsFitter({ originCoords, destCoords }) {
  const map = useMap();

  useEffect(() => {
    if (originCoords && destCoords && Array.isArray(originCoords) && Array.isArray(destCoords)) {
      try {
        const bounds = L.latLngBounds([originCoords, destCoords]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } catch (err) {
        console.warn("fitBounds error:", err);
      }
    }
  }, [originCoords, destCoords, map]);

  return null;
}

export default function AdminMapControl({ shipment, onOpenPauseModal }) {
  const { updateShipmentCoords, togglePauseShipment, updateShipment } = useShipments();
  const markerRef = useRef(null);

  if (!shipment) return null;

  const {
    id,
    originCoords,
    destCoords,
    currentCoords,
    progressPercentage = 0,
    transportMode,
    isPaused,
    pauseReason,
    status,
    autoMode = true,
    speedMultiplier = 10,
    originCity,
    destinationCity,
    originLocation,
    destLocation,
    freight = {}
  } = shipment;

  const originTownStr = formatTownLocationString(originLocation) || originCity || "Departure Point";
  const destTownStr = formatTownLocationString(destLocation) || destinationCity || "Destination Point";

  const isShippingPending = freight.shippingFeeStatus === 'Pending';
  const isInsurancePending = freight.insuranceFeeStatus === 'Pending';
  const isPaymentBlocked = isShippingPending || isInsurancePending;

  const vehicleIcon = createCustomIcon(
    getTransportEmoji(transportMode), 
    isPaused ? '#E11D48' : (isPaymentBlocked ? '#F59E0B' : 'var(--primary-cyan)')
  );

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          updateShipmentCoords(id, [latLng.lat, latLng.lng]);
        }
      },
    }),
    [id, updateShipmentCoords],
  );

  const handleSpeedChange = (mult) => {
    updateShipment(id, { speedMultiplier: mult });
  };

  const handleToggleAutoMode = () => {
    updateShipment(id, { autoMode: !autoMode });
  };

  const handleResetToOrigin = () => {
    updateShipmentCoords(id, originCoords);
  };

  return (
    <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
      
      {/* Control Panel Bar */}
      <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', margin: 0 }}>
              Live Carrier Control Center ({id})
            </h3>
            <span className={`badge ${isPaused ? 'badge-paused' : (status === 'Delivered' ? 'badge-paid' : (isPaymentBlocked ? 'badge-pending' : 'badge-transit'))}`}>
              {isPaused ? 'PAUSED' : (isPaymentBlocked ? 'PAYMENT HOLD' : status)}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
            Route: <strong>{originTownStr}</strong> &rarr; <strong>{destTownStr}</strong> (Drag marker on map or adjust speed below)
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Pause / Resume Button */}
          {isPaused ? (
            <button className="btn-cyan" onClick={() => togglePauseShipment(id)}>
              <Play size={16} /> Resume Carrier Journey
            </button>
          ) : (
            <button 
              className="btn-secondary" 
              onClick={() => onOpenPauseModal(shipment)}
              style={{ background: '#FFF1F2', color: '#E11D48', borderColor: '#FECDD3' }}
            >
              <Pause size={16} /> Pause Journey (Set Alert)
            </button>
          )}

          {/* Reset Position */}
          <button className="btn-secondary" onClick={handleResetToOrigin} title="Reset Position to Origin">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Auto Simulation Speed Control Bar */}
      <div style={{
        background: '#F1F5F9',
        border: '1px solid #CBD5E1',
        padding: '10px 16px',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={16} color="var(--primary-cyan)" />
          <strong>Auto-Movement Simulator:</strong>
          <button
            onClick={handleToggleAutoMode}
            className={`badge ${autoMode ? 'badge-paid' : 'badge-transit'}`}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            {autoMode ? 'ON (Active Timer)' : 'OFF (Manual Drag)'}
          </button>
        </div>

        {autoMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Simulation Speed:</span>
            {[1, 5, 10, 50, 100].map(mult => (
              <button
                key={mult}
                onClick={() => handleSpeedChange(mult)}
                style={{
                  background: speedMultiplier === mult ? 'var(--primary-navy)' : '#FFFFFF',
                  color: speedMultiplier === mult ? '#FFFFFF' : 'var(--text-main)',
                  border: '1px solid #CBD5E1',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.78rem'
                }}
              >
                {mult}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaflet Map */}
      <div style={{ height: '420px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
        <MapContainer 
          center={currentCoords || originCoords || [40.7128, -74.0060]} 
          zoom={4} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Auto Fitter for Map Viewport Bounds */}
          <MapBoundsFitter originCoords={originCoords} destCoords={destCoords} />

          {/* Planned Polyline */}
          <Polyline 
            positions={[originCoords, destCoords]} 
            color="#94A3B8" 
            weight={4} 
            dashArray="6, 8" 
            opacity={0.7} 
          />

          {/* Completed Polyline */}
          <Polyline 
            positions={[originCoords, currentCoords || originCoords]} 
            color={isPaused ? '#E11D48' : (isPaymentBlocked ? '#F59E0B' : '#00A8E8')} 
            weight={6} 
            opacity={0.9} 
          />

          {/* Departure Marker */}
          <Marker position={originCoords} icon={originIcon}>
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ color: 'var(--primary-navy)' }}>🚩 Departure Origin</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#475569' }}>
                  {originTownStr}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker position={destCoords} icon={destIcon}>
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ color: '#059669' }}>🏁 Destination Arrival</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#475569' }}>
                  {destTownStr}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Draggable Vehicle Carrier Marker */}
          <Marker 
            draggable={true}
            eventHandlers={eventHandlers}
            position={currentCoords || originCoords} 
            icon={vehicleIcon}
            ref={markerRef}
          >
            <Popup minWidth={190}>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ color: 'var(--primary-navy)' }}>
                  {getTransportEmoji(transportMode)} Carrier {id}
                </strong>
                <p style={{ margin: '4px 0', fontSize: '0.82rem', color: '#475569' }}>
                  Progress: <strong>{progressPercentage}%</strong>
                </p>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Drag marker to manually reposition vehicle
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

    </div>
  );
}
