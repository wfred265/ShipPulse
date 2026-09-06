import { interpolatePosition } from './geo';

/**
 * Utility functions for cargo dimension calculations, freight telemetry, and regional formatting.
 */

/**
 * Helper to check if a shipment has pending shipping or insurance fees.
 * Returns true if fees are unpaid (Pending status).
 */
export function checkPaymentPending(shipment) {
  if (!shipment) return false;
  const freight = shipment.freight || {};
  const isShippingPending = freight.shippingFeeStatus === 'Pending';
  const isInsurancePending = freight.insuranceFeeStatus === 'Pending';
  return isShippingPending || isInsurancePending || freight.paymentStatus === 'Pending' || shipment.status === 'Payment Pending';
}

/**
 * Format date & time formatted strictly by regional locale.
 * - USA (isFR=false): YYYY-MM-DD at 6:00 PM (12-hour AM/PM)
 * - EUROPE (isFR=true): YYYY-MM-DD à 18:00 (24-hour)
 */
export function formatRegionalDateTime(dateStr, timeStr, isFR = false) {
  const d = (dateStr || '2026-09-05').trim();
  let rawTime = (timeStr || '08:00').trim();

  // Check if rawTime contains AM/PM
  const is12Hour = /am|pm/i.test(rawTime);

  if (is12Hour) {
    if (!isFR) {
      return `${d} at ${rawTime}`;
    } else {
      const match = rawTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        const time24 = `${String(h).padStart(2, '0')}:${m}`;
        return `${d} à ${time24}`;
      }
    }
  }

  // Handle 24-hour rawTime format e.g. "18:10"
  const parts = rawTime.split(':');
  let h = parseInt(parts[0], 10);
  let m = (parts[1] || '00').substring(0, 2).padStart(2, '0');
  if (isNaN(h)) h = 8;

  if (isFR) {
    const time24 = `${String(h).padStart(2, '0')}:${m}`;
    return `${d} à ${time24}`;
  }

  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const time12 = `${h}:${m} ${ampm}`;

  return `${d} at ${time12}`;
}

/**
 * Format raw estimated arrival string with AM/PM for USA or 24h for Europe.
 */
export function formatEstArrivalString(estArrivalStr, isFR = false) {
  if (!estArrivalStr) return '';
  // Strip any accidental leading duration text
  const cleanStr = estArrivalStr.replace(/^[0-9.]+\s*(h|hrs?|heures?)\s*[•·-]\s*/i, '').trim();

  // If already contains 'at' or 'à', separate and convert
  if (cleanStr.includes(' at ') || cleanStr.includes(' à ')) {
    const parts = cleanStr.split(/\s+(?:at|à)\s+/);
    if (parts.length === 2) {
      return formatRegionalDateTime(parts[0], parts[1], isFR);
    }
  }

  // If format is "YYYY-MM-DD HH:mm" or "YYYY-MM-DD HH:mm AM/PM"
  const spaceParts = cleanStr.split(' ');
  if (spaceParts.length >= 2) {
    const timePart = spaceParts.slice(1).join(' ');
    return formatRegionalDateTime(spaceParts[0], timePart, isFR);
  }

  return cleanStr;
}

/**
 * Format Transport Mode name by locale.
 */
export function formatTransportModeLabel(mode, isFR = false) {
  const m = (mode || 'truck').toLowerCase();
  switch (m) {
    case 'airplane':
    case 'air':
      return isFR ? '✈️ Fret Aérien' : '✈️ Air Cargo Freight';
    case 'boat':
    case 'ship':
    case 'sea':
      return isFR ? '🚢 Cargo Maritime' : '🚢 Ocean Vessel Freight';
    case 'bus':
      return isFR ? '🚌 Courrier Bus Express' : '🚌 Express Bus Courier';
    default:
      return isFR ? '🚚 Transport Routier' : '🚚 Cargo Truck Transport';
  }
}

