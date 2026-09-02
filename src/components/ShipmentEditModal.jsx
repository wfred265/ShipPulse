import React, { useState } from 'react';
import { X, Edit3, Package, Send, UserCheck, Truck, Plane, Ship, Bus, CreditCard, Save, Globe, AlertTriangle } from 'lucide-react';
import { useShipments } from '../context/ShipmentContext';
import { useLanguage } from '../context/LanguageContext';
import LocationAutocompleteInput from './LocationAutocompleteInput';
import { formatTownLocationString, resolveCoords, isValidWorldwideLocation } from '../utils/geo';

export default function ShipmentEditModal({ shipment, onClose }) {
  if (!shipment) return null;
  const { lang, currencySymbol } = useLanguage();
  const { updateShipment } = useShipments();
  const [locationValidationError, setLocationValidationError] = useState('');

  const buildInitialLoc = (rawLoc, fallbackCity, coords) => {
    if (rawLoc && typeof rawLoc === 'object') {
      return {
        country: rawLoc.country || 'United States',
        town: rawLoc.town || rawLoc.city || fallbackCity,
        city: rawLoc.city || fallbackCity,
        lat: rawLoc.lat !== undefined ? rawLoc.lat : (coords?.[0] || 40.7128),
        lng: rawLoc.lng !== undefined ? rawLoc.lng : (coords?.[1] || -74.0060)
      };
    }
    if (typeof rawLoc === 'string' && rawLoc.trim()) {
      return {
        country: 'United States',
        town: rawLoc,
        city: rawLoc,
        lat: coords?.[0] || 40.7128,
        lng: coords?.[1] || -74.0060
      };
    }
    return {
      country: 'United States',
      town: fallbackCity || 'Plattsburgh, NY',
      city: fallbackCity || 'Plattsburgh',
      lat: coords?.[0] || 40.7128,
      lng: coords?.[1] || -74.0060
    };
  };

  const [formData, setFormData] = useState(() => ({
    transportMode: shipment.transportMode || 'truck',
    durationHours: shipment.durationHours || 12,
    
    originLocation: buildInitialLoc(shipment.originLocation, shipment.originCity, shipment.originCoords),
    destLocation: buildInitialLoc(shipment.destLocation, shipment.destinationCity, shipment.destCoords),

    sender: {
      firstName: shipment.sender?.firstName || '',
      lastName: shipment.sender?.lastName || '',
      company: shipment.sender?.company || '',
      email: shipment.sender?.email || '',
      phone: shipment.sender?.phone || '',
      address: shipment.sender?.address || '',
      idDocument: shipment.sender?.idDocument || ''
    },

    recipient: {
      firstName: shipment.recipient?.firstName || '',
      lastName: shipment.recipient?.lastName || '',
      email: shipment.recipient?.email || '',
      phone: shipment.recipient?.phone || '',
      deliveryAddress: shipment.recipient?.deliveryAddress || '',
      specialInstructions: shipment.recipient?.specialInstructions || ''
    },

    freight: {
      description: shipment.freight?.description || '',
      goodsType: shipment.freight?.goodsType || 'Standard',
      weightKg: shipment.freight?.weightKg || 50,
      volumeM3: shipment.freight?.volumeM3 || 0.5,
      dimensions: shipment.freight?.dimensions || { length: 60, width: 40, height: 40 },
      declaredValue: shipment.freight?.declaredValue || 5000,
      insuranceAmount: shipment.freight?.insuranceAmount || 150,
      shippingFee: shipment.freight?.shippingFee || 350,
      shippingFeeStatus: shipment.freight?.shippingFeeStatus || 'Paid',
      insuranceFeeStatus: shipment.freight?.insuranceFeeStatus || 'Paid',
      paymentStatus: shipment.freight?.paymentStatus || 'Paid'
    }
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocationValidationError('');

    const isOriginValid = isValidWorldwideLocation(formData.originLocation);
    const isDestValid = isValidWorldwideLocation(formData.destLocation);

    if (!isOriginValid || !isDestValid) {
      setLocationValidationError("Cannot save manifest: Departure and Destination MUST be selected from the recognized worldwide location dropdown list!");
      return;
    }

    const originLoc = formData.originLocation;
    const destLoc = formData.destLocation;

    const originCoords = resolveCoords(originLoc, shipment.originCoords || [40.7128, -74.0060]);
    const destCoords = resolveCoords(destLoc, shipment.destCoords || [51.5074, -0.1278]);

    const originCityStr = formatTownLocationString(originLoc);
    const destCityStr = formatTownLocationString(destLoc);

    const isShippingPending = formData.freight.shippingFeeStatus === 'Pending';
    const isInsurancePending = formData.freight.insuranceFeeStatus === 'Pending';
    const overallPaymentStatus = (isShippingPending || isInsurancePending) ? 'Pending' : (formData.freight.shippingFeeStatus === 'Partial' || formData.freight.insuranceFeeStatus === 'Partial' ? 'Partial' : 'Paid');

    let nextStatus = shipment.status;
    if (isShippingPending || isInsurancePending) {
      nextStatus = 'Payment Pending';
    } else if (shipment.status === 'Payment Pending') {
      nextStatus = 'In Transit';
    }

    const updatedPayload = {
      ...formData,
      originLocation: originLoc,
      destLocation: destLoc,
      originCity: originCityStr,
      destinationCity: destCityStr,
      originCoords,
      destCoords,
      status: nextStatus,
      isPaused: (isShippingPending || isInsurancePending) ? false : shipment.isPaused,
      freight: {
        ...formData.freight,
        paymentStatus: overallPaymentStatus
      }
    };

    updateShipment(shipment.id, updatedPayload);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '880px' }}>
        
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: '20px', borderBottom: '2px solid var(--primary-cyan)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Edit3 size={24} color="var(--primary-cyan)" />
            <h3 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: '1.3rem' }}>
              Edit Shipment Manifest & Fees ({shipment.id})
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#AAA', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Validation Error */}
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

          {/* Section 1: Financial Payment Statuses */}
          <div style={{ background: '#E0F2FE', padding: '18px', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-cyan)' }}>
            <h4 style={{ color: 'var(--primary-navy)', marginBottom: '12px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="var(--accent-blue)" /> Fee Payment Statuses (Controls Journey Start)
            </h4>

            <div className="grid-2">
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '4px' }}>
                  Shipping Fee Status:
                </label>
                <select 
                  className="glass-input"
                  value={formData.freight.shippingFeeStatus}
                  onChange={e => setFormData({ ...formData, freight: { ...formData.freight, shippingFeeStatus: e.target.value } })}
                  style={{ fontWeight: 700 }}
                >
                  <option value="Paid">✓ Paid (Cleared for Transit)</option>
                  <option value="Partial">🌗 Partially Paid (Cleared for Transit)</option>
                  <option value="Pending">⌛ Pending (Halts Journey at Departure)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '4px' }}>
                  Insurance Fee Status:
                </label>
                <select 
                  className="glass-input"
                  value={formData.freight.insuranceFeeStatus}
                  onChange={e => setFormData({ ...formData, freight: { ...formData.freight, insuranceFeeStatus: e.target.value } })}
                  style={{ fontWeight: 700 }}
                >
                  <option value="Paid">✓ Paid (Cleared for Transit)</option>
                  <option value="Partial">🌗 Partially Paid (Cleared for Transit)</option>
                  <option value="Pending">⌛ Pending (Halts Journey at Departure)</option>
                </select>
                <span style={{ fontSize: '0.73rem', color: '#E11D48', fontStyle: 'italic', display: 'block', marginTop: '3px' }}>
                  * Setting both to Paid or Partial clears the payment hold and starts journey!
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Worldwide Location Autocomplete Selection */}
          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <h4 style={{ color: 'var(--primary-navy)', marginBottom: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="var(--primary-cyan)" /> Worldwide Departure & Destination (Must be Selected from Dropdown)
            </h4>

            <div className="grid-2" style={{ marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-navy)', display: 'block', marginBottom: '4px' }}>
                  Departure Worldwide Location *:
                </label>
                <LocationAutocompleteInput 
                  value={formData.originLocation}
                  onChange={(val) => setFormData({ ...formData, originLocation: val })}
                  onSelectLocation={(loc) => setFormData({ ...formData, originLocation: loc })}
                  placeholder="Type departure city, country..."
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-navy)', display: 'block', marginBottom: '4px' }}>
                  Destination Worldwide Location *:
                </label>
                <LocationAutocompleteInput 
                  value={formData.destLocation}
                  onChange={(val) => setFormData({ ...formData, destLocation: val })}
                  onSelectLocation={(loc) => setFormData({ ...formData, destLocation: loc })}
                  placeholder="Type destination city, country..."
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
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
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: '6px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <IconComp size={15} /> {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Shipper & Recipient Info */}
          <div className="grid-2">
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <h4 style={{ color: 'var(--primary-navy)', marginBottom: '10px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={15} color="var(--primary-cyan)" /> Edit Shipper Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="First Name" className="glass-input" value={formData.sender.firstName} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, firstName: e.target.value } })} />
                  <input type="text" placeholder="Last Name" className="glass-input" value={formData.sender.lastName} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, lastName: e.target.value } })} />
                </div>
                <input type="text" placeholder="Company Name" className="glass-input" value={formData.sender.company} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, company: e.target.value } })} />
                <input type="email" placeholder="Email" className="glass-input" value={formData.sender.email} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, email: e.target.value } })} />
                <input type="tel" placeholder="Phone" className="glass-input" value={formData.sender.phone} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, phone: e.target.value } })} />
                <input type="text" placeholder="ID / Passport Document" className="glass-input" value={formData.sender.idDocument} onChange={e => setFormData({ ...formData, sender: { ...formData.sender, idDocument: e.target.value } })} />
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <h4 style={{ color: '#059669', marginBottom: '10px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={15} /> Edit Recipient Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="First Name" className="glass-input" value={formData.recipient.firstName} onChange={e => setFormData({ ...formData, recipient: { ...formData.recipient, firstName: e.target.value } })} />
                  <input type="text" placeholder="Last Name" className="glass-input" value={formData.recipient.lastName} onChange={e => setFormData({ ...formData, recipient: { ...formData.recipient, lastName: e.target.value } })} />
                </div>
                <input type="email" placeholder="Email" className="glass-input" value={formData.recipient.email} onChange={e => setFormData({ ...formData, recipient: { ...formData.recipient, email: e.target.value } })} />
                <input type="tel" placeholder="Phone" className="glass-input" value={formData.recipient.phone} onChange={e => setFormData({ ...formData, recipient: { ...formData.recipient, phone: e.target.value } })} />
                <input type="text" placeholder="Delivery Address" className="glass-input" value={formData.recipient.deliveryAddress} onChange={e => setFormData({ ...formData, recipient: { ...formData.recipient, deliveryAddress: e.target.value } })} />
              </div>
            </div>
          </div>

          {/* Section 4: Freight Specifications */}
          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <h4 style={{ color: 'var(--primary-navy)', marginBottom: '10px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={15} color="var(--primary-cyan)" /> Edit Freight Specifications & Fees
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Content Description" className="glass-input" value={formData.freight.description} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, description: e.target.value } })} />

              <div className="grid-3">
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Weight (kg)</label>
                  <input type="number" step="0.1" className="glass-input" value={formData.freight.weightKg} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, weightKg: parseFloat(e.target.value) || 0 } })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Volume (m³)</label>
                  <input type="number" step="0.01" className="glass-input" value={formData.freight.volumeM3} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, volumeM3: parseFloat(e.target.value) || 0 } })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Goods Category</label>
                  <select className="glass-input" value={formData.freight.goodsType} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, goodsType: e.target.value } })}>
                    <option value="Standard">Standard</option>
                    <option value="Fragile">Fragile</option>
                    <option value="Perishable">Perishable</option>
                    <option value="Hazardous">Hazardous</option>
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Declared Value ({currencySymbol})</label>
                  <input type="number" className="glass-input" value={formData.freight.declaredValue} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, declaredValue: parseFloat(e.target.value) || 0 } })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Shipping Freight Fee ({currencySymbol})</label>
                  <input type="number" className="glass-input" value={formData.freight.shippingFee} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, shippingFee: parseFloat(e.target.value) || 0 } })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Insurance Coverage ({currencySymbol})</label>
                  <input type="number" className="glass-input" value={formData.freight.insuranceAmount} onChange={e => setFormData({ ...formData, freight: { ...formData.freight, insuranceAmount: parseFloat(e.target.value) || 0 } })} />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-cyan">
              <Save size={18} /> Save Manifest Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
