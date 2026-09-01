import React from 'react';
import AdminDashboard from './AdminDashboard';
import ClientPortal from './ClientPortal';
import { Columns, Sparkles } from 'lucide-react';

export default function SplitView() {
  return (
    <div style={{ padding: '16px' }}>
      {/* Banner info */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Columns size={24} color="var(--primary-cyan)" />
        <div>
          <h4 style={{ margin: 0, color: '#FFF', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--primary-cyan)" /> Live Multi-View Real-Time Sync Mode
          </h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Drag the vehicle marker or click <strong>Pause Journey</strong> on the left (Admin Control), and watch the right (Client View) update instantly live via BroadcastChannel & LocalStorage!
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Side: Admin Dashboard */}
        <div style={{ borderRight: '1px dashed rgba(0, 242, 254, 0.2)', paddingRight: '12px' }}>
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', color: 'var(--primary-cyan)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px', display: 'inline-block' }}>
            ADMIN CONTROL PANEL
          </div>
          <AdminDashboard />
        </div>

        {/* Right Side: Client Portal */}
        <div style={{ paddingLeft: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', color: '#34D399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px', display: 'inline-block' }}>
            CLIENT TRACKING WIDGET
          </div>
          <ClientPortal />
        </div>
      </div>
    </div>
  );
}
