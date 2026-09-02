import React, { useState } from 'react';
import { X, Download, FileText, Send, UserCheck, ShieldCheck, Layers, CheckCircle2, MapPin, Phone, Mail, AlertTriangle } from 'lucide-react';
import { generateShipmentInvoicePDF, generateBothInvoicesPDF } from '../utils/pdfGenerator';
import { formatTownLocationString } from '../utils/geo';
import { getShipmentRegionConfig } from '../utils/regionUtils';
import { translations } from '../utils/translations';

export default function InvoicePreviewModal({ shipment, onClose }) {
  const [activeInvoiceType, setActiveInvoiceType] = useState('shipping'); // 'shipping' | 'insurance'

  if (!shipment) return null;

  // Immutable per-shipment region binding (USA = EN/$, EUROPE = FR/€)
  const regionConfig = getShipmentRegionConfig(shipment);
  const isFR = regionConfig.lang === 'fr';
  const formatCurrency = regionConfig.formatCurrency;

  // Local helper translating keys based on shipment's bound language (independent of global site toggle)
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
    transportMode,
    createdAt
  } = shipment;

  const originTownStr = formatTownLocationString(originLocation) || originCity || "Plattsburgh, NY";
  const destTownStr = formatTownLocationString(destLocation) || destinationCity || "Riverside, CA";

  const isInsuranceInvoice = activeInvoiceType === 'insurance';

  const getTransportEmoji = (mode) => {
    switch (mode) {
      case 'airplane': return isFR ? '✈️ Fret Aérien' : '✈️ Air Freight';
      case 'boat': return isFR ? '🚢 Cargo Maritime' : '🚢 Ocean Vessel Cargo';
      case 'bus': return isFR ? '🚌 Courrier Bus Express' : '🚌 Express Bus Courier';
      default: return isFR ? '🚚 Transport Routier' : '🚚 Cargo Truck Transport';
    }
  };

  const handleDownloadSingle = () => {
    generateShipmentInvoicePDF(shipment, activeInvoiceType);
  };

  const handleDownloadBoth = () => {
    generateBothInvoicesPDF(shipment);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '960px', background: '#F8FAFC', padding: '16px' }}>
        
        {/* Modal Header & Navigation Controls */}
        <div className="flex-between" style={{ marginBottom: '16px', borderBottom: '2px solid #E2E8F0', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Invoice Type Selector Tabs & Region Flag Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, padding: '6px 10px', background: '#E0F2FE', color: 'var(--primary-navy)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-cyan)' }}>
              {regionConfig.flag} {regionConfig.region} REGIONAL MANIFEST ({id})
            </span>

            <div style={{ display: 'flex', background: '#E2E8F0', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => setActiveInvoiceType('shipping')}
                style={{
                  background: activeInvoiceType === 'shipping' ? 'var(--primary-navy)' : 'transparent',
                  color: activeInvoiceType === 'shipping' ? '#FFFFFF' : 'var(--text-main)',
                  fontWeight: 700,
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem'
                }}
              >
                <FileText size={15} /> {t('inv_tab_freight')}
              </button>

              <button
                onClick={() => setActiveInvoiceType('insurance')}
                style={{
                  background: activeInvoiceType === 'insurance' ? '#059669' : 'transparent',
                  color: activeInvoiceType === 'insurance' ? '#FFFFFF' : 'var(--text-main)',
                  fontWeight: 700,
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem'
                }}
              >
                <ShieldCheck size={15} /> {t('inv_tab_insurance')}
              </button>
            </div>
          </div>

          {/* Download Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
            <button 
              className={isInsuranceInvoice ? "btn-secondary" : "btn-cyan"} 
              onClick={() => generateShipmentInvoicePDF(shipment, 'shipping')}
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <Download size={14} /> {t('inv_btn_freight_pdf')}
            </button>

            <button 
              className={isInsuranceInvoice ? "btn-cyan" : "btn-secondary"} 
              onClick={() => generateShipmentInvoicePDF(shipment, 'insurance')}
              style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: '#059669', color: isInsuranceInvoice ? '#FFF' : '#059669', background: isInsuranceInvoice ? '#059669' : '#FFF' }}
            >
              <ShieldCheck size={14} /> {t('inv_btn_insurance_pdf')}
            </button>

            <button 
              className="btn-primary" 
              onClick={handleDownloadBoth}
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <Layers size={14} /> {t('inv_btn_both_pdf')}
            </button>

            <button 
              onClick={onClose}
              style={{ background: '#E2E8F0', border: 'none', padding: '8px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: '#475569' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Touch Scroll Container for Mobile Phones (Preserves Exact 794px Computer Paper Layout) */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '10px', width: '100%' }}>
          
          {/* FIXED 794px DESKTOP COMPUTER A4 PAPER CONTAINER */}
          <div 
            id="invoice-paper-preview" 
            style={{
              width: '794px',
              minWidth: '794px',
              maxWidth: '794px',
              margin: '0 auto',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 12px 36px rgba(11, 25, 44, 0.08)',
              overflow: 'hidden',
              color: '#0F172A',
              fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box'
            }}
          >
            
            {/* Top Accent Header Bar */}
            <div style={{ height: '5px', background: isInsuranceInvoice ? '#059669' : 'var(--primary-navy)' }}></div>
            <div style={{ height: '2px', background: 'var(--primary-cyan)' }}></div>

            <div style={{ padding: '28px 32px' }}>
              
              {/* Executive Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #F1F5F9', paddingBottom: '20px', marginBottom: '20px' }}>
                
                {/* Visible Logo & Brand Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img 
                    src="/logo.png" 
                    alt="ShipPulse Official Logo" 
                    style={{ height: '48px', width: 'auto', objectFit: 'contain' }} 
                  />
                  <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '0.03em', lineHeight: 1 }}>
                      <span style={{ color: 'var(--primary-navy)' }}>SHIP</span>
                      <span style={{ color: 'var(--primary-cyan)' }}>PULSE</span>
                    </h1>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '3px 0 0 0' }}>
                      {isFR ? 'Suivi de précision, livraison sans effort.' : 'Precision tracking, effortless delivery.'}
                    </p>
                  </div>
                </div>

                {/* Right Document Reference Metadata */}
                <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isInsuranceInvoice ? '#059669' : 'var(--primary-navy)', marginBottom: '4px', letterSpacing: '0.02em' }}>
                    {isInsuranceInvoice ? t('inv_title_insurance') : t('inv_title_freight')}
                  </div>
                  <div><strong>{t('inv_ref')}</strong> {isInsuranceInvoice ? `INV-INS-${id}` : `INV-FRT-${id}`}</div>
                  <div><strong>{t('inv_tracking_id')}</strong> {id}</div>
                  <div><strong>{t('inv_issued_date')}</strong> {new Date(createdAt || Date.now()).toLocaleDateString(isFR ? 'fr-FR' : 'en-US')}</div>
                </div>
              </div>

              {/* Subheader: Official Company HQ Details */}
              <div style={{ 
                fontSize: '0.70rem', 
                color: 'var(--text-muted)', 
                background: '#F8FAFC', 
                padding: '6px 12px', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid #E2E8F0', 
                marginBottom: '20px', 
                display: 'flex', 
                justify: 'space-between', 
                alignItems: 'center',
                gap: '12px',
                whiteSpace: 'nowrap'
              }}>
                <div style={{ whiteSpace: 'nowrap' }}>
                  {t('inv_hq')}
                </div>
                <div style={{ color: 'var(--primary-navy)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {t('inv_doc_type')}
                </div>
              </div>

              {/* ROUTE & TRANSPORT TELEMETRY BANNER */}
              <div style={{
                background: isInsuranceInvoice ? 'linear-gradient(135deg, #065F46 0%, #059669 100%)' : 'linear-gradient(135deg, var(--primary-navy) 0%, #0077B6 100%)',
                color: '#FFFFFF',
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                gap: '24px',
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong>{t('inv_route')}</strong> {originTownStr.toUpperCase()} &rarr; {destTownStr.toUpperCase()}
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {t('inv_mode')} {getTransportEmoji(transportMode)}
                </div>
              </div>

              {/* Shipper & Recipient Details Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '22px' }}>
                
                {/* Shipper Card */}
                <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--primary-navy)', color: '#FFFFFF', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Send size={13} color="var(--primary-cyan)" /> {t('inv_sender_title')}
                  </div>
                  <div style={{ padding: '14px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>{sender.firstName} {sender.lastName}</strong><br />
                    {sender.company && <span>{t('inv_company')} <strong>{sender.company}</strong><br /></span>}
                    Email: {sender.email || 'N/A'}<br />
                    {isFR ? 'Tél :' : 'Phone:'} {sender.phone || 'N/A'}<br />
                    {t('inv_departure_town')} <strong>{originTownStr}</strong><br />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('inv_id_doc')} {sender.idDocument || 'Verified'}</span>
                  </div>
                </div>

                {/* Recipient Card */}
                <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ background: '#059669', color: '#FFFFFF', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={13} /> {t('inv_recipient_title')}
                  </div>
                  <div style={{ padding: '14px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <strong style={{ color: '#059669', fontSize: '0.95rem' }}>{recipient.firstName} {recipient.lastName}</strong><br />
                    Email: {recipient.email || 'N/A'}<br />
                    {isFR ? 'Tél :' : 'Phone:'} {recipient.phone || 'N/A'}<br />
                    {t('inv_dest_town')} <strong>{destTownStr}</strong><br />
                    {t('inv_delivery_address')} {recipient.deliveryAddress || destTownStr}
                  </div>
                </div>

              </div>

              {/* Package Technical Specs Table */}
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '0.88rem', color: 'var(--primary-navy)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.03em' }}>
                  {t('inv_specs_title')}
                </h4>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', tableLayout: 'auto' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary-navy)', color: '#FFFFFF', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', borderTopLeftRadius: '4px' }}>{t('inv_th_desc')}</th>
                      <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{t('inv_th_category')}</th>
                      <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{t('inv_th_weight')}</th>
                      <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{t('inv_th_volume')}</th>
                      <th style={{ padding: '8px 12px', borderTopRightRadius: '4px', whiteSpace: 'nowrap' }}>{t('inv_th_dimensions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{freight.description || (isFR ? 'Fret Général' : 'General Freight')}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}><span className="badge badge-transit">{freight.goodsType || 'Standard'}</span></td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 600 }}>{freight.weightKg || 0}&nbsp;kg</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 600 }}>{freight.volumeM3 || 0}&nbsp;m³</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 600 }}>{freight.dimensions?.length || 0}×{freight.dimensions?.width || 0}×{freight.dimensions?.height || 0}&nbsp;cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown Card */}
              <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.88rem', color: isInsuranceInvoice ? '#059669' : 'var(--primary-navy)', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.03em' }}>
                  {isInsuranceInvoice ? t('inv_financial_insurance_title') : t('inv_financial_freight_title')}
                </h4>

                {isInsuranceInvoice ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '0.88rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>{t('inv_insured_cargo_item')}</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--primary-navy)' }}>{freight.goodsType || 'Commercial Cargo'}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>{t('inv_declared_value')}</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--primary-navy)' }}>{formatCurrency(freight.declaredValue)}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>{t('inv_insurance_fee')}</span>
                      <strong style={{ fontSize: '1.1rem', color: '#059669' }}>{formatCurrency(freight.insuranceAmount)}</strong>
                      <span style={{ marginLeft: '6px' }} className={`badge ${freight.insuranceFeeStatus === 'Pending' ? 'badge-pending' : 'badge-paid'}`}>
                        {freight.insuranceFeeStatus === 'Pending' ? (isFR ? 'En Attente' : 'Pending') : (isFR ? 'Payé' : 'Paid')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '0.88rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>{t('inv_base_freight_fee')}</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--accent-blue)' }}>{formatCurrency(freight.shippingFee)}</strong>
                      <span style={{ marginLeft: '8px' }} className={`badge ${freight.shippingFeeStatus === 'Pending' ? 'badge-pending' : 'badge-paid'}`}>
                        {freight.shippingFeeStatus === 'Pending' ? (isFR ? 'En Attente' : 'Pending') : (isFR ? 'Payé' : 'Paid')}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>{t('inv_declared_value')}</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--primary-navy)' }}>{formatCurrency(freight.declaredValue)}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* MANDATORY INSURANCE POLICY STIPULATION NOTE (ONLY ON INSURANCE INVOICE) */}
              {isInsuranceInvoice && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderLeft: '4px solid #DC2626',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  marginBottom: '24px',
                  color: '#991B1B',
                  fontSize: '0.78rem',
                  lineHeight: '1.45'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', marginBottom: '2px', color: '#7F1D1D', fontWeight: 800 }}>
                    <AlertTriangle size={15} color="#DC2626" /> {t('inv_insurance_notice_title')}
                  </div>
                  <div>
                    {t('inv_insurance_notice_text')}
                  </div>
                </div>
              )}

              {/* EXECUTIVE CORPORATE INVOICE FOOTER WITH ALIGNED LEGAL DISCLAIMER */}
              <div style={{
                marginTop: '30px',
                paddingTop: '18px',
                borderTop: '2px dashed #CBD5E1',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'flex-end',
                gap: '32px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)'
              }}>
                {/* Left: Official Company HQ & Contact Details */}
                <div style={{ lineHeight: '1.6', flex: 1 }}>
                  <strong style={{ color: 'var(--primary-navy)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                    ShipPulse Logistics Inc.
                  </strong>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', color: '#334155', fontSize: '0.78rem' }}>
                    <MapPin size={13} color="var(--primary-navy)" /> 44 Wall St, New York, NY 10005, United States
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', color: '#334155', fontSize: '0.78rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={13} color="var(--primary-navy)" /> +1 (929) 315-6218
                    </span>
                    <span>&bull;</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Mail size={13} color="var(--primary-navy)" /> track.shippulse@gmail.com
                    </span>
                  </div>

                  {/* Legal Statement Constrained to Align Perfectly with Email Line End */}
                  <div style={{ fontStyle: 'italic', fontSize: '0.66rem', color: '#64748B', marginTop: '6px', lineHeight: '1.45', maxWidth: '440px' }}>
                    {t('inv_legal_statement')}
                  </div>
                </div>

                {/* Right: Digital Verification Stamp & Page Reference */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(0, 168, 232, 0.1)',
                    border: '1px solid var(--primary-cyan)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--primary-navy)',
                    fontWeight: 700,
                    marginBottom: '6px',
                    fontSize: '0.78rem'
                  }}>
                    <CheckCircle2 size={15} color="var(--primary-cyan)" /> {t('inv_verified_stamp')} ({id})
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-navy)' }}>
                    Page 1 of 1 &bull; Ref: {isInsuranceInvoice ? `INV-INS-${id}` : `INV-FRT-${id}`}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={onClose}>
            {t('inv_btn_close')}
          </button>
          
          <button className="btn-cyan" onClick={handleDownloadSingle} style={{ padding: '10px 20px' }}>
            <Download size={16} /> {t('inv_btn_freight_pdf')}
          </button>

          <button className="btn-primary" onClick={handleDownloadBoth} style={{ padding: '10px 20px' }}>
            <Layers size={16} /> {t('inv_btn_both_pdf')}
          </button>
        </div>

      </div>
    </div>
  );
}
