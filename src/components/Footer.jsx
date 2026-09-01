import React from 'react';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  Globe,
  Truck,
  ShieldCheck,
  Package
} from 'lucide-react';

export default function Footer() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer style={{
      background: '#0B192C',
      color: '#FFFFFF',
      padding: '60px 20px 30px 20px',
      borderTop: '4px solid var(--primary-cyan)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        
        {/* Column 1: Brand Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <img src="/logo.png" alt="ShipPulse Logo" style={{ height: '42px', width: 'auto' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
              <span style={{ color: '#FFFFFF' }}>SHIP</span>
              <span style={{ color: 'var(--primary-cyan)' }}>PULSE</span>
            </h2>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '16px' }}>
            Precision tracking and multi-modal logistics management. Real-time GPS telemetry for high-value cargo transport.
          </p>
          <div style={{ color: 'var(--primary-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>
            Executive HQ: 44 Wall St, New York, NY 10005
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '16px', borderBottom: '2px solid var(--primary-cyan)', paddingBottom: '6px', display: 'inline-block' }}>
            Quick Navigation
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <li>
              <button onClick={() => scrollToSection('home')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                Home & Live Tracking
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('how-to-ship')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                How to Ship Guide
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                About ShipPulse Headquarters
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('contact')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                Contact Support Desk
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Support */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '16px', borderBottom: '2px solid var(--primary-cyan)', paddingBottom: '6px', display: 'inline-block' }}>
            Operations Support
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#CBD5E1' }}>
              <MapPin size={18} color="var(--primary-cyan)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>44 Wall St, New York, NY 10005, United States</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#CBD5E1' }}>
              <Mail size={18} color="var(--primary-cyan)" style={{ flexShrink: 0 }} />
              <a href="mailto:track.shippulse@gmail.com" style={{ color: '#CBD5E1', textDecoration: 'none' }}>
                track.shippulse@gmail.com
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#CBD5E1' }}>
              <Phone size={18} color="var(--primary-cyan)" style={{ flexShrink: 0 }} />
              <span>+1 (212) 555-0198 (24/7 Dispatch)</span>
            </div>
          </div>
        </div>

      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '20px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        color: '#94A3B8',
        fontSize: '0.78rem'
      }}>
        <div>&copy; {new Date().getFullYear()} ShipPulse Logistics Inc. All rights reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Built with <Heart size={13} color="#FF3366" fill="#FF3366" /> for precision tracking.
        </div>
      </div>
    </footer>
  );
}
