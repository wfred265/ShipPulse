import React, { useState } from 'react';
import { X, PlusCircle, Package, Send, UserCheck, Truck, Plane, Ship, Bus, Eye, Globe, AlertTriangle } from 'lucide-react';
import { useShipments } from '../context/ShipmentContext';
import LocationAutocompleteInput from './LocationAutocompleteInput';
import { formatTownLocationString, resolveCoords, isValidWorldwideLocation } from '../utils/geo';
import InvoicePreviewModal from './InvoicePreviewModal';

export default function ShipmentFormModal({ onClose }) {
  const { createShipment } = useShipments();
  const [createdShipmentObj, setCreatedShipmentObj] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [locationValidationError, setLocationValidationError] = useState('');

  // Form State with UNPREFILLED / BLANK Departure and Destination locations
  const [formData, setFormData] = useState({
    transportMode: 'truck',
    
    // Unprefilled initial location states
    originLocation: null,
    destLocation: null,

    durationHours: 12,
    
    sender: {
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      idDocument: ''
    },

    recipient: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      deliveryAddress: '',
      specialInstructions: ''
    },

    freight: {
      description: '',
      goodsType: 'Standard',
      weightKg: 50,
      volumeM3: 0.5,
      dimensions: { length: 60, width: 40, height: 40 },
      declaredValue: 5000,
      insuranceAmount: 150,
      shippingFee: 350,
      shippingFeeStatus: 'Paid',
      insuranceFeeStatus: 'Paid',
      paymentStatus: 'Paid'
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocationValidationError('');

    // STRICT LOCATION VALIDATION ENFORCEMENT
    const isOriginValid = isValidWorldwideLocation(formData.originLocation);
    const isDestValid = isValidWorldwideLocation(formData.destLocation);

    if (!isOriginValid || !isDestValid) {
      setLocationValidationError("Cannot generate manifest: Departure and Destination MUST be selected from the recognized worldwide location dropdown list!");
      return;
    }

    const originLoc = formData.originLocation;
    const destLoc = formData.destLocation;

    // RESOLVE EXACT COORDINATES FROM SELECTED OBJECTS (NEVER FALLBACK TO PLATTSBURGH!)
    const originCoords = resolveCoords(originLoc, [40.7128, -74.0060]);
    const destCoords = resolveCoords(destLoc, [51.5074, -0.1278]);

    const originCityStr = formatTownLocationString(originLoc);
    const destCityStr = formatTownLocationString(destLoc);

    const isShippingPending = formData.freight.shippingFeeStatus === 'Pending';
    const isInsurancePending = formData.freight.insuranceFeeStatus === 'Pending';
    const overallPaymentStatus = (isShippingPending || isInsurancePending) ? 'Pending' : (formData.freight.shippingFeeStatus === 'Partial' || formData.freight.insuranceFeeStatus === 'Partial' ? 'Partial' : 'Paid');

    const newShipmentPayload = {
      ...formData,
      originLocation: originLoc,
      destLocation: destLoc,
      originCity: originCityStr,
      destinationCity: destCityStr,
      originCoords,
      destCoords,
      currentCoords: originCoords,
      freight: {
        ...formData.freight,
        paymentStatus: overallPaymentStatus
      }
    };

    const generatedId = createShipment(newShipmentPayload);

    const fullObj = {
      id: generatedId,
      ...newShipmentPayload,
      createdAt: new Date().toISOString()
    };

    setCreatedShipmentObj(fullObj);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '880px' }}>
        
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: '20px', borderBottom: '2px solid var(--primary-cyan)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PlusCircle size={24} color="var(--primary-cyan)" />
            <h3 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: '1.3rem' }}>
              Register New ShipPulse Shipment
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#AAA', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Success screen */}
        {createdShipmentObj ? (
          <div style={{ padding: '30px 20px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '1.8rem', fontWeight: 800 }}>
              ✓
            </div>

            <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>
              Shipment {createdShipmentObj.id} Manifested Successfully!
            </h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 20px auto' }}>
              Route: <strong>{createdShipmentObj.originCity}</strong> &rarr; <strong>{createdShipmentObj.destinationCity}</strong>
            </p>

            {(createdShipmentObj.freight?.shippingFeeStatus === 'Pending' || createdShipmentObj.freight?.insuranceFeeStatus === 'Pending') && (
              <div style={{
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                color: '#9F1239',
                fontSize: '0.88rem',
                maxWidth: '560px',
                margin: '0 auto 24px auto',
                fontWeight: 600
              }}>
                ⚠️ PAYMENT HOLD: Shipping fee or Insurance fee is Pending. The vehicle journey remains held at departure until payment is completed!
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button 
                className="btn-cyan" 
                onClick={() => setShowPreviewModal(true)}
                style={{ padding: '12px 28px', fontSize: '1rem' }}
              >
                <Eye size={18} /> Preview & Download Invoice PDF
              </button>

              <button className="btn-secondary" onClick={onClose}>
                Done & Close
              </button>
            </div>

            {showPreviewModal && (
              <InvoicePreviewModal 
                shipment={createdShipmentObj} 
                onClose={() => setShowPreviewModal(false)} 
              />
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Location Validation Error Banner */}
            {locationValidationError && (
              <div style={{
                background: '#FFF1F2',
                border: '2px solid #E11D48',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                color: '#9F1239',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertTriangle size={20} color="#E11D48" /> {locationValidationError}
              </div>
            )}

            {/* Section 1: Unprefilled Departure & Destination with Type-Ahead Autocomplete */}
            <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <h4 style={{ color: 'var(--primary-navy)', marginBottom: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="var(--primary-cyan)" /> 1. Departure & Destination Locations (Select Valid Worldwide Location)
              </h4>

              {/* Unprefilled Location Autocomplete Inputs */}
              <div className="grid-2" style={{ marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-navy)', display: 'block', marginBottom: '4px' }}>
                    Departure Location (Town to Town) *:
                  </label>
                  <LocationAutocompleteInput 
                    value={formData.originLocation}
                    onChange={(val) => setFormData({ ...formData, originLocation: val })}
                    onSelectLocation={(loc) => setFormData({ ...formData, originLocation: loc })}
                    placeholder="Type departure town (e.g. Plattsburgh, NY)..."
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-navy)', display: 'block', marginBottom: '4px' }}>
                    Destination Location (Town to Town) *:
                  </label>
                  <LocationAutocompleteInput 
                    value={formData.destLocation}
                    onChange={(val) => setFormData({ ...formData, destLocation: val })}
                    onSelectLocation={(loc) => setFormData({ ...formData, destLocation: loc })}
                    placeholder="Type destination town (e.g. Riverside, CA)..."
                  />
                </div>
              </div>

              {/* Transport Mode */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                {[
                  { id: 'airplane', label: 'Airplane', icon: Plane },
                  { id: 'boat', label: 'Boat / Vessel', icon: Ship },
                  { id: 'bus', label: 'Express Bus', icon: Bus },
                  { id: 'truck', label: 'Cargo Truck', icon: Truck }
                ].map(m => {
                  const IconComp = m.icon;
                  const isSel = formData.transportMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, transportMode: m.id })}
                      style={{
                        background: isSel ? 'var(--primary-navy)' : '#FFFFFF',
                        color: isSel ? '#FFFFFF' : 'var(--text-main)',
                        border: isSel ? 'none' : '1px solid #CBD5E1',
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        gap: '8px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <IconComp size={16} /> {m.label}
                    </button>
                  );
                })}
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Estimated Transit Duration (Hours)</label>
                <input type="number" className="glass-input" value={formData.durationHours} onChange={e => setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 10 })} min="1" />
              </div>
            </div>

            {/* Section 2: Sender & Recipient */}
            <div className="grid-2">
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <h4 style={{ color: 'var(--primary-navy)', marginBottom: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={16} color="var(--primary-cyan)" /> 2. Shipper Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="First Name *" required className="glass-input" value={formData.sender.firstName} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, firstName: e.target.value } })} />
                    <input type="text" placeholder="Last Name *" required className="glass-input" value={formData.sender.lastName} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, lastName: e.target.value } })} />
                  </div>
                  <input type="text" placeholder="Company Name" className="glass-input" value={formData.sender.company} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, company: e.target.value } })} />
                  <input type="email" placeholder="Email Address *" required className="glass-input" value={formData.sender.email} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, email: e.target.value } })} />
                  <input type="tel" placeholder="Phone / WhatsApp *" required className="glass-input" value={formData.sender.phone} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, phone: e.target.value } })} />
                  <input type="text" placeholder="Full Address" className="glass-input" value={formData.sender.address} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, address: e.target.value } })} />
                  <input type="text" placeholder="ID / Passport Number" className="glass-input" value={formData.sender.idDocument} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, idDocument: e.target.value } })} />
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <h4 style={{ color: '#059669', marginBottom: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={16} /> 3. Recipient Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="First Name *" required className="glass-input" value={formData.recipient.firstName} onChange={e => setFormData({ ...formData, recipient: { ...formData.recipient, firstName: e.target.value } })} />
                    <input type="text" placeholder="Last Name *" required className="glass-input" value={formData.recipient.lastName} onChange={e => setFormData({ ...formData, recipient: { ...formData.recipient, lastName: e.target.value } })} />
                  </div>
                  <input type="email" placeholder="Email Address *" required className="glass-input" value={formData.recipient.email} onChange={e => setFormData({ ...formData, recipient: { ...formData.recipient, email: e.target.value } })} />
                  <input type="tel" placeholder="Phone Number *" required className="glass-input" value={formData.recipient.phone} onChange={e => setFormData({ ...formData, recipient: { ...formData.recipient, phone: e.target.value } })} />
                  <input type="text" placeholder="Exact Delivery Address *" required className="glass-input" value={formData.recipient.deliveryAddress} onChange={e => setFormData({ ...formData, recipient: { ...formData.recipient, deliveryAddress: e.target.value } })} />
                  <textarea placeholder="Special Delivery Instructions" className="glass-input" rows="2" value={formData.recipient.specialInstructions} onChange={e => setFormData({ ...formData, recipient: { ...formData.recipient, specialInstructions: e.target.value } })}></textarea>
                </div>
              </div>
            </div>

            {/* Section 3: Freight Specs & Financial Payment Status Controls */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <h4 style={{ color: 'var(--primary-navy)', marginBottom: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} color="var(--primary-cyan)" /> 4. Freight Specifications & Payment Dependency
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Detailed Content Description *" 
                  required 
                  className="glass-input"
                  value={formData.freight.description}
                  onChange={e => setFormData({ ...formData, freight: { ...formData.freight, description: e.target.value } })}
                />

                <div className="grid-3">
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Goods Category</label>
                    <select className="glass-input" value={formData.freight.goodsType} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, goodsType: e.target.value } })}>
                      <option value="Standard">Standard</option>
                      <option value="Fragile">Fragile</option>
                      <option value="Perishable">Perishable</option>
                      <option value="Hazardous">Hazardous</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Weight (kg)</label>
                    <input type="number" step="0.1" className="glass-input" value={formData.freight.weightKg} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, weightKg: parseFloat(e.target.value) || 0 } })} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Volume (m³)</label>
                    <input type="number" step="0.01" className="glass-input" value={formData.freight.volumeM3} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, volumeM3: parseFloat(e.target.value) || 0 } })} />
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Declared Value ($)</label>
                    <input type="number" className="glass-input" value={formData.freight.declaredValue} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, declaredValue: parseFloat(e.target.value) || 0 } })} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Shipping Freight Fee ($)</label>
                    <input type="number" className="glass-input" value={formData.freight.shippingFee} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, shippingFee: parseFloat(e.target.value) || 0 } })} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Insurance Coverage ($)</label>
                    <input type="number" className="glass-input" value={formData.freight.insuranceAmount} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, insuranceAmount: parseFloat(e.target.value) || 0 } })} />
                  </div>
                </div>

                {/* INDIVIDUAL PAYMENT STATUS SELECTORS */}
                <div className="grid-2" style={{ background: '#FFFFFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', marginTop: '6px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '4px' }}>
                      Shipping Fee Status:
                    </label>
                    <select 
                      className="glass-input"
                      value={formData.freight.shippingFeeStatus}
                      onChange={e => setFormData({ ...formData, freight: { ...formData.freight, shippingFeeStatus: e.target.value } })}
                    >
                      <option value="Paid">Paid (Cleared)</option>
                      <option value="Partial">Partially Paid</option>
                      <option value="Pending">Pending (Halts Journey!)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '4px' }}>
                      Insurance Fee Status:
                    </label>
                    <select 
                      className="glass-input"
                      value={formData.freight.insuranceFeeStatus}
                      onChange={e => setFormData({ ...formData, freight: { ...formData.freight, insuranceFeeStatus: e.target.value } })}
                    >
                      <option value="Paid">Paid (Cleared)</option>
                      <option value="Partial">Partially Paid</option>
                      <option value="Pending">Pending (Halts Journey!)</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#E11D48', fontStyle: 'italic', display: 'block', marginTop: '3px' }}>
                      * Must be Paid or Partial for transit to start.
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '10px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <PlusCircle size={18} /> Generate Manifest & Save Shipment
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
