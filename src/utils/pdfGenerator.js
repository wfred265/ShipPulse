import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatTownLocationString } from './geo.js';

export async function generateShipmentInvoicePDF(shipment, type = 'shipping') {
  const { id } = shipment || {};
  const isInsuranceInvoice = type === 'insurance';

  // 1. Fixed Standard A4 DOM Capture via html2canvas (Identical on Phones & Laptops!)
  const element = document.getElementById('invoice-paper-preview');
  
  if (element) {
    try {
      // Temporarily enforce fixed standard A4 width (794px) during capture so phone screens produce 100% identical PDFs as laptops
      const originalStyleWidth = element.style.width;
      const originalMinWidth = element.style.minWidth;
      
      element.style.width = '794px';
      element.style.minWidth = '794px';

      const canvas = await html2canvas(element, {
        scale: 2.0, // High resolution crisp A4 rendering
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        width: 794
      });

      // Restore responsive styles
      element.style.width = originalStyleWidth;
      element.style.minWidth = originalMinWidth;

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const filename = isInsuranceInvoice ? `ShipPulse_Insurance_Invoice_${id}.pdf` : `ShipPulse_Freight_Invoice_${id}.pdf`;
      pdf.save(filename);
      return;
    } catch (err) {
      console.warn("html2canvas A4 capture fallback:", err);
    }
  }

  // 2. Programmatic Standard A4 PDF Fallback
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const {
    sender = {},
    recipient = {},
    freight = {},
    originCity,
    destinationCity,
    originLocation,
    destLocation,
    transportMode,
    createdAt
  } = shipment || {};

  const originTownStr = formatTownLocationString(originLocation) || originCity || "Plattsburgh, NY";
  const destTownStr = formatTownLocationString(destLocation) || destinationCity || "Riverside, CA";

  const primaryNavy = [11, 25, 44];
  const primaryCyan = [0, 168, 232];
  const accentBlue = [0, 119, 182];
  const emeraldGreen = [5, 150, 105];
  const bgLight = [248, 250, 252];
  const borderLight = [226, 232, 240];
  const textDark = [15, 23, 42];
  const textMuted = [100, 116, 139];

  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, 210, 4, 'F');
  doc.setFillColor(...primaryCyan);
  doc.rect(0, 4, 210, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryNavy);
  doc.text('SHIP', 14, 18);
  doc.setTextColor(...primaryCyan);
  doc.text('PULSE', 32, 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...textMuted);
  doc.text('Precision tracking, effortless delivery.', 14, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(isInsuranceInvoice ? emeraldGreen[0] : primaryNavy[0], isInsuranceInvoice ? emeraldGreen[1] : primaryNavy[1], isInsuranceInvoice ? emeraldGreen[2] : primaryNavy[2]);
  const docTitle = isInsuranceInvoice ? 'INSURANCE COVERAGE CLEARANCE INVOICE' : 'FREIGHT & SHIPPING INVOICE';
  doc.text(docTitle, 196, 14, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textMuted);
  const invNumber = isInsuranceInvoice ? `INV-INS-${id}` : `INV-FRT-${id}`;
  doc.text(`Invoice Ref: ${invNumber}`, 196, 19, { align: 'right' });
  doc.text(`Tracking ID: ${id}`, 196, 24, { align: 'right' });
  doc.text(`Issued Date: ${new Date(createdAt || Date.now()).toLocaleDateString()}`, 196, 29, { align: 'right' });

  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.5);
  doc.line(14, 34, 196, 34);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textMuted);
  doc.text('HQ: 44 Wall St, New York, NY 10005, USA  |  Email: track.shippulse@gmail.com  |  Official Authorized Logistics Document', 14, 39);

  let y = 44;

  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(14, y, 182, 12, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text(`ROUTE: ${originTownStr.toUpperCase()}   ===>   ${destTownStr.toUpperCase()}`, 18, y + 7.5);
  
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
  doc.text('SHIPPER / SENDER DETAILS', 18, y + 4.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(`Name: ${sender.firstName || ''} ${sender.lastName || ''}`, 18, y + 12);
  doc.text(`Company: ${sender.company || 'N/A'}`, 18, y + 17);
  doc.text(`Email: ${sender.email || 'N/A'}`, 18, y + 22);
  doc.text(`Phone: ${sender.phone || 'N/A'}`, 18, y + 27);
  doc.text(`Departure: ${originTownStr}`, 18, y + 32);

  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(108, y, colWidth, 42, 2, 2, 'FD');

  doc.setFillColor(...emeraldGreen);
  doc.rect(108, y, colWidth, 6, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('RECIPIENT / CONSIGNEE DETAILS', 112, y + 4.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(`Name: ${recipient.firstName || ''} ${recipient.lastName || ''}`, 112, y + 12);
  doc.text(`Email: ${recipient.email || 'N/A'}`, 112, y + 17);
  doc.text(`Phone: ${recipient.phone || 'N/A'}`, 112, y + 22);
  doc.text(`Destination: ${destTownStr}`, 112, y + 27);

  y += 48;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('PACKAGE TECHNICAL SPECIFICATIONS', 14, y);

  y += 5;

  doc.setFillColor(...primaryNavy);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Description', 18, y + 4.8);
  doc.text('Category', 75, y + 4.8);
  doc.text('Weight', 110, y + 4.8);
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
  doc.text(freight.description || 'General Freight', 18, y + 5.8);
  doc.text(freight.goodsType || 'Standard', 75, y + 5.8);
  doc.text(`${freight.weightKg || 0} kg`, 110, y + 5.8);
  doc.text(`${freight.volumeM3 || 0} m3`, 140, y + 5.8);
  doc.text(`${freight.dimensions?.length || 0}x${freight.dimensions?.width || 0}x${freight.dimensions?.height || 0} cm`, 165, y + 5.8);

  y += 18;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isInsuranceInvoice ? emeraldGreen[0] : primaryNavy[0], isInsuranceInvoice ? emeraldGreen[1] : primaryNavy[1], isInsuranceInvoice ? emeraldGreen[2] : primaryNavy[2]);
  doc.text(isInsuranceInvoice ? 'INSURANCE POLICY COVERAGE & SETTLEMENT DETAILS' : 'FREIGHT SHIPPING FINANCIAL SETTLEMENT SUMMARY', 14, y);

  y += 5;

  if (isInsuranceInvoice) {
    doc.setFillColor(...emeraldGreen);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Insured Cargo Item', 18, y + 4.8);
    doc.text('Declared Value', 80, y + 4.8);
    doc.text('Coverage Amount', 120, y + 4.8);
    doc.text('Insurance Fee', 160, y + 4.8);

    y += 7;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderLight);
    doc.rect(14, y, 182, 9, 'F');
    doc.rect(14, y, 182, 9, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(freight.description || 'Insured Cargo', 18, y + 5.8);
    doc.text(`$${(freight.declaredValue || 0).toLocaleString()}`, 80, y + 5.8);
    doc.text(`$${(freight.declaredValue || 0).toLocaleString()}`, 120, y + 5.8);
    doc.text(`$${(freight.insuranceAmount || 0).toLocaleString()}`, 160, y + 5.8);
  } else {
    // Freight Shipping Invoice (PURE FREIGHT - ZERO STATUS / INSURANCE MENTIONS)
    doc.setFillColor(...primaryNavy);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Line Item Description', 18, y + 4.8);
    doc.text('Base Shipping Freight Fee ($)', 100, y + 4.8);
    doc.text('Fee Status', 160, y + 4.8);

    y += 7;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderLight);
    doc.rect(14, y, 182, 9, 'F');
    doc.rect(14, y, 182, 9, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text('Base Shipping Freight & Logistics Fee', 18, y + 5.8);
    doc.text(`$${(freight.shippingFee || 0).toLocaleString()}`, 100, y + 5.8);
    doc.text((freight.shippingFeeStatus || 'Paid').toUpperCase(), 160, y + 5.8);
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
