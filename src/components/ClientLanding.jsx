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
import { useLanguage } from '../context/LanguageContext';
import ClientMap from './ClientMap';
import ShipmentDetailsCard from './ShipmentDetailsCard';

export default function ClientLanding() {
  const { lang, t } = useLanguage();
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
    
    const rawQuery = trackingCodeInput.trim().toUpperCase();
    const cleanQuery = rawQuery.replace(/[^A-Z0-9]/g, '');
    if (!cleanQuery) return;

    const found = shipments.find(s => {
      const sid = s.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const sidBase = sid.replace(/[UE]$/, '');
      return (
        sid === cleanQuery || 
        sidBase === cleanQuery || 
        sid.includes(cleanQuery) || 
        (cleanQuery.length >= 4 && sidBase.includes(cleanQuery))
      );
    });

    if (found) {
      setActiveTrackingShipment(found);
    } else {
      setSearchError(lang === 'fr' 
        ? `Aucune expédition active trouvée avec le code de suivi "${rawQuery}". Veuillez vérifier votre numéro et réessayer.`
        : `No active shipment found with tracking code "${rawQuery}". Please verify your tracking number and try again.`
      );
    }
  };

  const handleQuickPillClick = (code) => {
    setTrackingCodeInput(code);
    setSearchError('');
    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const found = shipments.find(s => {
      const sid = s.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
      return sid === cleanCode || sid.includes(cleanCode);
    });
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
      q: t('faq1_q'),
      a: t('faq1_a')
    },
    {
      q: t('faq2_q'),
      a: t('faq2_a')
    },
    {
      q: t('faq3_q'),
      a: t('faq3_a')
    },
    {
      q: t('faq4_q'),
      a: t('faq4_a')
    },
    {
      q: t('faq5_q'),
      a: t('faq5_a')
    }
  ];

  // Dynamic Fleet Showcase Tabs Content
  const fleetContent = {
    air: {
      title: t('fleet_air_title'),
      tag: t('fleet_air_tag'),
      desc: t('fleet_air_desc'),
      img: "/cargo_aircraft.png",
      stats: [t('fleet_air_stat1'), t('fleet_air_stat2'), t('fleet_air_stat3')]
    },
    sea: {
      title: t('fleet_sea_title'),
      tag: t('fleet_sea_tag'),
      desc: t('fleet_sea_desc'),
      img: "/port_vessel.png",
      stats: [t('fleet_sea_stat1'), t('fleet_sea_stat2'), t('fleet_sea_stat3')]
    },
    truck: {
      title: t('fleet_truck_title'),
      tag: t('fleet_truck_tag'),
      desc: t('fleet_truck_desc'),
      img: "/workers_helmets.png",
      stats: [t('fleet_truck_stat1'), t('fleet_truck_stat2'), t('fleet_truck_stat3')]
    },
    warehouse: {
      title: t('fleet_wh_title'),
      tag: t('fleet_wh_tag'),
      desc: t('fleet_wh_desc'),
      img: "/workers_helmets.png",
      stats: [t('fleet_wh_stat1'), t('fleet_wh_stat2'), t('fleet_wh_stat3')]
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
              {t('hero_status')}
            </div>

            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '18px', lineHeight: 1.12, letterSpacing: '-0.02em' }}>
              {t('hero_title_prefix')} <span style={{ background: 'linear-gradient(135deg, #00A8E8 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('hero_title_highlight')}</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#94A3B8', maxWidth: '750px', margin: '0 auto 40px auto', lineHeight: '1.65' }}>
              {t('hero_subtitle')}
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
                    placeholder={t('hero_search_placeholder')} 
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
                  {t('hero_track_button')} <ArrowRight size={20} />
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
                  ⚠️ {searchError}
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* Live Operational Ticker Bar */}
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
            <span>{t('ticker_air')}</span>
            <span>{t('ticker_truck')}</span>
            <span>{t('ticker_ocean')}</span>
            <span>{t('ticker_bus')}</span>
            <span>{t('ticker_charter')}</span>
          </div>

          <div style={{ display: 'flex', gap: '40px', paddingRight: '40px', color: '#E2E8F0', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            <span>{t('ticker_air')}</span>
            <span>{t('ticker_truck')}</span>
            <span>{t('ticker_ocean')}</span>
            <span>{t('ticker_bus')}</span>
            <span>{t('ticker_charter')}</span>
          </div>

        </div>
      </div>

      {/* -------------------- SECTION 2: INTERACTIVE FLEET COMMAND SHOWCASE -------------------- */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '80px 20px 40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-blue)', fontWeight: 800 }}>
            {t('fleet_tagline')}
          </span>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-navy)', marginTop: '4px' }}>
            {t('fleet_title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '8px auto 0 auto' }}>
            {t('fleet_subtitle')}
          </p>

          {/* Interactive Category Selector Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveFleetTab('air')}
              className={activeFleetTab === 'air' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 20px' }}
            >
              <Plane size={16} /> {t('tab_air')}
            </button>

            <button
              onClick={() => setActiveFleetTab('sea')}
              className={activeFleetTab === 'sea' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 20px' }}
            >
              <Ship size={16} /> {t('tab_ocean')}
            </button>

            <button
              onClick={() => setActiveFleetTab('truck')}
              className={activeFleetTab === 'truck' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 20px' }}
            >
              <Truck size={16} /> {t('tab_truck')}
            </button>

            <button
              onClick={() => setActiveFleetTab('warehouse')}
              className={activeFleetTab === 'warehouse' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 20px' }}
            >
              <Building size={16} /> {t('tab_warehouse')}
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
              <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.95, marginTop: '4px' }}>{t('stat_deliveries_title')}</div>
              <div style={{ width: '60px', height: '3px', background: 'var(--primary-cyan)', margin: '10px auto 0 auto', borderRadius: '2px' }}></div>
            </div>

            <div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#059669', letterSpacing: '-0.02em' }}>99.8%</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.95, marginTop: '4px' }}>{t('stat_ontime_title')}</div>
              <div style={{ width: '60px', height: '3px', background: '#059669', margin: '10px auto 0 auto', borderRadius: '2px' }}></div>
            </div>

            <div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--primary-cyan)', letterSpacing: '-0.02em' }}>140+</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.95, marginTop: '4px' }}>{t('stat_countries_title')}</div>
              <div style={{ width: '60px', height: '3px', background: 'var(--primary-cyan)', margin: '10px auto 0 auto', borderRadius: '2px' }}></div>
            </div>

            <div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '-0.02em' }}>24/7</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.95, marginTop: '4px' }}>{t('stat_telemetry_title')}</div>
              <div style={{ width: '60px', height: '3px', background: '#F59E0B', margin: '10px auto 0 auto', borderRadius: '2px' }}></div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- SECTION 4: HOW TO SHIP (ID: how-to-ship) -------------------- */}
      <section id="how-to-ship" style={{ background: '#F1F5F9', padding: '80px 20px', scrollMarginTop: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge badge-transit" style={{ marginBottom: '10px' }}>{t('ship_badge')}</span>
            <h2 style={{ fontSize: '2.4rem', color: 'var(--primary-navy)', margin: 0 }}>
              {t('ship_title')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '10px auto 0 auto' }}>
              {t('ship_subtitle')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '50px' }}>
            
            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-navy)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>{t('step1_title')}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {t('step1_desc')}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-cyan)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>{t('step2_title')}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {t('step2_desc')}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-blue)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>{t('step3_title')}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {t('step3_desc')}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#059669', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>
                4
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>{t('step4_title')}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {t('step4_desc')}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------- SECTION 5: ABOUT US (ID: about) -------------------- */}
      <section id="about" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', scrollMarginTop: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="badge badge-paid" style={{ marginBottom: '10px' }}>{t('about_badge')}</span>
          <h2 style={{ fontSize: '2.4rem', color: 'var(--primary-navy)', margin: 0 }}>
            {t('about_title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '700px', margin: '10px auto 0 auto' }}>
            {t('about_subtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          
          <div className="glass-card" style={{ padding: '32px', background: '#FFFFFF' }}>
            <Building size={32} color="var(--primary-cyan)" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '10px' }}>{t('about_hq_title')}</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {t('about_hq_desc')}
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px', background: '#FFFFFF' }}>
            <ShieldCheck size={32} color="#059669" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '10px' }}>{t('about_safety_title')}</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {t('about_safety_desc')}
            </p>
          </div>

        </div>

        <div className="glass-card" style={{ padding: '40px', background: '#FFFFFF', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', marginBottom: '14px' }}>{t('about_mission_title')}</h3>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.7', fontStyle: 'italic', maxWidth: '850px', margin: '0 auto' }}>
            {t('about_mission_quote')}
          </p>
        </div>
      </section>

      {/* -------------------- SECTION 6: FAQ ACCORDION -------------------- */}
      <section style={{ background: '#F8FAFC', padding: '80px 20px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-blue)', fontWeight: 800 }}>
              {t('faq_badge')}
            </span>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-navy)', marginTop: '4px' }}>
              {t('faq_title')}
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
          <span className="badge badge-transit" style={{ marginBottom: '10px' }}>{t('contact_badge')}</span>
          <h2 style={{ fontSize: '2.4rem', color: 'var(--primary-navy)', margin: 0 }}>
            {t('contact_title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '8px auto 0 auto' }}>
            {t('contact_subtitle')}
          </p>
        </div>

        <div className="grid-2" style={{ gap: '30px' }}>
          
          {/* Contact Form */}
          <div className="glass-card" style={{ padding: '32px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '18px' }}>{t('contact_form_title')}</h3>

            {contactSubmitted ? (
              <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', color: '#065F46', padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontWeight: 600 }}>
                {t('contact_success_msg')}
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>{t('contact_name_label')}</label>
                  <input type="text" required className="glass-input" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} placeholder={t('contact_name_ph')} />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>{t('contact_email_label')}</label>
                  <input type="email" required className="glass-input" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} placeholder={t('contact_email_ph')} />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>{t('contact_subject_label')}</label>
                  <input type="text" required className="glass-input" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} placeholder={t('contact_subject_ph')} />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>{t('contact_msg_label')}</label>
                  <textarea required rows="4" className="glass-input" value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} placeholder={t('contact_msg_ph')}></textarea>
                </div>

                <button type="submit" className="btn-cyan" style={{ justifyContent: 'center', height: '46px' }}>
                  {t('contact_submit_btn')} <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>

          {/* Office Info Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="var(--primary-cyan)" /> {t('contact_hq_title')}
              </h3>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                <strong>ShipPulse Logistics Inc.</strong><br />
                44 Wall St, New York, NY 10005<br />
                United States of America
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={20} color="var(--primary-cyan)" /> {t('contact_email_title')}
              </h3>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {t('contact_email_desc')}<br />
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
                    {lang === 'fr' ? 'Expédition' : 'Shipment'} {activeTrackingShipment.id}
                  </h2>
                  <span className={`badge ${activeTrackingShipment.isPaused ? 'badge-paused' : (activeTrackingShipment.status === 'Delivered' ? 'badge-paid' : (activeTrackingShipment.status === 'Payment Pending' ? 'badge-pending' : 'badge-transit'))}`}>
                    {activeTrackingShipment.isPaused
                      ? (lang === 'fr' ? 'EN PAUSE' : 'PAUSED')
                      : activeTrackingShipment.status === 'Payment Pending'
                        ? (lang === 'fr' ? 'PAIEMENT EN ATTENTE' : 'PAYMENT PENDING')
                        : activeTrackingShipment.status === 'In Transit'
                          ? (lang === 'fr' ? 'EN TRANSIT' : 'IN TRANSIT')
                          : activeTrackingShipment.status === 'Delivered'
                            ? (lang === 'fr' ? 'LIVRÉ' : 'DELIVERED')
                            : activeTrackingShipment.status === 'Cancelled'
                              ? (lang === 'fr' ? 'ANNULÉ' : 'CANCELLED')
                              : activeTrackingShipment.status}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  {t('modal_mode')} <strong>{activeTrackingShipment.transportMode.toUpperCase()}</strong> &bull; {t('modal_route')} {activeTrackingShipment.originCity || activeTrackingShipment.originLocation?.city} &rarr; {activeTrackingShipment.destinationCity || activeTrackingShipment.destLocation?.city}
                </p>
              </div>

              <button 
                onClick={() => setActiveTrackingShipment(null)}
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
              >
                <X size={18} /> {t('modal_close')}
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
