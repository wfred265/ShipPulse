import React from 'react';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Package, 
  Scale, 
  Box, 
  DollarSign, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  AlertTriangle,
  Send,
  UserCheck,
  Globe
} from 'lucide-react';
import { formatLocationString } from '../utils/geo';

export default function ShipmentDetailsCard({ shipment }) {
  if (!shipment) return null;

  const {
    id,
    sender = {},
    recipient = {},
    freight = {},
    timeline = [],
    transportMode,
    originCity,
    destinationCity,
    originLocation,
    destLocation,
    status
  } = shipment;

  const originStr = formatLocationString(originLocation) || originCity;
  const destStr = formatLocationString(destLocation) || destinationCity;

  const isShippingPending = freight.shippingFeeStatus === 'Pending';
  const isInsurancePending = freight.insuranceFeeStatus === 'Pending';
  const isPaymentBlocked = isShippingPending || isInsurancePending;

  const getGoodsTypeBadge = (type) => {
    switch (type) {
      case 'Fragile':
        return <span className="badge" style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>⚠️ Fragile</span>;
      case 'Perishable':
        return <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF', border: '1px solid #93C5FD' }}>🧊 Perishable</span>;
      case 'Hazardous':
        return <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>☣️ Hazardous</span>;
      default:
        return <span className="badge" style={{ background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0' }}>📦 Standard</span>;
    }
  };

  const getFeeBadge = (feeStatus) => {
    switch (feeStatus) {
      case 'Paid':
        return <span className="badge badge-paid">✓ Paid</span>;
      case 'Pending':
        return <span className="badge badge-pending">⌛ Pending</span>;
      case 'Partial':
        return <span className="badge badge-pending">🌗 Partial</span>;
      default:
        return <span className="badge badge-paid">{feeStatus || 'Paid'}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Payment Pending Alert Notice if fees are pending */}
      {isPaymentBlocked && (
        <div style={{
          background: '#FFF1F2',
          border: '2px solid #E11D48',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          color: '#9F1239',
          boxShadow: '0 4px 16px rgba(225, 29, 72, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <AlertTriangle size={26} color="#E11D48" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: '0 0 2px 0', color: '#E11D48', fontSize: '1.05rem' }}>
              TRANSIT HOLD: PAYMENT SETTLEMENT PENDING
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              {isShippingPending && isInsurancePending ? 'Both Shipping Fee and Insurance Coverage Policy fees are Pending.' : (isShippingPending ? 'Shipping Freight Fee is Pending.' : 'Insurance Coverage Policy Fee is Pending.')} Vehicle transit remains locked at departure terminal until fees are Paid or Partially Paid.
            </p>
          </div>
        </div>
      )}

      {/* Sender & Recipient Section Grid */}
      <div className="grid-2">
        
        {/* Sender Card */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
            <Send size={20} color="var(--primary-cyan)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--primary-navy)' }}>Shipper Information</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <div>
              <strong style={{ color: 'var(--text-heading)', fontSize: '1.05rem' }}>
                {sender.firstName} {sender.lastName}
              </strong>
              {sender.company && (
                <div style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Building size={13} /> {sender.company}
                </div>
              )}
            </div>

            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={14} color="var(--primary-cyan)" /> Departure Hub: <strong style={{ color: 'var(--primary-navy)' }}>{originStr}</strong>
            </div>

            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} color="var(--primary-cyan)" /> {sender.email || 'N/A'}
            </div>

            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} color="var(--primary-cyan)" /> {sender.phone || 'N/A'}
            </div>

            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={14} color="var(--primary-cyan)" style={{ marginTop: '2px', flexShrink: 0 }} /> 
              <span>{sender.address || originStr}</span>
            </div>
          </div>
        </div>

        {/* Recipient Card */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
            <UserCheck size={20} color="#059669" />
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--primary-navy)' }}>Recipient Information</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <div>
              <strong style={{ color: 'var(--text-heading)', fontSize: '1.05rem' }}>
                {recipient.firstName} {recipient.lastName}
              </strong>
            </div>

            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={14} color="#059669" /> Destination Hub: <strong style={{ color: 'var(--primary-navy)' }}>{destStr}</strong>
            </div>

            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} color="#059669" /> {recipient.email || 'N/A'}
            </div>

            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} color="#059669" /> {recipient.phone || 'N/A'}
            </div>

            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={14} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} /> 
              <span>{recipient.deliveryAddress || destStr}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Package & Freight Specifications Card */}
      <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
        <div className="flex-between" style={{ marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={22} color="var(--primary-cyan)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--primary-navy)' }}>
              Package & Freight Technical Specs
            </h3>
          </div>
          <div>{getGoodsTypeBadge(freight.goodsType)}</div>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-heading)', marginBottom: '18px', fontStyle: 'italic', background: '#F8FAFC', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
          "{freight.description || 'General commercial freight shipment.'}"
        </p>

        <div className="grid-4" style={{ marginBottom: '16px' }}>
          <div style={{ background: '#F1F5F9', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Scale size={13} color="var(--primary-cyan)" /> Total Weight
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginTop: '2px' }}>
              {freight.weightKg} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kg</span>
            </div>
          </div>

          <div style={{ background: '#F1F5F9', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Box size={13} color="var(--primary-cyan)" /> Volume
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginTop: '2px' }}>
              {freight.volumeM3} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>m³</span>
            </div>
          </div>

          <div style={{ background: '#F1F5F9', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dimensions (L × W × H)</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', marginTop: '2px' }}>
              {freight.dimensions?.length || 0}×{freight.dimensions?.width || 0}×{freight.dimensions?.height || 0} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>cm</span>
            </div>
          </div>

          <div style={{ background: '#F1F5F9', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CreditCard size={13} color="var(--primary-cyan)" /> Overall Status
            </div>
            <div style={{ marginTop: '4px' }}>
              {isPaymentBlocked ? (
                <span className="badge badge-pending">⌛ Hold (Pending)</span>
              ) : (
                <span className="badge badge-paid">✓ Cleared for Transit</span>
              )}
            </div>
          </div>
        </div>

        {/* Financial & Individual Fee Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          paddingTop: '14px',
          borderTop: '1px dashed #E2E8F0',
          fontSize: '0.88rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Declared Goods Value: </span>
            <strong style={{ color: 'var(--primary-navy)' }}>${(freight.declaredValue || 0).toLocaleString()}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)' }}>Shipping Freight Fee: </span>
            <strong style={{ color: 'var(--accent-blue)' }}>${(freight.shippingFee || 0).toLocaleString()}</strong>
            <span style={{ marginLeft: '6px' }}>{getFeeBadge(freight.shippingFeeStatus || 'Paid')}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)' }}>Insurance Coverage: </span>
            <strong style={{ color: '#059669' }}>${(freight.insuranceAmount || 0).toLocaleString()}</strong>
            <span style={{ marginLeft: '6px' }}>{getFeeBadge(freight.insuranceFeeStatus || 'Paid')}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
