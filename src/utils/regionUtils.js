/**
 * Helper utility to determine shipment region, bound language, currency, and flag.
 * 
 * Rules:
 * - USA region (tracking code ending in U, e.g. SP-67347U):
 *   - Region: 'USA'
 *   - Language: 'en' (English)
 *   - Currency: '$' (USD)
 *   - Flag: '🇺🇸'
 * 
 * - EUROPE region (tracking code ending in E, e.g. SP-66390E):
 *   - Region: 'EUROPE'
 *   - Language: 'fr' (French)
 *   - Currency: '€' (EUR)
 *   - Flag: '🇪🇺'
 */
export function getShipmentRegionConfig(shipment) {
  if (!shipment) {
    return {
      region: 'USA',
      lang: 'en',
      currencySymbol: '$',
      flag: '🇺🇸',
      name: 'USA',
      codeSuffix: 'U',
      formatCurrency: (amount) => `$${Number(amount || 0).toLocaleString('en-US')}`
    };
  }

  const id = shipment.id || '';
  const rawRegion = (shipment.region || '').toUpperCase();

  const isEurope = rawRegion === 'EUROPE' || id.endsWith('E') || id.includes('EUR');

  if (isEurope) {
    return {
      region: 'EUROPE',
      lang: 'fr',
      currencySymbol: '€',
      flag: '🇪🇺',
      name: 'EUROPE',
      codeSuffix: 'E',
      formatCurrency: (amount) => `${Number(amount || 0).toLocaleString('fr-FR')} €`
    };
  }

  return {
    region: 'USA',
    lang: 'en',
    currencySymbol: '$',
    flag: '🇺🇸',
    name: 'USA',
    codeSuffix: 'U',
    formatCurrency: (amount) => `$${Number(amount || 0).toLocaleString('en-US')}`
  };
}
