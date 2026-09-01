import React, { useState } from 'react';
import { 
  PackageSearch, 
  Search, 
  MapPin, 
  Mail, 
  Globe, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Truck,
  Plane,
  Ship,
  Bus,
  Sparkles,
  Building
} from 'lucide-react';
import { useShipments } from '../context/ShipmentContext';
import ClientMap from './ClientMap';
import ShipmentDetailsCard from './ShipmentDetailsCard';

export default function ClientPortal() {
  const { shipments, activeShipmentId, setActiveShipmentId } = useShipments();
  const [searchInput, setSearchInput] = useState('');
  const [currentSearchId, setCurrentSearchId] = useState(activeShipmentId || 'SP-88219');

  const foundShipment = shipments.find(s => s.id.toUpperCase() === currentSearchId.toUpperCase());

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCurrentSearchId(searchInput.trim().toUpperCase());
    }
  };

  const selectSampleShipment = (id) => {
    setCurrentSearchId(id);
    setSearchInput(id);
    setActiveShipmentId(id);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* Hero Tracking Search Banner */}
      <div className="glass-card" style={{ 
        padding: '40px 30px', 
        marginBottom: '32px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(11, 19, 43, 0.95) 0%, rgba(15, 25, 48, 0.9) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.25)', fontSize: '0.82rem', color: 'var(--primary-cyan)', marginBottom: '14px' }}>
          <Sparkles size={14} /> Global Telemetry & Real-Time Tracking Portal
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>
          Track Your Cargo <span className="text-gradient">With Pinpoint Precision</span>
        </h1>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto 28px auto' }}>
          Enter your unique tracking code below to inspect live vehicle coordinates, carrier telemetry, and complete freight specifications.
        </p>

        {/* Search Bar Input Form */}
        <form onSubmit={handleSearchSubmit} style={{ maxWidth: '580px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} color="var(--primary-cyan)" style={{ position: 'absolute', left: 16, top: 16 }} />
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Enter Tracking Number (e.g. SP-88219)" 
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                style={{
                  paddingLeft: '48px',
                  paddingRight: '16px',
                  height: '52px',
                  fontSize: '1.05rem',
                  borderRadius: 'var(--radius-sm)',
                  letterSpacing: '0.05em'
                }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ height: '52px', padding: '0 28px', fontSize: '1rem' }}>
              Track Cargo <ArrowRight size={18} />
            </button>
          </div>
        </form>

        {/* Quick Sample Selector Pills */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>Try Demo Shipments:</span>
          {shipments.map(s => (
            <button
              key={s.id}
              onClick={() => selectSampleShipment(s.id)}
              style={{
                background: currentSearchId === s.id ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255,255,255,0.06)',
                border: currentSearchId === s.id ? '1px solid var(--primary-cyan)' : '1px solid rgba(255,255,255,0.1)',
                color: currentSearchId === s.id ? 'var(--primary-cyan)' : 'var(--text-main)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              {s.id} ({s.originCity} &rarr; {s.destinationCity})
            </button>
          ))}
        </div>
      </div>

      {/* Main Results View */}
      {foundShipment ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Recap */}
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-cyan)', margin: 0 }}>
                    {foundShipment.id}
                  </h2>
                  <span className={`badge ${foundShipment.isPaused ? 'badge-paused' : (foundShipment.status === 'Delivered' ? 'badge-paid' : 'badge-transit')}`} style={{ fontSize: '0.85rem' }}>
                    {foundShipment.isPaused ? 'PAUSED' : foundShipment.status}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                  Carrier Transport Mode: <strong style={{ color: '#FFF' }}>{foundShipment.transportMode.toUpperCase()}</strong> &bull; Created: {new Date(foundShipment.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Origin</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>{foundShipment.originCity}</div>
                </div>

                <div style={{ color: 'var(--primary-cyan)', fontSize: '1.4rem' }}>&rarr;</div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Destination</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>{foundShipment.destinationCity}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live Map (with Red Pause Notification support) */}
          <ClientMap shipment={foundShipment} />

          {/* Comprehensive Order Specs & Details */}
          <ShipmentDetailsCard shipment={foundShipment} />

        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <PackageSearch size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h2 style={{ color: '#FFF', marginBottom: '8px' }}>No Shipment Found for "{currentSearchId}"</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 20px auto' }}>
            Please check the tracking number format (`SP-XXXXX`) or click one of the demo buttons above.
          </p>
        </div>
      )}

      {/* ShipPulse Agency Feature Showcase */}
      <div style={{ marginTop: '60px' }}>
        <h3 style={{ fontSize: '1.4rem', color: '#FFF', marginBottom: '20px', textAlign: 'center' }}>
          Why Leading Global Enterprises Rely On <span className="text-cyan">ShipPulse</span>
        </h3>

        <div className="grid-3">
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Zap size={22} color="var(--primary-cyan)" />
            </div>
            <h4 style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '8px' }}>Instant Telemetry Sync</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Vehicle positions and status adjustments reflect instantly across client views with zero latencies.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <ShieldCheck size={22} color="#10B981" />
            </div>
            <h4 style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '8px' }}>100% Data Protection</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Runs completely locally with offline capability, secure encryption, and zero third-party data tracking.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Building size={22} color="#3B82F6" />
            </div>
            <h4 style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '8px' }}>Headquarters & Logistics Hub</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Located at <strong>44 Wall St, New York, NY 10005</strong>. Contact operational support anytime at <code>track@shippulse.com</code>.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
