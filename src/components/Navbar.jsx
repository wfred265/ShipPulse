import React, { useState } from 'react';
import { 
  Home, 
  PackageSearch, 
  Info, 
  Mail, 
  Truck,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const [activeNav, setActiveNav] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    setActiveNav(sectionId);
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '12px 20px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Official Brand Logo & Title */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} 
          onClick={() => scrollToSection('home')}
        >
          <img 
            src="/logo.png" 
            alt="ShipPulse Logo" 
            style={{ 
              height: '42px', 
              width: 'auto', 
              objectFit: 'contain'
            }} 
          />
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '0.03em', lineHeight: 1 }}>
              <span style={{ color: 'var(--primary-navy)' }}>SHIP</span>
              <span style={{ color: 'var(--primary-cyan)' }}>PULSE</span>
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontStyle: 'italic' }}>
              Precision tracking, effortless delivery.
            </p>
          </div>
        </div>

        {/* Desktop Navigation Bar */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          
          <button
            onClick={() => scrollToSection('home')}
            style={{
              background: activeNav === 'home' ? 'var(--primary-navy)' : 'transparent',
              color: activeNav === 'home' ? '#FFFFFF' : 'var(--text-main)',
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem'
            }}
          >
            <Home size={15} /> HOME
          </button>

          <button
            onClick={() => scrollToSection('track')}
            style={{
              background: activeNav === 'track' ? 'var(--primary-navy)' : 'transparent',
              color: activeNav === 'track' ? '#FFFFFF' : 'var(--text-main)',
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem'
            }}
          >
            <PackageSearch size={15} /> TRACK
          </button>

          <button
            onClick={() => scrollToSection('how-to-ship')}
            style={{
              background: activeNav === 'how-to-ship' ? 'var(--primary-navy)' : 'transparent',
              color: activeNav === 'how-to-ship' ? '#FFFFFF' : 'var(--text-main)',
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem'
            }}
          >
            <Truck size={15} /> HOW TO SHIP
          </button>

          <button
            onClick={() => scrollToSection('about')}
            style={{
              background: activeNav === 'about' ? 'var(--primary-navy)' : 'transparent',
              color: activeNav === 'about' ? '#FFFFFF' : 'var(--text-main)',
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem'
            }}
          >
            <Info size={15} /> ABOUT US
          </button>

          <button
            onClick={() => scrollToSection('contact')}
            style={{
              background: activeNav === 'contact' ? 'var(--primary-cyan)' : 'transparent',
              color: activeNav === 'contact' ? '#FFFFFF' : 'var(--accent-blue)',
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: activeNav === 'contact' ? 'none' : '1px solid var(--primary-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem'
            }}
          >
            <Mail size={15} /> CONTACT US
          </button>

        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          style={{
            background: '#F1F5F9',
            border: '1px solid #CBD5E1',
            borderRadius: 'var(--radius-sm)',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            cursor: 'pointer',
            color: 'var(--primary-navy)'
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile Touch Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          background: '#FFFFFF',
          borderTop: '1px solid #CBD5E1',
          padding: '16px 20px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          marginTop: '12px'
        }}>
          <button
            onClick={() => scrollToSection('home')}
            className="btn-secondary"
            style={{
              justify: 'flex-start',
              background: activeNav === 'home' ? 'var(--primary-navy)' : '#FFFFFF',
              color: activeNav === 'home' ? '#FFFFFF' : 'var(--text-main)',
              padding: '12px 16px',
              fontSize: '1rem'
            }}
          >
            <Home size={18} /> HOME
          </button>

          <button
            onClick={() => scrollToSection('track')}
            className="btn-secondary"
            style={{
              justify: 'flex-start',
              background: activeNav === 'track' ? 'var(--primary-navy)' : '#FFFFFF',
              color: activeNav === 'track' ? '#FFFFFF' : 'var(--text-main)',
              padding: '12px 16px',
              fontSize: '1rem'
            }}
          >
            <PackageSearch size={18} /> TRACK CARGO
          </button>

          <button
            onClick={() => scrollToSection('how-to-ship')}
            className="btn-secondary"
            style={{
              justify: 'flex-start',
              background: activeNav === 'how-to-ship' ? 'var(--primary-navy)' : '#FFFFFF',
              color: activeNav === 'how-to-ship' ? '#FFFFFF' : 'var(--text-main)',
              padding: '12px 16px',
              fontSize: '1rem'
            }}
          >
            <Truck size={18} /> HOW TO SHIP
          </button>

          <button
            onClick={() => scrollToSection('about')}
            className="btn-secondary"
            style={{
              justify: 'flex-start',
              background: activeNav === 'about' ? 'var(--primary-navy)' : '#FFFFFF',
              color: activeNav === 'about' ? '#FFFFFF' : 'var(--text-main)',
              padding: '12px 16px',
              fontSize: '1rem'
            }}
          >
            <Info size={18} /> ABOUT US
          </button>

          <button
            onClick={() => scrollToSection('contact')}
            className="btn-cyan"
            style={{
              justify: 'center',
              padding: '12px 16px',
              fontSize: '1rem'
            }}
          >
            <Mail size={18} /> CONTACT US
          </button>
        </div>
      )}

      {/* CSS Rule for Toggle visibility */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-toggle { display: flex !important; }
        }
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