/**
 * Get Proportional Status Badge & Config based on shipment state.
 */
export function getProportionalStatusConfig(shipment, isFR = false) {
  if (!shipment) return {};
  const freight = shipment.freight || {};
  const isShippingPending = freight.shippingFeeStatus === 'Pending';
  const isInsurancePending = freight.insuranceFeeStatus === 'Pending';
  const isPaymentBlocked = isShippingPending || isInsurancePending || freight.paymentStatus === 'Pending' || shipment.status === 'Payment Pending';
  const isPaused = shipment.isPaused;
  const status = shipment.status || 'In Transit';

  if (isPaymentBlocked) {
    return {
      key: 'payment_pending',
      badgeLabel: isFR ? '⌛ PAIEMENT EN ATTENTE' : '⌛ PAYMENT HOLD',
      badgeClass: 'badge-pending',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
      noticeText: isFR 
        ? "⚠️ Programmation du départ suspendue : Le règlement des frais est obligatoire avant de pouvoir définir les dates et heures de livraison." 
        : "⚠️ Departure schedule on hold: Full settlement is required before setting delivery dates and times."
    };
  }

  if (isPaused) {
    return {
      key: 'paused',
      badgeLabel: isFR ? '⏸️ TRANSPORT EN PAUSE' : '⏸️ JOURNEY PAUSED',
      badgeClass: 'badge-paused',
      color: '#E11D48',
      bgColor: '#FFF1F2',
      borderColor: '#FECDD3',
      noticeText: isFR
        ? `⚠️ Transport temporairement interrompu : ${shipment.pauseReason || 'Inspection opérationnelle en cours.'}`
        : `⚠️ Journey temporarily paused: ${shipment.pauseReason || 'Operational inspection in progress.'}`
    };
  }

  if (status === 'Scheduled') {
    return {
      key: 'scheduled',
      badgeLabel: isFR ? '📅 EXPÉDITION PROGRAMMÉE' : '📅 SHIPMENT SCHEDULED',
      badgeClass: 'badge-transit',
      color: '#0284C7',
      bgColor: '#F0F9FF',
      borderColor: '#BAE6FD',
      noticeText: isFR
        ? "ℹ️ Transport programmé : Le véhicule est au terminal de départ et commencera son trajet automatiquement à l'heure exacte."
        : "ℹ️ Carrier scheduled: Cargo is at origin terminal and will automatically commence transit at departure time."
    };
  }

  if (status === 'Delivered') {
    return {
      key: 'delivered',
      badgeLabel: isFR ? '✅ LIVRÉ & SIGNÉ' : '✅ DELIVERED & SIGNED',
      badgeClass: 'badge-paid',
      color: '#059669',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      noticeText: isFR
        ? "✅ Transport finalisé : La marchandise a été livrée et la signature du destinataire a été vérifiée."
        : "✅ Delivery complete: Cargo successfully delivered and consignee signature verified."
    };
  }

  return {
    key: 'in_transit',
    badgeLabel: isFR ? '🚚 EN TRANSIT' : '🚚 IN TRANSIT',
    badgeClass: 'badge-transit',
    color: '#00A8E8',
    bgColor: '#E0F2FE',
    borderColor: '#7DD3FC',
    noticeText: isFR
      ? "🚚 Transporteur en route : La géolocalisation et la télémétrie en temps réel sont actives."
      : "🚚 Carrier en route: Real-time GPS telemetry and live progress tracking active."
  };
}

/**
 * Calculates or normalizes package dimensions (length x width x height in cm)
 * from freight weight (kg), volume (m³), or explicit custom dimensions.
 */
