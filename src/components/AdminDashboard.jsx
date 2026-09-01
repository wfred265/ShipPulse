import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Trash2, 
  Users, 
  LogOut, 
  LayoutDashboard,
  Eye,
  Edit3
} from 'lucide-react';
import { useShipments } from '../context/ShipmentContext';
import { useAuth } from '../context/AuthContext';
import AdminMapControl from './AdminMapControl';
import ShipmentDetailsCard from './ShipmentDetailsCard';
import PauseAlertModal from './PauseAlertModal';
import ShipmentFormModal from './ShipmentFormModal';
import ShipmentEditModal from './ShipmentEditModal';
import AdminUsersManager from './AdminUsersManager';
import InvoicePreviewModal from './InvoicePreviewModal';

export default function AdminDashboard() {
  const { 
    shipments, 
    activeShipmentId, 
    setActiveShipmentId, 
    getActiveShipment, 
    deleteShipment 
  } = useShipments();

  const { currentAdmin, logout } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState('fleet');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModalShipment, setEditModalShipment] = useState(null);
  const [pauseModalShipment, setPauseModalShipment] = useState(null);
  const [previewInvoiceShipment, setPreviewInvoiceShipment] = useState(null);

  const activeShipment = getActiveShipment();

  const filteredShipments = shipments.filter(s => 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.destinationCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.sender?.firstName + ' ' + s.sender?.lastName).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTransportEmoji = (mode) => {
    switch (mode) {
      case 'airplane': return '✈️';
      case 'boat': return '🚢';
      case 'bus': return '🚌';
      default: return '🚚';
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }}>
      
      {/* Top Banner with Admin Auth Status */}
      <div className="glass-card" style={{ padding: '18px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderLeft: '5px solid var(--primary-cyan)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-paid" style={{ fontSize: '0.75rem' }}>Protected Admin Console</span>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-navy)', margin: 0 }}>
              ShipPulse Operational Command
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Authenticated: <strong style={{ color: 'var(--primary-navy)' }}>{currentAdmin?.fullName || 'Administrator'}</strong> ({currentAdmin?.role || 'Super Admin'})
          </p>
        </div>

        {/* Tab Switcher & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', flex: 1 }}>
            <button
              onClick={() => setActiveAdminTab('fleet')}
              style={{
                flex: 1,
                background: activeAdminTab === 'fleet' ? 'var(--primary-navy)' : 'transparent',
                color: activeAdminTab === 'fleet' ? '#FFFFFF' : 'var(--text-main)',
                fontWeight: 700,
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                minHeight: '40px'
              }}
            >
              <LayoutDashboard size={15} /> Fleet Command
            </button>

            <button
              onClick={() => setActiveAdminTab('users')}
              style={{
                flex: 1,
                background: activeAdminTab === 'users' ? 'var(--primary-navy)' : 'transparent',
                color: activeAdminTab === 'users' ? '#FFFFFF' : 'var(--text-main)',
                fontWeight: 700,
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                minHeight: '40px'
              }}
            >
              <Users size={15} /> Staff Manager
            </button>
          </div>

          <button className="btn-secondary" onClick={logout} style={{ color: '#E11D48', minHeight: '40px' }}>
            <LogOut size={16} /> Exit
          </button>
        </div>
      </div>

      {/* View 1: Fleet & Map Control Center */}
      {activeAdminTab === 'fleet' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-navy)', margin: 0 }}>
              Active Fleet Telemetry & Direct Map Control
            </h3>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
              {activeShipment && (
                <>
                  <button className="btn-primary" onClick={() => setEditModalShipment(activeShipment)} style={{ flex: 1 }}>
                    <Edit3 size={16} /> Edit Shipment
                  </button>

                  <button className="btn-secondary" onClick={() => setPreviewInvoiceShipment(activeShipment)} style={{ flex: 1 }}>
                    <Eye size={16} color="var(--primary-cyan)" /> Invoice
                  </button>
                </>
              )}
              
              <button className="btn-cyan" onClick={() => setShowCreateModal(true)} style={{ width: '100%' }}>
                <PlusCircle size={18} /> Register New Shipment
              </button>
            </div>
          </div>

          {/* Main Grid: Left List + Right Control Workspace (Responsive Stacking) */}
          <div className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '20px', alignItems: 'start' }}>
            
            {/* Left Column: Shipment List */}
            <div className="glass-card" style={{ padding: '16px' }}>
              <div className="flex-between" style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--primary-navy)', margin: 0 }}>Fleet List ({shipments.length})</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time sync</span>
              </div>

              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Search ID, city, shipper..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px', WebkitOverflowScrolling: 'touch' }}>
                {filteredShipments.map(s => {
                  const isSelected = s.id === activeShipmentId;
                  const isPaymentPending = s.freight?.shippingFeeStatus === 'Pending' || s.freight?.insuranceFeeStatus === 'Pending';
                  return (
                    <div
                      key={s.id}
                      onClick={() => setActiveShipmentId(s.id)}
                      style={{
                        background: isSelected ? '#E0F2FE' : '#FFFFFF',
                        border: isSelected ? '2px solid var(--primary-cyan)' : '1px solid #E2E8F0',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '1.1rem' }}>{getTransportEmoji(s.transportMode)}</span>
                          <strong style={{ color: 'var(--primary-navy)', fontSize: '0.98rem' }}>
                            {s.id}
                          </strong>
                        </div>

                        <span className={`badge ${s.isPaused ? 'badge-paused' : (s.status === 'Delivered' ? 'badge-paid' : (isPaymentPending ? 'badge-pending' : 'badge-transit'))}`} style={{ fontSize: '0.68rem' }}>
                          {s.isPaused ? 'PAUSED' : (isPaymentPending ? 'PAYMENT HOLD' : s.status)}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {s.originCity} &rarr; {s.destinationCity}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <div style={{ flex: 1, height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${s.progressPercentage}%`, height: '100%', background: s.isPaused ? '#E11D48' : (isPaymentPending ? '#F59E0B' : 'var(--primary-cyan)') }}></div>
                        </div>
                        <span>{s.progressPercentage}%</span>
                      </div>

                      {isSelected && (
                        <div style={{ position: 'absolute', right: '8px', bottom: '8px', display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditModalShipment(s);
                            }}
                            title="Edit Shipment"
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary-cyan)', cursor: 'pointer', padding: '6px' }}
                          >
                            <Edit3 size={16} />
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete shipment ${s.id}?`)) deleteShipment(s.id);
                            }}
                            title="Delete Shipment"
                            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredShipments.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No shipments match search query.
                  </div>
                )}
              </div>
            </div>

            {/* Right Main Column */}
            <div>
              {activeShipment ? (
                <div>
                  <AdminMapControl 
                    shipment={activeShipment} 
                    onOpenPauseModal={(s) => setPauseModalShipment(s)} 
                  />

                  <ShipmentDetailsCard shipment={activeShipment} />
                </div>
              ) : (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                  <h3 style={{ color: 'var(--text-muted)' }}>Select a shipment from the list or register a new one.</h3>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* View 2: Admin Users Manager */}
      {activeAdminTab === 'users' && (
        <AdminUsersManager />
      )}

      {/* Modals */}
      {showCreateModal && (
        <ShipmentFormModal onClose={() => setShowCreateModal(false)} />
      )}

      {editModalShipment && (
        <ShipmentEditModal 
          shipment={editModalShipment} 
          onClose={() => setEditModalShipment(null)} 
        />
      )}

      {pauseModalShipment && (
        <PauseAlertModal 
          shipment={pauseModalShipment} 
          onClose={() => setPauseModalShipment(null)} 
        />
      )}

      {previewInvoiceShipment && (
        <InvoicePreviewModal 
          shipment={previewInvoiceShipment} 
          onClose={() => setPreviewInvoiceShipment(null)} 
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .admin-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
