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
  Globe,
  Flag
} from 'lucide-react';
import { formatLocationString } from '../utils/geo';
import { getShipmentRegionConfig } from '../utils/regionUtils';
import { translations } from '../utils/translations';

export default function ShipmentDetailsCard({ shipment }) {
  if (!shipment) return null;

  const regionConfig = getShipmentRegionConfig(shipment);
  const isFR = regionConfig.lang === 'fr';
  const formatCurrency = regionConfig.formatCurrency;

  const t = (key) => {
    const langDict = isFR ? translations.fr : translations.en;
    return langDict[key] || translations.en[key] || key;
  };

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
        return <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF', border: '1px solid #93C5FD' }}>🧊 {isFR ? 'Périssable' : 'Perishable'}</span>;
      case 'Hazardous':
        return <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>☣️ {isFR ? 'Dangereux' : 'Hazardous'}</span>;
      default:
        return <span className="badge" style={{ background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0' }}>📦 Standard</span>;
    }
  };

  const getFeeBadge = (feeStatus) => {
    switch (feeStatus) {
      case 'Paid':
        return <span className="badge badge-paid">✓ {isFR ? 'Payé' : 'Paid'}</span>;
      case 'Pending':
        return <span className="badge badge-pending">⌛ {isFR ? 'En Attente' : 'Pending'}</span>;
      case 'Partial':
        return <span className="badge badge-pending">🌗 {isFR ? 'Partiel' : 'Partial'}</span>;
      default:
        return <span className="badge badge-paid">{feeStatus || (isFR ? 'Payé' : 'Paid')}</span>;
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
          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '0.98rem', marginBottom: '6px' }}>
            <AlertTriangle size={20} color="#E11D48" />
            {isFR ? 'BLOCAGE SÉCURITÉ PAIEMENT EN ATTENTE' : 'PAYMENT PENDING SAFETY BLOCK'}
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5' }}>
            {isFR ? 'Attention : Le transport est actuellement suspendu. Les frais de fret ou d\'assurance sont en attente de règlement.' : 'Notice: Shipment transit is on hold. Shipping or insurance fees require settlement before cargo dispatch can proceed.'}
          </p>
        </div>
      )}

      {/* Grid Row 1: Shipper & Recipient Information */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Shipper Details */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-navy)' }}>
              <Send size={20} color="var(--primary-cyan)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 800 }}>
                {t('inv_sender_title')}
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '4px 8px', background: '#E0F2FE', color: 'var(--primary-navy)', borderRadius: 'var(--radius-sm)' }}>
              {regionConfig.flag} {regionConfig.region}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="var(--text-muted)" />
              <strong>{sender.firstName} {sender.lastName}</strong>
            </div>

            {sender.company && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={16} color="var(--text-muted)" />
                <span>{sender.company}</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="var(--text-muted)" />
              <a href={`mailto:${sender.email}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>{sender.email || 'N/A'}</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--text-muted)" />
              <span>{sender.phone || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={16} color="var(--primary-cyan)" style={{ marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--primary-navy)' }}>{t('inv_departure_town')} {originStr}</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sender.address || originStr}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Details */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#059669', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
            <UserCheck size={20} color="#059669" />
            <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 800 }}>
              {t('inv_recipient_title')}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="var(--text-muted)" />
              <strong>{recipient.firstName} {recipient.lastName}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="var(--text-muted)" />
              <a href={`mailto:${recipient.email}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>{recipient.email || 'N/A'}</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--text-muted)" />
              <span>{recipient.phone || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={16} color="#059669" style={{ marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#059669' }}>{t('inv_dest_town')} {destStr}</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{recipient.deliveryAddress || destStr}</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Freight Specs & Financial Settlement Card */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--primary-navy)', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
          <Package size={20} color="var(--primary-cyan)" />
          <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 800 }}>
            {t('inv_specs_title')} & {t('inv_financial_freight_title')}
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.88rem' }}>
          
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>{t('inv_th_desc')}</span>
            <strong>{freight.description || 'General Freight'}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>{t('inv_th_category')}</span>
            {getGoodsTypeBadge(freight.goodsType)}
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>{t('inv_th_weight')} / {t('inv_th_volume')}</span>
            <strong>{freight.weightKg || 0} kg &bull; {freight.volumeM3 || 0} m³</strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>{t('inv_base_freight_fee')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: 'var(--accent-blue)', fontSize: '1rem' }}>{formatCurrency(freight.shippingFee)}</strong>
              {getFeeBadge(freight.shippingFeeStatus)}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>{t('inv_insurance_fee')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: '#059669', fontSize: '1rem' }}>{formatCurrency(freight.insuranceAmount)}</strong>
              {getFeeBadge(freight.insuranceFeeStatus)}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
