import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  Mail, 
  Building, 
  Globe, 
  CheckCircle2, 
  Package, 
  Clock, 
  Sparkles,
  Users,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
  Phone,
  FileText,
  Truck,
  Plane,
  Ship,
  Award,
  HelpCircle,
  MessageSquare,
  Activity,
  Navigation,
  Compass,
  Radio
} from 'lucide-react';
import { useShipments } from '../context/ShipmentContext';
import ClientMap from './ClientMap';
import ShipmentDetailsCard from './ShipmentDetailsCard';

export default function ClientLanding() {
  const { shipments } = useShipments();
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [activeTrackingShipment, setActiveTrackingShipment] = useState(null);
  const [searchError, setSearchError] = useState('');

  const [activeFleetTab, setActiveFleetTab] = useState('air'); // 'air' | 'sea' | 'truck' | 'warehouse'
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [openFaq, setOpenFaq] = useState(0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchError('');
    
    const query = trackingCodeInput.trim().toUpperCase();
    if (!query) return;

    const found = shipments.find(s => s.id.toUpperCase() === query);
    if (found) {
      setActiveTrackingShipment(found);
    } else {
      setSearchError(`No active shipment found with tracking code "${query}". Please verify your tracking number and try again.`);
    }
  };

  const handleQuickPillClick = (code) => {
    setTrackingCodeInput(code);
    setSearchError('');
    const found = shipments.find(s => s.id.toUpperCase() === code);
    if (found) {
      setActiveTrackingShipment(found);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setContactSubmitted(false);
    }, 4000);
  };

  const faqs = [
    {
      q: "How do I track my cargo live with ShipPulse?",
      a: "Simply enter your unique tracking code (format SP-XXXXX) into the tracking search bar on our homepage. Your shipment telemetry, real-time map location, and full package specifications will be displayed instantly."
    },
    {
      q: "What transport modes are supported by ShipPulse?",
      a: "ShipPulse coordinates multi-modal logistics across International Air Freight, Ocean Container Ships, Intercity Highway Trucks, and Express Bus Courier networks."
    },
    {
      q: "When must cargo insurance coverage and shipping fees be paid?",
      a: "Both shipping fees and insurance coverage policies must be settled (Paid or Partially Paid) before a carrier journey can commence. If either fee is Pending, the shipment remains on Payment Hold at origin."
    },
    {
      q: "What happens if a shipment is temporarily held or paused?",
      a: "If a carrier vehicle is paused due to customs clearance, mandatory crew rest, or safety checks, a red alert notification immediately appears on your tracking screen with the official explanation."
    },
    {
      q: "Where is the ShipPulse executive headquarters located?",
      a: "Our global headquarters desk is located at 44 Wall St, New York, NY 10005, USA. You can contact our operations support team anytime at track.shippulse@gmail.com."
    }
  ];

  // Dynamic Fleet Showcase Tabs Content
  const fleetContent = {
    air: {
      title: "Express Air Freight Command",
      tag: "GLOBAL FLIGHT DISPATCH",
      desc: "Dedicated jet freighters connecting key financial and logistics capitals with expedited flight times and continuous barometric telemetry.",
      img: "/cargo_aircraft.png",
      stats: ["Avg Transit: 12-24 hrs", "Payload: Up to 110 Tons", "Altitude Telemetry: Live GPS"]
    },
    sea: {
      title: "Ocean Container Maritime Logistics",
      tag: "DEEP SEA FREIGHT",
      desc: "High-volume container ships providing reliable maritime ocean freight with satellite position telemetry across international sea routes.",
      img: "/port_vessel.png",
      stats: ["Capacity: 18,000 TEU", "Port Telemetry: AIS Satellite", "Customs clearance: Automated"]
    },
    truck: {
      title: "Highway Express Truck Fleet",
      tag: "INTERCITY HIGHWAY NETWORK",
      desc: "Intercity highway trucks and express courier vehicles equipped with temperature sensors, GPS route tracking, and automated ETA algorithms.",
      img: "/workers_helmets.png",
      stats: ["Coverage: All 50 US States & EU", "Driver Status: Dual-Crew Shift", "Route Fit: Automated GPS"]
    },
    warehouse: {
      title: "Automated Smart Warehousing",
      tag: "SAFETY-INSPECTED HUB",
      desc: "Warehouse operators wearing protective safety helmets perform multi-point inspections, barcode scanning, and security sealing prior to dispatch.",
      img: "/workers_helmets.png",
      stats: ["Verification: 100% Barcode Audit", "Security: 24/7 Monitored", "Seal Verification: Electronic"]
    }
  };

  const currentFleet = fleetContent[activeFleetTab];

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      
      {/* -------------------- SECTION 1: DYNAMIC ANIMATED HERO & LIVE TRACKING -------------------- */}
      <section id="home" style={{ scrollMarginTop: '80px' }}>
        <div id="track" style={{
          background: 'linear-gradient(135deg, #0B192C 0%, #001F3F 50%, #003366 100%)',
          color: '#FFFFFF',
          padding: '80px 20px 100px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          scrollMarginTop: '80px'
        }}>
          
          {/* Animated Background Mesh & Floating Radar Circles */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '700px',
            background: 'radial-gradient(circle, rgba(0, 168, 232, 0.22) 0%, rgba(5, 150, 105, 0.08) 45%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1
          }}></div>

          {/* Animated Radar Pulse Rings */}
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            border: '2px solid rgba(0, 168, 232, 0.25)',
            borderRadius: '50%',
            animation: 'radarPulse 4s infinite linear',
            pointerEvents: 'none',
            zIndex: 1
          }}></div>

          <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            
            {/* Live Operational Status Beacon */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(11, 25, 44, 0.75)',
              border: '1px solid var(--primary-cyan)',
              color: 'var(--primary-cyan)',
              fontSize: '0.85rem',
              fontWeight: 800,
              marginBottom: '24px',
              boxShadow: '0 0 20px rgba(0, 168, 232, 0.3)',
              backdropFilter: 'blur(8px)'
            }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#059669',
                boxShadow: '0 0 10px #059669',
                display: 'inline-block'
              }}></span>
              <Radio size={15} color="var(--primary-cyan)" style={{ animation: 'spin 6s linear infinite' }} />
              SYSTEM ONLINE &bull; LIVE GLOBAL TELEMETRY ACTIVE
            </div>

            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '18px', lineHeight: 1.12, letterSpacing: '-0.02em' }}>
              Precision Tracking, <span style={{ background: 'linear-gradient(135deg, #00A8E8 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Effortless Delivery.</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#94A3B8', maxWidth: '750px', margin: '0 auto 40px auto', lineHeight: '1.65' }}>
              Track high-value cargo live across international air, ocean, and highway networks with pinpoint GPS accuracy, instant telemetry alerts, and automated manifest auditing.
            </p>

            {/* Glowing Glassmorphism Search Container */}
            <div style={{ 
              maxWidth: '680px', 
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid rgba(0, 168, 232, 0.4)',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.35), 0 0 25px rgba(0, 168, 232, 0.25)',
              backdropFilter: 'blur(12px)',
              animation: 'glowBorder 4s infinite alternate'
            }}>
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                  <Search size={22} color="var(--primary-cyan)" style={{ position: 'absolute', left: 16, top: 16 }} />
                  <input 
                    type="text" 
                    placeholder="Enter Tracking Code" 
                    value={trackingCodeInput}
                    onChange={e => setTrackingCodeInput(e.target.value)}
                    style={{
                      width: '100%',
                      height: '54px',
                      paddingLeft: '50px',
                      paddingRight: '16px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #CBD5E1',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      outline: 'none',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-cyan"
                  style={{ height: '54px', padding: '0 32px', fontSize: '1.05rem', borderRadius: 'var(--radius-sm)' }}
                >
                  Track Cargo <ArrowRight size={20} />
                </button>
              </form>

              {searchError && (
                <div style={{
                  marginTop: '16px',
                  background: 'rgba(225, 29, 72, 0.2)',
                  border: '1px solid #E11D48',
                  color: '#FECDD3',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  {searchError}
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Lock size={13} color="var(--primary-cyan)" /> Privacy Protected: Detailed shipment telemetry is disclosed only with a valid tracking code.
            </p>

          </div>
        </div>
      </section>

      {/* -------------------- DYNAMIC LIVE DISPATCH TELEMETRY TICKER BAR -------------------- */}
      <div style={{
        background: '#0B192C',
        borderTop: '2px solid var(--primary-cyan)',
        borderBottom: '1px solid #1E293B',
        padding: '10px 0',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '200%', animation: 'tickerScroll 25s linear infinite' }}>
          
          <div style={{ display: 'flex', gap: '40px', paddingRight: '40px', color: '#E2E8F0', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            <span>✈️ Air Freight Jet departed JFK New York &rarr; FRA Frankfurt (In Flight)</span>
            <span>🚚 Highway Express Truck arrived Chicago IL Hub (Milestone Verified)</span>
            <span>🚢 Ocean Vessel docked Shanghai Container Terminal (Customs Cleared)</span>
            <span>🚌 Intercity Express Courier en route Plattsburgh NY &rarr; Montreal CA</span>
            <span>✈️ Air Cargo Charter departed Tokyo Haneda &rarr; Los Angeles CA</span>
          </div>

          <div style={{ display: 'flex', gap: '40px', paddingRight: '40px', color: '#E2E8F0', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            <span>✈️ Air Freight Jet departed JFK New York &rarr; FRA Frankfurt (In Flight)</span>
            <span>🚚 Highway Express Truck arrived Chicago IL Hub (Milestone Verified)</span>
            <span>🚢 Ocean Vessel docked Shanghai Container Terminal (Customs Cleared)</span>
            <span>🚌 Intercity Express Courier en route Plattsburgh NY &rarr; Montreal CA</span>
            <span>✈️ Air Cargo Charter departed Tokyo Haneda &rarr; Los Angeles CA</span>
          </div>

        </div>
      </div>

      {/* -------------------- SECTION 2: INTERACTIVE FLEET COMMAND SHOWCASE -------------------- */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '80px 20px 40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-blue)', fontWeight: 800 }}>
            Dynamic Fleet Operations
          </span>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-navy)', marginTop: '4px' }}>
            Multi-Modal Fleet Command Center
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '8px auto 0 auto' }}>
            Explore our safety-certified transport divisions operating across international airspace, maritime ports, and highway corridors.
          </p>

          {/* Interactive Category Selector Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveFleetTab('air')}
              className={activeFleetTab === 'air' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 20px' }}
            >
              <Plane size={16} /> Air Freight
            </button>

            <button
              onClick={() => setActiveFleetTab('sea')}
              className={activeFleetTab === 'sea' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 20px' }}
            >
              <Ship size={16} /> Ocean Vessel
            </button>

            <button
              onClick={() => setActiveFleetTab('truck')}
              className={activeFleetTab === 'truck' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 20px' }}
            >
              <Truck size={16} /> Highway Express
            </button>

            <button
              onClick={() => setActiveFleetTab('warehouse')}
              className={activeFleetTab === 'warehouse' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 20px' }}
            >
              <Building size={16} /> Smart Warehouse
            </button>
          </div>
        </div>

        {/* Featured Fleet Card Container */}
        <div className="glass-card" style={{ padding: '36px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <div className="grid-2" style={{ alignItems: 'center', gap: '36px' }}>
            
            <div>
              <span className="badge badge-paid" style={{ marginBottom: '12px' }}>
                {currentFleet.tag}
              </span>
              <h3 style={{ fontSize: '2rem', color: 'var(--primary-navy)', marginBottom: '14px' }}>
                {currentFleet.title}
              </h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                {currentFleet.desc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentFleet.stats.map((st, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--primary-navy)', fontWeight: 600 }}>
                    <CheckCircle2 size={18} color="var(--primary-cyan)" /> {st}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img 
                src={currentFleet.img} 
                alt={currentFleet.title}
                style={{ width: '100%', height: '340px', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- SECTION 3: NEON GLOBAL STATS COUNTER -------------------- */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 20px 80px 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0B192C 0%, #0077B6 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '44px 32px',
          color: '#FFFFFF',
          boxShadow: '0 16px 40px rgba(11, 25, 44, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', textAlign: 'center' }}>
            
            <div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--primary-cyan)', letterSpacing: '-0.02em' }}>2.4M+</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.95, marginTop: '4px' }}>Successful Deliveries</div>
              <div style={{ width: '60px', height: '3px', background: 'var(--primary-cyan)', margin: '10px auto 0 auto', borderRadius: '2px' }}></div>
            </div>

            <div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#059669', letterSpacing: '-0.02em' }}>99.8%</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.95, marginTop: '4px' }}>On-Time Arrival Rate</div>
              <div style={{ width: '60px', height: '3px', background: '#059669', margin: '10px auto 0 auto', borderRadius: '2px' }}></div>
            </div>

            <div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--primary-cyan)', letterSpacing: '-0.02em' }}>140+</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.95, marginTop: '4px' }}>Countries Covered</div>
              <div style={{ width: '60px', height: '3px', background: 'var(--primary-cyan)', margin: '10px auto 0 auto', borderRadius: '2px' }}></div>
            </div>

            <div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '-0.02em' }}>24/7</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.95, marginTop: '4px' }}>Live GPS Telemetry</div>
              <div style={{ width: '60px', height: '3px', background: '#F59E0B', margin: '10px auto 0 auto', borderRadius: '2px' }}></div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- SECTION 4: HOW TO SHIP (ID: how-to-ship) -------------------- */}
      <section id="how-to-ship" style={{ background: '#F1F5F9', padding: '80px 20px', scrollMarginTop: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge badge-transit" style={{ marginBottom: '10px' }}>Step-by-Step Freight Guide</span>
            <h2 style={{ fontSize: '2.4rem', color: 'var(--primary-navy)', margin: 0 }}>
              How to Ship With ShipPulse
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '10px auto 0 auto' }}>
              Follow our streamlined 4-step workflow to prepare, book, insure, and monitor your cargo shipments effortlessly.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '50px' }}>
            
            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-navy)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>Package & Manifest Prep</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Package your commercial goods or fragile items according to international packing standards. Accurately measure weight (kg) and dimensions (L×W×H cm).
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-cyan)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>Select Mode & Insurance</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Choose Air Freight, Ocean Shipping, Express Bus, or Highway Trucking. Select comprehensive cargo insurance policy coverage.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-blue)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>Tracking Code Dispatch</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Receive your unique ShipPulse tracking code (`SP-XXXXX`) and official PDF Invoice / Freight Manifest for customs and consignee verification.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#059669', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>
                4
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>Live GPS Telemetry</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Monitor carrier position live on interactive maps from departure to final recipient destination with instant milestone notifications.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------- SECTION 5: ABOUT US (ID: about) -------------------- */}
      <section id="about" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', scrollMarginTop: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="badge badge-paid" style={{ marginBottom: '10px' }}>Global Headquarters Desk</span>
          <h2 style={{ fontSize: '2.4rem', color: 'var(--primary-navy)', margin: 0 }}>
            About ShipPulse Logistics Inc.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '700px', margin: '10px auto 0 auto' }}>
            Founded on the principle of precision tracking and effortless delivery, ShipPulse provides continuous cargo telemetry and multi-modal logistics.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          
          <div className="glass-card" style={{ padding: '32px', background: '#FFFFFF' }}>
            <Building size={32} color="var(--primary-cyan)" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '10px' }}>Executive Headquarters</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Located at <strong>44 Wall St, New York, NY 10005</strong>, our central command hub manages international carrier scheduling, insurance compliance, and real-time telemetry dispatch.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px', background: '#FFFFFF' }}>
            <ShieldCheck size={32} color="#059669" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '10px' }}>Safety & Compliance</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              All transport partners and warehouse personnel are safety-certified. Cargo manifests are audited for compliance prior to departure.
            </p>
          </div>

        </div>

        <div className="glass-card" style={{ padding: '40px', background: '#FFFFFF', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', marginBottom: '14px' }}>Our Mission Statement</h3>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.7', fontStyle: 'italic', maxWidth: '850px', margin: '0 auto' }}>
            "To empower global trade with transparent, reliable, and instantaneous cargo telemetry, ensuring every shipment arrives safely with precision and zero guesswork."
          </p>
        </div>
      </section>

      {/* -------------------- SECTION 6: FAQ ACCORDION -------------------- */}
      <section style={{ background: '#F8FAFC', padding: '80px 20px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-blue)', fontWeight: 800 }}>
              Frequently Asked Questions
            </span>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-navy)', marginTop: '4px' }}>
              Got Questions? We Have Answers.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div 
                  key={i} 
                  className="glass-card" 
                  style={{ padding: '18px 22px', cursor: 'pointer', background: '#FFFFFF' }}
                  onClick={() => setOpenFaq(isOpen ? -1 : i)}
                >
                  <div className="flex-between">
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-navy)', margin: 0 }}>
                      {faq.q}
                    </h4>
                    {isOpen ? <ChevronUp size={20} color="var(--primary-cyan)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </div>

                  {isOpen && (
                    <p style={{ marginTop: '12px', fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------- SECTION 7: CONTACT US (ID: contact) -------------------- */}
      <section id="contact" style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 20px', scrollMarginTop: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge badge-transit" style={{ marginBottom: '10px' }}>Operational Contact Desk</span>
          <h2 style={{ fontSize: '2.4rem', color: 'var(--primary-navy)', margin: 0 }}>
            Get in Touch With ShipPulse
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '8px auto 0 auto' }}>
            Our logistics officers at 44 Wall St are available 24/7 to assist with cargo inquiries, quotes, and insurance policies.
          </p>
        </div>

        <div className="grid-2" style={{ gap: '30px' }}>
          
          {/* Contact Form */}
          <div className="glass-card" style={{ padding: '32px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '18px' }}>Send Us an Inquiry</h3>

            {contactSubmitted ? (
              <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', color: '#065F46', padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontWeight: 600 }}>
                ✓ Thank you! Your inquiry has been sent to track.shippulse@gmail.com. An operational specialist will reply shortly.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                  <input type="text" required className="glass-input" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} placeholder="John Doe" />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>Email Address *</label>
                  <input type="email" required className="glass-input" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} placeholder="jdoe@company.com" />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>Subject *</label>
                  <input type="text" required className="glass-input" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} placeholder="Freight Charter Inquiry / Insurance Policy" />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>Message *</label>
                  <textarea required rows="4" className="glass-input" value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} placeholder="Provide shipment weight, route, and cargo details..."></textarea>
                </div>

                <button type="submit" className="btn-cyan" style={{ justifyContent: 'center', height: '46px' }}>
                  Submit Message <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>

          {/* Office Info Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="var(--primary-cyan)" /> Executive Headquarters
              </h3>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                <strong>ShipPulse Logistics Inc.</strong><br />
                44 Wall St, New York, NY 10005<br />
                United States of America
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={20} color="var(--primary-cyan)" /> Direct Email Contact
              </h3>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                General & Freight Support:<br />
                <a href="mailto:track.shippulse@gmail.com" style={{ color: 'var(--accent-blue)', fontWeight: 700, textDecoration: 'none' }}>
                  track.shippulse@gmail.com
                </a>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Shipment Details Result Modal / Drawer when client enters tracking code */}
      {activeTrackingShipment && (
        <div className="modal-overlay" onClick={() => setActiveTrackingShipment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1050px', background: '#F8FAFC' }}>
            
            {/* Modal Header */}
            <div className="flex-between" style={{ marginBottom: '20px', borderBottom: '2px solid var(--primary-cyan)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-navy)', margin: 0 }}>
                    Shipment {activeTrackingShipment.id}
                  </h2>
                  <span className={`badge ${activeTrackingShipment.isPaused ? 'badge-paused' : (activeTrackingShipment.status === 'Delivered' ? 'badge-paid' : (activeTrackingShipment.status === 'Payment Pending' ? 'badge-pending' : 'badge-transit'))}`}>
                    {activeTrackingShipment.isPaused ? 'PAUSED' : activeTrackingShipment.status}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Mode: <strong>{activeTrackingShipment.transportMode.toUpperCase()}</strong> &bull; Route: {activeTrackingShipment.originCity || activeTrackingShipment.originLocation?.city} &rarr; {activeTrackingShipment.destinationCity || activeTrackingShipment.destLocation?.city}
                </p>
              </div>

              <button 
                onClick={() => setActiveTrackingShipment(null)}
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
              >
                <X size={18} /> Close View
              </button>
            </div>

            {/* Interactive Client Map */}
            <ClientMap shipment={activeTrackingShipment} />

            {/* Complete Technical Specification Details Card */}
            <ShipmentDetailsCard shipment={activeTrackingShipment} />

          </div>
        </div>
      )}

    </div>
  );
}