export function calcFreightDimensions(weightKg = 50, volumeM3 = 0.5, customDimensions = null) {
  if (customDimensions && typeof customDimensions === 'object') {
    const l = parseFloat(customDimensions.length);
    const w = parseFloat(customDimensions.width);
    const h = parseFloat(customDimensions.height);
    if (!isNaN(l) && l > 0 && !isNaN(w) && w > 0 && !isNaN(h) && h > 0) {
      return { length: Math.round(l), width: Math.round(w), height: Math.round(h) };
    }
  }

  let vol = parseFloat(volumeM3) || 0;
  const wKg = parseFloat(weightKg) || 0;

  if (vol <= 0 && wKg > 0) {
    vol = Math.max(0.05, wKg / 250);
  } else if (vol <= 0) {
    vol = 0.5;
  }

  const totalCm3 = vol * 1000000;
  const s = Math.cbrt(totalCm3);
  const length = Math.max(10, Math.round(s * 1.2));
  const width = Math.max(10, Math.round(s * 1.0));
  const height = Math.max(10, Math.round(s * 0.8333));

  return { length, width, height };
}

/**
 * Format dimensions as a string e.g. "120 × 80 × 90 cm"
 */
export function formatDimensionsString(weightKg, volumeM3, dimensions) {
  const dims = calcFreightDimensions(weightKg, volumeM3, dimensions);
  return `${dims.length} × ${dims.width} × ${dims.height} cm`;
}

/**
 * Calculates estimated arrival timestamp string ("YYYY-MM-DD HH:mm") automatically.
 */
export function calcEstArrivalDate(depDate, depTime, durationHours, progressPercentage = 0, isPaused = false) {
  const todayStr = new Date().toISOString().substring(0, 10);
  const dDate = depDate || todayStr;
  const dTime = depTime || '08:00';
  const durHours = parseFloat(durationHours) || 12;
  const durMs = durHours * 3600 * 1000;

  // Parse local date components to avoid timezone offset mismatches
  const [yearStr, monthStr, dayStr] = dDate.split('-');
  const [hourStr, minStr] = dTime.split(':');
  const y = parseInt(yearStr, 10) || 2026;
  const m = (parseInt(monthStr, 10) || 9) - 1;
  const d = parseInt(dayStr, 10) || 5;
  const hh = parseInt(hourStr, 10) || 8;
  const mm = parseInt(minStr, 10) || 0;

  const depObj = new Date(y, m, d, hh, mm, 0);
  const depMs = depObj.getTime();
  const nowMs = Date.now();

  const formatLocalDate = (dtObj) => {
    const outY = dtObj.getFullYear();
    const outM = String(dtObj.getMonth() + 1).padStart(2, '0');
    const outD = String(dtObj.getDate()).padStart(2, '0');
    const outH = String(dtObj.getHours()).padStart(2, '0');
    const outMin = String(dtObj.getMinutes()).padStart(2, '0');
    return `${outY}-${outM}-${outD} ${outH}:${outMin}`;
  };

  if (isNaN(depMs)) {
    return formatLocalDate(new Date(nowMs + durMs));
  }

  if (isPaused) {
    const progressRatio = Math.min(1, Math.max(0, (parseFloat(progressPercentage) || 0) / 100));
    const remainingMs = durMs * (1 - progressRatio);
    return formatLocalDate(new Date(nowMs + remainingMs));
  }

  if (nowMs < depMs) {
    return formatLocalDate(new Date(depMs + durMs));
  } else {
    const progressRatio = Math.min(1, Math.max(0, (parseFloat(progressPercentage) || 0) / 100));
    if (progressRatio >= 1) {
      return formatLocalDate(new Date(depMs + durMs));
    }
    const remainingMs = durMs * (1 - progressRatio);
    const dynamicEstMs = Math.max(depMs + durMs, nowMs + remainingMs);
    return formatLocalDate(new Date(dynamicEstMs));
  }
}

/**
 * Parse departure timestamp safely from shipment object, handling 12h AM/PM, 24h, and fallback ISO strings.
 */
