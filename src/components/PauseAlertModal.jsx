import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { useShipments } from '../context/ShipmentContext';

const PRESET_REASONS = [
  "Customs Clearance & Border Inspection",
  "Police Highway Check & Weight Station Verification",
  "Mechanical Breakdown & Emergency Maintenance",
  "Mandatory Safety Rest Break for Crew",
  "Severe Weather Warning & Low Visibility",
  "Maritime Port Congestion & Dock Clearance Hold"
];

export default function PauseAlertModal({ shipment, onClose }) {
  const { togglePauseShipment } = useShipments();
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  if (!shipment) return null;

  const handleConfirmPause = () => {
    const finalReason = customReason.trim() || selectedReason;
    togglePauseShipment(shipment.id, finalReason);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255, 51, 102, 0.3)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={24} color="#FF3366" />
            <h3 style={{ margin: 0, color: '#FF3366', fontSize: '1.2rem' }}>
              Pause Shipment {shipment.id}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#AAA', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Pausing this shipment will immediately freeze live vehicle position movement and send an urgent <strong style={{ color: '#FF3366' }}>Red Notification Alert</strong> onto the client's live tracking view.
        </p>

        {/* Reason Select */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: '#FFF' }}>
            Select Official Pause Reason:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PRESET_REASONS.map((r, i) => (
              <label 
                key={i} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '8px 12px', 
                  borderRadius: 'var(--radius-sm)',
                  background: selectedReason === r && !customReason ? 'rgba(255, 51, 102, 0.15)' : 'rgba(7, 13, 30, 0.6)',
                  border: selectedReason === r && !customReason ? '1px solid #FF3366' : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                <input 
                  type="radio" 
                  name="pauseReason" 
                  checked={selectedReason === r && !customReason} 
                  onChange={() => { setSelectedReason(r); setCustomReason(""); }} 
                />
                <span style={{ color: selectedReason === r && !customReason ? '#FFF' : 'var(--text-muted)' }}>{r}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Reason input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#FFF' }}>
            Or Enter Specific Custom Reason:
          </label>
          <input 
            type="text" 
            className="glass-input" 
            placeholder="e.g. Engine belt replacement at Km 140 rest stop" 
            value={customReason}
            onChange={e => setCustomReason(e.target.value)}
          />
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-danger" onClick={handleConfirmPause}>
            <AlertTriangle size={16} /> Confirm Pause & Alert Client
          </button>
        </div>

      </div>
    </div>
  );
}
