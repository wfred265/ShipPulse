import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatTownLocationString } from './geo';
import { getShipmentRegionConfig } from './regionUtils';

/**
 * Generate PDF Invoice bound immutably to shipment region (USA = EN/$, EUROPE = FR/€)
 * @param {Object} shipment 
 * @param {String} type - 'shipping' | 'insurance'
 */
export async function generateShipmentInvoicePDF(shipment, type = 'shipping') {
  const isInsuranceInvoice = type === 'insurance';

  // Immutable per-shipment region binding
  const regionConfig = getShipmentRegionConfig(shipment);
  const isFR = regionConfig.lang === 'fr';
  const formatCurrencyPDF = regionConfig.formatCurrency;

  // 1. Try DOM Capture via html2canvas (Exact 1:1 Parity)
  const paperElement = document.getElementById('invoice-paper-preview');
  if (paperElement) {
    try {
      const canvas = await html2canvas(paperElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const filename = isInsuranceInvoice ? `ShipPulse_Insurance_Invoice_${shipment.id}.pdf` : `ShipPulse_Freight_Invoice_${shipment.id}.pdf`;
      pdf.save(filename);
      return;
    } catch (e) {
      console.warn("DOM Capture PDF export failed, falling back to jsPDF vector rendering:", e);
    }
  }

  // 2. Vector jsPDF Fallback
  const doc = new jsPDF('p', 'mm', 'a4');
  
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

  const primaryNavy = [11, 25, 44];
  const primaryCyan = [0, 168, 232];
  const accentBlue = [0, 119, 182];
  const emeraldGreen = [5, 150, 105];
  const textDark = [15, 23, 42];
  const textMuted = [100, 116, 139];
  const bgLight = [248, 250, 252];
  const borderLight = [226, 232, 240];

  doc.setFillColor(isInsuranceInvoice ? emeraldGreen[0] : primaryNavy[0], isInsuranceInvoice ? emeraldGreen[1] : primaryNavy[1], isInsuranceInvoice ? emeraldGreen[2] : primaryNavy[2]);
  doc.rect(0, 0, 210, 3, 'F');
  doc.setFillColor(...primaryCyan);
  doc.rect(0, 3, 210, 1, 'F');

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('SHIP', 14, 18);
  const shipWidth = doc.getTextWidth('SHIP');
  doc.setTextColor(...primaryCyan);
  doc.text('PULSE', 14 + shipWidth, 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...textMuted);
  doc.text(isFR ? 'Suivi de précision, livraison sans effort.' : 'Precision tracking, effortless delivery.', 14, 23);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isInsuranceInvoice ? emeraldGreen[0] : primaryNavy[0], isInsuranceInvoice ? emeraldGreen[1] : primaryNavy[1], isInsuranceInvoice ? emeraldGreen[2] : primaryNavy[2]);
  const docTitle = isInsuranceInvoice ? (isFR ? "FACTURE D'ASSURANCE" : 'INSURANCE CLEARANCE INVOICE') : (isFR ? 'FACTURE DE FRET' : 'FREIGHT & SHIPPING INVOICE');
  doc.text(docTitle, 196, 14, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textMuted);
  const invNumber = isInsuranceInvoice ? `INV-INS-${id}` : `INV-FRT-${id}`;
  doc.text(`${isFR ? 'Réf Facture :' : 'Invoice Ref:'} ${invNumber}`, 196, 19, { align: 'right' });
  doc.text(`${isFR ? 'ID Suivi :' : 'Tracking ID:'} ${id}`, 196, 24, { align: 'right' });
  doc.text(`${isFR ? "Date d'Émission :" : 'Issued Date:'} ${new Date(createdAt || Date.now()).toLocaleDateString(isFR ? 'fr-FR' : 'en-US')}`, 196, 29, { align: 'right' });

  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.5);
  doc.line(14, 34, 196, 34);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textMuted);
  doc.text(isFR ? 'Siège : 44 Wall St, New York, NY 10005, USA  |  Email : track.shippulse@gmail.com  |  Document Logistique Autorisé' : 'HQ: 44 Wall St, New York, NY 10005, USA  |  Email: track.shippulse@gmail.com  |  Official Authorized Logistics Document', 14, 39);

  let y = 44;

  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(14, y, 182, 12, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text(`${isFR ? 'ITINÉRAIRE :' : 'ROUTE:'} ${originTownStr.toUpperCase()}   ===>   ${destTownStr.toUpperCase()}`, 18, y + 7.5);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentBlue);
  doc.text(`MODE: ${(transportMode || 'truck').toUpperCase()}`, 190, y + 7.5, { align: 'right' });

  y += 18;

  const colWidth = 88;
  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(14, y, colWidth, 42, 2, 2, 'FD');

  doc.setFillColor(...primaryNavy);
  doc.rect(14, y, colWidth, 6, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(isFR ? "DETAILS EXPÉDITEUR" : 'SHIPPER / SENDER DETAILS', 18, y + 4.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(`${isFR ? 'Nom :' : 'Name:'} ${sender.firstName || ''} ${sender.lastName || ''}`, 18, y + 12);
  doc.text(`${isFR ? 'Société :' : 'Company:'} ${sender.company || 'N/A'}`, 18, y + 17);
  doc.text(`Email: ${sender.email || 'N/A'}`, 18, y + 22);
  doc.text(`${isFR ? 'Tél :' : 'Phone:'} ${sender.phone || 'N/A'}`, 18, y + 27);
  doc.text(`${isFR ? 'Départ :' : 'Departure:'} ${originTownStr}`, 18, y + 32);

  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(108, y, colWidth, 42, 2, 2, 'FD');

  doc.setFillColor(...emeraldGreen);
  doc.rect(108, y, colWidth, 6, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(isFR ? 'DETAILS DESTINATAIRE' : 'RECIPIENT / CONSIGNEE DETAILS', 112, y + 4.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(`${isFR ? 'Nom :' : 'Name:'} ${recipient.firstName || ''} ${recipient.lastName || ''}`, 112, y + 12);
  doc.text(`Email: ${recipient.email || 'N/A'}`, 112, y + 17);
  doc.text(`${isFR ? 'Tél :' : 'Phone:'} ${recipient.phone || 'N/A'}`, 112, y + 22);
  doc.text(`${isFR ? 'Arrivée :' : 'Destination:'} ${destTownStr}`, 112, y + 27);

  y += 48;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text(isFR ? 'PROPRIÉTÉS TECHNIQUES DU COLIS' : 'PACKAGE TECHNICAL SPECIFICATIONS', 14, y);

  y += 5;

  doc.setFillColor(...primaryNavy);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(isFR ? 'Description' : 'Description', 18, y + 4.8);
  doc.text(isFR ? 'Catégorie' : 'Category', 75, y + 4.8);
  doc.text(isFR ? 'Poids' : 'Weight', 110, y + 4.8);
  doc.text('Volume', 140, y + 4.8);
  doc.text('Dimensions', 165, y + 4.8);

  y += 7;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.rect(14, y, 182, 9, 'F');
  doc.rect(14, y, 182, 9, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(freight.description || (isFR ? 'Fret Général' : 'General Freight'), 18, y + 5.8);
  doc.text(freight.goodsType || 'Standard', 75, y + 5.8);
  doc.text(`${freight.weightKg || 0} kg`, 110, y + 5.8);
  doc.text(`${freight.volumeM3 || 0} m3`, 140, y + 5.8);
  doc.text(`${freight.dimensions?.length || 0}x${freight.dimensions?.width || 0}x${freight.dimensions?.height || 0} cm`, 165, y + 5.8);

  y += 18;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isInsuranceInvoice ? emeraldGreen[0] : primaryNavy[0], isInsuranceInvoice ? emeraldGreen[1] : primaryNavy[1], isInsuranceInvoice ? emeraldGreen[2] : primaryNavy[2]);
  doc.text(isInsuranceInvoice ? (isFR ? "DÉTAILS COUVERTURE POLICE D'ASSURANCE" : 'INSURANCE POLICY COVERAGE & SETTLEMENT DETAILS') : (isFR ? 'RÉCAPITULATIF FINANCIER DU FRET' : 'FREIGHT SHIPPING FINANCIAL SETTLEMENT SUMMARY'), 14, y);

  y += 5;

  if (isInsuranceInvoice) {
    doc.setFillColor(...emeraldGreen);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(isFR ? 'Article Assuré' : 'Insured Cargo Item', 18, y + 4.8);
    doc.text(isFR ? 'Valeur Déclarée' : 'Declared Value', 80, y + 4.8);
    doc.text(isFR ? 'Couverture' : 'Coverage Amount', 120, y + 4.8);
    doc.text(isFR ? "Frais d'Assurance" : 'Insurance Fee', 160, y + 4.8);

    y += 7;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderLight);
    doc.rect(14, y, 182, 9, 'F');
    doc.rect(14, y, 182, 9, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(freight.description || 'Insured Cargo', 18, y + 5.8);
    doc.text(formatCurrencyPDF(freight.declaredValue), 80, y + 5.8);
    doc.text(formatCurrencyPDF(freight.declaredValue), 120, y + 5.8);
    doc.text(formatCurrencyPDF(freight.insuranceAmount), 160, y + 5.8);

    // Mandatory Insurance Payment Notice Box on PDF
    y += 15;
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(252, 165, 165);
    doc.rect(14, y, 182, 11, 'F');
    doc.rect(14, y, 182, 11, 'S');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text(isFR ? "Avis – Frais d'Assurance :" : 'Notice – Insurance Fees:', 18, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(153, 27, 27);
    doc.text(isFR ? "Le règlement des frais d'assurance est obligatoire pour finaliser l'expédition. Si le paiement n'est pas effectué, le statut restera « EN ATTENTE » et la livraison sera suspendue." : 'Payment of insurance fees is required to finalize the shipment. If payment is not made, the shipment status will remain "PENDING" and delivery will be suspended.', 18, y + 8.5);
  } else {
    // Freight Shipping Invoice
    doc.setFillColor(...primaryNavy);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(isFR ? 'Description de la Ligne' : 'Line Item Description', 18, y + 4.8);
    doc.text(isFR ? 'Frais Fret de Base' : 'Base Shipping Freight Fee', 100, y + 4.8);
    doc.text(isFR ? 'Statut Frais' : 'Fee Status', 160, y + 4.8);

    y += 7;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderLight);
    doc.rect(14, y, 182, 9, 'F');
    doc.rect(14, y, 182, 9, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(isFR ? 'Frais de Fret & Logistique Expédition de Base' : 'Base Shipping Freight & Logistics Fee', 18, y + 5.8);
    doc.text(formatCurrencyPDF(freight.shippingFee), 100, y + 5.8);
    doc.text((freight.shippingFeeStatus || (isFR ? 'Payé' : 'Paid')).toUpperCase(), 160, y + 5.8);
  }

  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.5);
  doc.line(14, 275, 196, 275);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textMuted);
  doc.text('ShipPulse Logistics Inc.  |  44 Wall St, New York, NY 10005, USA  |  track.shippulse@gmail.com', 14, 282);

  const filename = isInsuranceInvoice ? `ShipPulse_Insurance_Invoice_${id}.pdf` : `ShipPulse_Freight_Invoice_${id}.pdf`;
  doc.save(filename);
}

export async function generateBothInvoicesPDF(shipment) {
  await generateShipmentInvoicePDF(shipment, 'shipping');
  setTimeout(async () => {
    await generateShipmentInvoicePDF(shipment, 'insurance');
  }, 400);
}
