import React from 'react';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  AlertTriangle,
  Send,
  UserCheck,
  Calendar,
  Timer,
  Navigation
} from 'lucide-react';
import { formatLocationString } from '../utils/geo';
import { getShipmentRegionConfig } from '../utils/regionUtils';
import { translations } from '../utils/translations';
import { formatDimensionsString, formatRegionalDateTime, formatEstArrivalString } from '../utils/cargoUtils';

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
    originCity,
    destinationCity,
    originLocation,
    destLocation,
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
        return <span className="badge badge-paid">✓ {isFR ? 'PAYÉ' : 'PAID'}</span>;
      case 'Pending':
        return <span className="badge badge-pending">⌛ {isFR ? 'EN ATTENTE' : 'PENDING'}</span>;
      case 'Partial':
        return <span className="badge badge-pending">🌗 {isFR ? 'PARTIEL' : 'PARTIAL'}</span>;
      default:
        return <span className="badge badge-paid">{(feeStatus || (isFR ? 'PAYÉ' : 'PAID')).toUpperCase()}</span>;
    }
  };

  // Clean formatted date helper
  const depDate = shipment.departureDate || '2026-09-05';
  const depTime = shipment.departureTime || '08:00';
  const depFormatted = formatRegionalDateTime(depDate, depTime, isFR);

  // Clean estimated arrival date helper with AM/PM for USA and 24h for Europe
  const rawEstArrival = shipment.estimatedArrivalDate || `${depDate} ${depTime}`;
  const arrFormatted = formatEstArrivalString(rawEstArrival, isFR);

  const durationText = `${shipment.durationHours || 12} ${isFR ? 'Heures' : 'Hours'}`;

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
            {isFR ? 'Attention : Le transport est actuellement suspendu. Les frais de livraison nécessitent un règlement avant le départ du fret.' : 'Notice: Shipment transit is on hold. Shipping fees require settlement before cargo dispatch can proceed.'}
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

      {/* SECTION 2: Technical Package Specifications Card */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--primary-navy)', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
          <Package size={20} color="var(--primary-cyan)" />
          <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 800 }}>
            {isFR ? 'Propriétés Techniques du Colis' : 'Package Technical Specifications'}
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', fontSize: '0.88rem' }}>
          
          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              {t('inv_th_desc')}
            </span>
            <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>{freight.description || 'General Freight'}</strong>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              {t('inv_th_category')}
            </span>
            <div>{getGoodsTypeBadge(freight.goodsType)}</div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              {t('inv_th_weight')} & Volume
            </span>
            <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>{freight.weightKg || 0} kg &bull; {freight.volumeM3 || 0} m³</strong>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              {t('inv_th_dimensions')}
            </span>
            <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>{formatDimensionsString(freight.weightKg, freight.volumeM3, freight.dimensions)}</strong>
          </div>

        </div>
      </div>

      {/* SECTION 3: Journey Schedule & Telemetry Dates Card */}
      <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 100%)', border: '1.5px solid var(--primary-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--primary-navy)', borderBottom: '1px solid #CBD5E1', paddingBottom: '10px' }}>
          <Clock size={20} color="var(--primary-navy)" />
          <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 800 }}>
            {isFR ? 'Planification & Télémétrie du Trajet' : 'Journey Schedule & Telemetry Dates'}
          </h3>
        </div>

        {isPaymentBlocked ? (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', padding: '14px', borderRadius: 'var(--radius-sm)', color: '#9F1239', fontWeight: 700, fontSize: '0.88rem' }}>
            ⚠️ {isFR ? "Programmation du Trajet Suspendue : La date/heure de départ et d'arrivée seront définies dès le règlement complet des frais." : "Journey Schedule On Hold: Departure & Arrival dates will be scheduled once full payment is settled."}
          </div>
        ) : (
          (() => {
            const status = shipment.status || 'In Transit';
            const isPaused = shipment.isPaused;

            let depLabel = isFR ? 'Date & Heure de Départ' : 'Departure Date & Time';
            let durLabel = isFR ? 'Durée du Trajet' : 'Transit Duration';
            let arrLabel = isFR ? "Date & Heure d'Arrivée Estimée" : 'Estimated Arrival Date & Time';

            if (status === 'Scheduled') {
              depLabel = isFR ? 'Date & Heure de Départ Prévues' : 'Scheduled Departure Date & Time';
              durLabel = isFR ? 'Durée Prévue du Parcours' : 'Planned Transit Duration';
              arrLabel = isFR ? "Livraison Estimée après Départ" : 'Estimated Arrival After Dispatch';
            } else if (status === 'Delivered') {
              depLabel = isFR ? 'Date & Heure de Départ' : 'Departure Date & Time';
              durLabel = isFR ? 'Durée Effective du Parcours' : 'Actual Transit Duration';
              arrLabel = isFR ? "Date & Heure de Livraison Finalisée" : 'Final Delivery Date & Time';
            } else if (isPaused) {
              depLabel = isFR ? 'Date & Heure de Départ Initial' : 'Original Departure Date & Time';
              durLabel = isFR ? 'Durée Totale du Parcours' : 'Total Transit Duration';
              arrLabel = isFR ? "Date d'Arrivée Réajustée (Pause)" : 'Adjusted Est. Arrival (Pause Shifted)';
            }

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.88rem' }}>
                
                <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    <Calendar size={13} color="var(--primary-navy)" /> {depLabel}
                  </span>
                  <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>{depFormatted}</strong>
                </div>

                <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    <Timer size={13} color="var(--primary-navy)" /> {durLabel}
                  </span>
                  <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>{durationText}</strong>
                </div>

                <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    <Navigation size={13} color="var(--accent-blue)" /> {arrLabel}
                  </span>
                  <strong style={{ color: 'var(--accent-blue)', fontSize: '0.95rem' }}>{arrFormatted}</strong>
                </div>

              </div>
            );
          })()
        )}
      </div>

      {/* SECTION 4: Financial Settlement Card */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--primary-navy)', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
          <CreditCard size={20} color="var(--primary-cyan)" />
          <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 800 }}>
            {t('inv_financial_freight_title')}
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.88rem' }}>
          
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
              {t('inv_base_freight_fee')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <strong style={{ color: 'var(--accent-blue)', fontSize: '1.2rem' }}>{formatCurrency(freight.shippingFee)}</strong>
              {getFeeBadge(freight.shippingFeeStatus)}
            </div>
          </div>

          {!shipment.hideInsuranceFee && (
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                {t('inv_insurance_fee')}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <strong style={{ color: '#059669', fontSize: '1.2rem' }}>{formatCurrency(freight.insuranceAmount)}</strong>
                {getFeeBadge(freight.insuranceFeeStatus)}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