export function parseDepartureTimestamp(s) {
  if (!s) return Date.now();
  const dateStr = s.departureDate;
  const timeStr = s.departureTime;

  if (dateStr) {
    const d = dateStr.trim();
    let t = (timeStr || '08:00').trim();

    // Handle 12-hour format e.g. "6:10 PM" or "06:10 PM"
    const match12 = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let h = 8, m = 0;
    if (match12) {
      h = parseInt(match12[1], 10);
      m = parseInt(match12[2], 10);
      const ampm = match12[3].toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
    } else {
      const parts = t.split(':');
      h = parseInt(parts[0], 10) || 0;
      m = parseInt(parts[1], 10) || 0;
    }

    const [yearStr, monthStr, dayStr] = d.split('-');
    const y = parseInt(yearStr, 10) || 2026;
    const mon = (parseInt(monthStr, 10) || 9) - 1;
    const day = parseInt(dayStr, 10) || 5;

    const dateObj = new Date(y, mon, day, h, m, 0);
    const ts = dateObj.getTime();
    if (!isNaN(ts)) return ts;
  }

  if (s.departureDateTime) {
    const ts = new Date(s.departureDateTime).getTime();
    if (!isNaN(ts)) return ts;
  }

  if (s.createdAt) {
    const ts = new Date(s.createdAt).getTime();
    if (!isNaN(ts)) return ts;
  }

  return Date.now();
}

/**
 * Compute fluid real-time telemetry position and status for a shipment.
 */
export function computeShipmentTelemetry(s) {
  if (!s) return s;

  const isShippingPending = s.freight?.shippingFeeStatus === 'Pending';
  const isInsurancePending = s.freight?.insuranceFeeStatus === 'Pending';
  const isPaymentPending = isShippingPending || isInsurancePending || s.freight?.paymentStatus === 'Pending' || s.status === 'Payment Pending';

  if (isPaymentPending) {
    return {
      ...s,
      status: 'Payment Pending',
      progressPercentage: 0,
      currentCoords: s.originCoords
    };
  }

  if (s.isPaused) {
    const dynamicEstArr = calcEstArrivalDate(s.departureDate, s.departureTime, s.durationHours, s.progressPercentage, true);
    return {
      ...s,
      estimatedArrivalDate: dynamicEstArr
    };
  }

  if (s.status === 'Delivered' || s.status === 'Cancelled' || s.autoMode === false) {
    return s;
  }

  const depTime = parseDepartureTimestamp(s);
  const durMs = (parseFloat(s.durationHours) || 12) * 3600 * 1000;
  const nowMs = Date.now();

  let calculatedProgress = 0;
  if (nowMs < depTime) {
    calculatedProgress = 0;
  } else if (nowMs >= depTime + durMs) {
    calculatedProgress = 100;
  } else {
    calculatedProgress = Math.min(100, Math.max(0, ((nowMs - depTime) / durMs) * 100));
  }

  const nextProgress = Math.round(calculatedProgress * 10) / 10;
  const nextCoords = interpolatePosition(s.originCoords, s.destCoords, nextProgress / 100);

  let nextStatus = 'In Transit';
  if (nowMs < depTime) {
    nextStatus = 'Scheduled';
  } else if (nextProgress >= 100) {
    nextStatus = 'Delivered';
  }

  let updatedTimeline = s.timeline || [];
  if (nextProgress >= 100) {
    const hasDeliveredItem = updatedTimeline.some(t => t.title && t.title.toLowerCase().includes('delivered'));
    if (!hasDeliveredItem) {
      updatedTimeline = [
        ...updatedTimeline,
        {
          id: Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          location: s.destinationCity || s.destLocation?.city || 'Destination Terminal',
          title: "Package Delivered & Consignee Signature Verified",
          status: "completed"
        }
      ];
    }
  }

  return {
    ...s,
    progressPercentage: nextProgress,
    currentCoords: nextCoords,
    status: nextStatus,
    timeline: updatedTimeline
  };
}
