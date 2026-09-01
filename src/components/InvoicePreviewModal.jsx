import React, { useState } from 'react';
import { X, Download, FileText, Send, UserCheck, ShieldCheck, Layers, CheckCircle2 } from 'lucide-react';
import { generateShipmentInvoicePDF, generateBothInvoicesPDF } from '../utils/pdfGenerator';
import { formatTownLocationString } from '../utils/geo';

export default function InvoicePreviewModal({ shipment, onClose }) {
  const [activeInvoiceType, setActiveInvoiceType] = useState('shipping'); // 'shipping' | 'insurance'

  if (!shipment) return null;

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
      case 'airplane': return '✈️ Air Freight';
      case 'boat': return '🚢 Ocean Vessel Cargo';
      case 'bus': return '🚌 Express Bus Courier';
      default: return '🚚 Cargo Truck Transport';
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
          
          {/* Invoice Type Selector Tabs */}
          <div style={{ display: 'flex', background: '#E2E8F0', padding: '3px', borderRadius: 'var(--radius-sm)', width: '100%', maxWidth: 'max-content' }}>
            <button
              onClick={() => setActiveInvoiceType('shipping')}
              style={{
                flex: 1,
                background: activeInvoiceType === 'shipping' ? 'var(--primary-navy)' : 'transparent',
                color: activeInvoiceType === 'shipping' ? '#FFFFFF' : 'var(--text-main)',
                fontWeight: 700,
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              <FileText size={15} /> 1. Freight Shipping Invoice
            </button>

            <button
              onClick={() => setActiveInvoiceType('insurance')}
              style={{
                flex: 1,
                background: activeInvoiceType === 'insurance' ? '#059669' : 'transparent',
                color: activeInvoiceType === 'insurance' ? '#FFFFFF' : 'var(--text-main)',
                fontWeight: 700,
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              <ShieldCheck size={15} /> 2. Insurance Policy Invoice
            </button>
          </div>

          {/* Download Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
            <button 
              className={isInsuranceInvoice ? "btn-secondary" : "btn-cyan"} 
              onClick={() => generateShipmentInvoicePDF(shipment, 'shipping')}
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <Download size={14} /> Freight PDF
            </button>

            <button 
              className={isInsuranceInvoice ? "btn-cyan" : "btn-secondary"} 
              onClick={() => generateShipmentInvoicePDF(shipment, 'insurance')}
              style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: '#059669', color: isInsuranceInvoice ? '#FFF' : '#059669', background: isInsuranceInvoice ? '#059669' : '#FFF' }}
            >
              <ShieldCheck size={14} /> Insurance PDF
            </button>

            <button 
              className="btn-primary" 
              onClick={handleDownloadBoth}
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <Layers size={14} /> Download Both PDFs
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
                      Precision tracking, effortless delivery.
                    </p>
                  </div>
                </div>

                {/* Right Document Reference Metadata */}
                <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isInsuranceInvoice ? '#059669' : 'var(--primary-navy)', marginBottom: '4px', letterSpacing: '0.02em' }}>
                    {isInsuranceInvoice ? 'INSURANCE CLEARANCE INVOICE' : 'FREIGHT & SHIPPING INVOICE'}
                  </div>
                  <div><strong>Invoice Ref:</strong> {isInsuranceInvoice ? `INV-INS-${id}` : `INV-FRT-${id}`}</div>
                  <div><strong>Tracking ID:</strong> {id}</div>
                  <div><strong>Issued Date:</strong> {new Date(createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Subheader: Official Company HQ Details */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>HQ:</strong> 44 Wall St, New York, NY 10005, USA &bull; <strong>Email:</strong> track.shippulse@gmail.com
                </div>
                <div style={{ color: 'var(--primary-navy)', fontWeight: 600 }}>
                  Official Authorized Logistics Document
                </div>
              </div>

              {/* ROUTE & TRANSPORT TELEMETRY BANNER */}
              <div style={{
                background: isInsuranceInvoice ? 'linear-gradient(135deg, #065F46 0%, #059669 100%)' : 'linear-gradient(135deg, var(--primary-navy) 0%, #0077B6 100%)',
                color: '#FFFFFF',
                padding: '12px 18px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                <div>
                  <strong>OFFICIAL ROUTE:</strong> {originTownStr.toUpperCase()} &rarr; {destTownStr.toUpperCase()}
                </div>
                <div>
                  <strong>MODE:</strong> {getTransportEmoji(transportMode)}
                </div>
              </div>

              {/* Shipper & Recipient Details Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '22px' }}>
                
                {/* Shipper Card */}
                <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--primary-navy)', color: '#FFFFFF', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Send size={13} color="var(--primary-cyan)" /> Shipper / Sender Details
                  </div>
                  <div style={{ padding: '14px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>{sender.firstName} {sender.lastName}</strong><br />
                    {sender.company && <span>Company: <strong>{sender.company}</strong><br /></span>}
                    Email: {sender.email || 'N/A'}<br />
                    Phone: {sender.phone || 'N/A'}<br />
                    Departure Town: <strong>{originTownStr}</strong><br />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID Document: {sender.idDocument || 'Verified'}</span>
                  </div>
                </div>

                {/* Recipient Card */}
                <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ background: '#059669', color: '#FFFFFF', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={13} /> Recipient / Consignee Details
                  </div>
                  <div style={{ padding: '14px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <strong style={{ color: '#059669', fontSize: '0.95rem' }}>{recipient.firstName} {recipient.lastName}</strong><br />
                    Email: {recipient.email || 'N/A'}<br />
                    Phone: {recipient.phone || 'N/A'}<br />
                    Destination Town: <strong>{destTownStr}</strong><br />
                    Delivery Address: {recipient.deliveryAddress || destTownStr}
                  </div>
                </div>

              </div>

              {/* Package Technical Specs Table */}
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '0.88rem', color: 'var(--primary-navy)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.03em' }}>
                  Package Technical Specifications
                </h4>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary-navy)', color: '#FFFFFF', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', borderTopLeftRadius: '4px' }}>Description</th>
                      <th style={{ padding: '8px 12px' }}>Category</th>
                      <th style={{ padding: '8px 12px' }}>Weight</th>
                      <th style={{ padding: '8px 12px' }}>Volume</th>
                      <th style={{ padding: '8px 12px', borderTopRightRadius: '4px' }}>Dimensions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{freight.description || 'General Freight'}</td>
                      <td style={{ padding: '10px 12px' }}><span className="badge badge-transit">{freight.goodsType || 'Standard'}</span></td>
                      <td style={{ padding: '10px 12px' }}>{freight.weightKg || 0} kg</td>
                      <td style={{ padding: '10px 12px' }}>{freight.volumeM3 || 0} m³</td>
                      <td style={{ padding: '10px 12px' }}>{freight.dimensions?.length || 0}×{freight.dimensions?.width || 0}×{freight.dimensions?.height || 0} cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown Card */}
              <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.88rem', color: isInsuranceInvoice ? '#059669' : 'var(--primary-navy)', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.03em' }}>
                  {isInsuranceInvoice ? 'Insurance Policy Coverage & Settlement Details' : 'Freight Shipping Financial Settlement Summary'}
                </h4>

                {isInsuranceInvoice ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '0.88rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Insured Cargo Item</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--primary-navy)' }}>{freight.goodsType || 'Commercial Cargo'}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Declared Goods Value</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--primary-navy)' }}>${(freight.declaredValue || 0).toLocaleString()}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Insurance Policy Coverage Fee</span>
                      <strong style={{ fontSize: '1.1rem', color: '#059669' }}>${(freight.insuranceAmount || 0).toLocaleString()}</strong>
                      <span style={{ marginLeft: '6px' }} className={`badge ${freight.insuranceFeeStatus === 'Pending' ? 'badge-pending' : 'badge-paid'}`}>
                        {freight.insuranceFeeStatus || 'Paid'}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* FREIGHT INVOICE: ONLY BASE SHIPPING FREIGHT FEE AND DECLARED CARGO VALUE (STATUS REMOVED) */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '0.88rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Base Shipping Freight Fee</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--accent-blue)' }}>${(freight.shippingFee || 0).toLocaleString()}</strong>
                      <span style={{ marginLeft: '8px' }} className={`badge ${freight.shippingFeeStatus === 'Pending' ? 'badge-pending' : 'badge-paid'}`}>
                        {freight.shippingFeeStatus || 'Paid'}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Declared Cargo Goods Value</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--primary-navy)' }}>${(freight.declaredValue || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* EXECUTIVE CORPORATE INVOICE FOOTER */}
              <div style={{
                marginTop: '30px',
                paddingTop: '18px',
                borderTop: '2px dashed #CBD5E1',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'flex-end',
                fontSize: '0.78rem',
                color: 'var(--text-muted)'
              }}>
                {/* Left: Official Company Headquarters & Contact Information */}
                <div style={{ lineHeight: '1.6' }}>
                  <strong style={{ color: 'var(--primary-navy)', fontSize: '0.85rem' }}>ShipPulse Logistics Inc.</strong><br />
                  44 Wall St, New York, NY 10005, United States &bull; 📞 +1 (212) 555-0198<br />
                  ✉️ track.shippulse@gmail.com &bull; Global Cargo Operations Control<br />
                  <span style={{ fontStyle: 'italic', fontSize: '0.72rem', color: '#64748B' }}>
                    This document is electronically verified and issued by ShipPulse Operational Control. Valid for customs clearance & cargo auditing.
                  </span>
                </div>

                {/* Right: Digital Verification Stamp & Page Reference */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(0, 168, 232, 0.1)',
                    border: '1px solid var(--primary-cyan)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--primary-navy)',
                    fontWeight: 700,
                    marginBottom: '6px',
                    fontSize: '0.78rem'
                  }}>
                    <CheckCircle2 size={15} color="var(--primary-cyan)" /> Verified Manifest Stamp ({id})
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
            Close Preview
          </button>
          
          <button className="btn-cyan" onClick={handleDownloadSingle} style={{ padding: '10px 20px' }}>
            <Download size={16} /> Download Selected ({activeInvoiceType === 'shipping' ? 'Freight Invoice' : 'Insurance Invoice'})
          </button>

          <button className="btn-primary" onClick={handleDownloadBoth} style={{ padding: '10px 20px' }}>
            <Layers size={16} /> Download Both Invoices (Dual PDF)
          </button>
        </div>

      </div>
    </div>
  );
}
