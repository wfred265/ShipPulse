import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Clock, MapPin, Truck, Plane, Ship, Bus } from 'lucide-react';
import { formatTownLocationString } from '../utils/geo';
import { getShipmentRegionConfig } from '../utils/regionUtils';

import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Create custom icons
const createCustomIcon = (iconHtml, color = '#00A8E8') => {
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      border: 3px solid #FFFFFF;
      font-size: 16px;
    ">${iconHtml}</div>`,
    className: '',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
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

export default function ClientMap({ shipment }) {
  if (!shipment) return null;

  // Determine language based on shipment region (EUROPE = FR, USA = EN)
  const regionConfig = getShipmentRegionConfig(shipment);
  const isFR = regionConfig.lang === 'fr';

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
    originCity,
    destinationCity,
    originLocation,
    destLocation,
    freight = {}
  } = shipment;

  const originTownStr = formatTownLocationString(originLocation) || originCity || (isFR ? "Point de Départ" : "Departure Point");
  const destTownStr = formatTownLocationString(destLocation) || destinationCity || (isFR ? "Point d'Arrivée" : "Destination Point");

  const vehicleIcon = createCustomIcon(
    getTransportEmoji(transportMode), 
    isPaused ? '#E11D48' : (status === 'Payment Pending' ? '#F59E0B' : 'var(--primary-cyan)')
  );

  const isShippingPending = freight.shippingFeeStatus === 'Pending';
  const isInsurancePending = freight.insuranceFeeStatus === 'Pending';
  const isPaymentBlocked = isShippingPending || isInsurancePending;

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '24px' }}>
      
      {/* RED PAUSE ALERT BANNER (If shipment is paused by admin) */}
      {isPaused && (
        <div className="pause-alert-banner">
          <AlertTriangle size={24} color="#FFFFFF" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800 }}>
              {isFR
                ? 'TRANSIT SUSPENDU — ALERTE TÉLÉMÉTRIE OFFICIELLE'
                : 'PAUSED IN TRANSIT — OFFICIAL TELEMETRY ALERT'}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.95 }}>
              {isFR ? 'Motif :' : 'Reason:'}{' '}
              {pauseReason || (isFR
                ? "Véhicule transporteur immobilisé pour inspection administrative et vérification de sécurité."
                : "Carrier vehicle held for administrative inspection and safety verification.")}
            </div>
          </div>
        </div>
      )}

      {/* YELLOW PAYMENT PENDING ALERT BANNER */}
      {isPaymentBlocked && !isPaused && (
        <div style={{
          background: '#FEF3C7',
          border: '2px solid #F59E0B',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          color: '#92400E',
          marginBottom: '16px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Clock size={22} color="#F59E0B" />
          <div>
            <div>
              {isFR
                ? `EN ATTENTE AU DÉPART (${originTownStr})`
                : `HOLD AT DEPARTURE (${originTownStr})`}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              {isFR
                ? `Paiement en attente. Le règlement des frais doit être effectué avant le départ vers ${destTownStr}.`
                : `Payment status is Pending. Fee settlement must be completed before transit to ${destTownStr} initiates.`}
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div style={{ height: '420px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid #CBD5E1', boxShadow: 'var(--shadow-md)' }}>
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

          {/* Full Planned Route Polyline */}
          <Polyline 
            positions={[originCoords, destCoords]} 
            color="#94A3B8" 
            weight={4} 
            dashArray="6, 8" 
            opacity={0.7} 
          />

          {/* Completed Distance Polyline */}
          <Polyline 
            positions={[originCoords, currentCoords || originCoords]} 
            color={isPaused ? '#E11D48' : (isPaymentBlocked ? '#F59E0B' : '#00A8E8')} 
            weight={6} 
            opacity={0.9} 
          />

          {/* Origin Marker */}
          <Marker position={originCoords} icon={originIcon}>
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
                  🚩 {isFR ? 'Point de Départ' : 'Departure Origin'}
                </strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                  {originTownStr}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker position={destCoords} icon={destIcon}>
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                  🏁 {isFR ? "Point d'Arrivée" : 'Destination Arrival'}
                </strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                  {destTownStr}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Vehicle Carrier Marker */}
          <Marker position={currentCoords || originCoords} icon={vehicleIcon}>
            <Popup>
              <div style={{ textAlign: 'center', minWidth: '180px' }}>
                <div className="badge badge-transit" style={{ marginBottom: '6px', display: 'inline-block' }}>
                  {getTransportEmoji(transportMode)} {isFR ? 'Télémétrie Transporteur' : 'Live Carrier Telemetry'}
                </div>
                <h4 style={{ margin: '2px 0', color: 'var(--primary-navy)' }}>
                  {isFR ? 'Expédition' : 'Shipment'} {id}
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {isFR ? 'Progression :' : 'Progress:'} <strong>{progressPercentage}%</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                  {isFR ? 'En route :' : 'En route:'} {originTownStr} &rarr; {destTownStr}
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

    </div>
  );
}
