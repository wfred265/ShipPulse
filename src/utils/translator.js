/**
 * ShipPulse Multi-Language Translation Engine
 * Auto-translates messages between Support Agents and Clients in real-time.
 */

const translationCache = new Map();

/**
 * Detect language of a given text snippet (fallback to provided default)
 */
export function detectLanguage(text, defaultLang = 'fr') {
  if (!text || typeof text !== 'string') return defaultLang;
  const lower = text.toLowerCase();

  const frWords = ['bonjour', 'salut', 'merci', 'colis', 'expédition', 'expedition', 'votre', 'notre', 'dossier', 'suivi', 'veuillez', 'adresse', 'livraison', 'est', 'sont'];
  const enWords = ['hello', 'hi', 'thank', 'thanks', 'package', 'parcel', 'shipment', 'tracking', 'your', 'our', 'please', 'address', 'delivery', 'is', 'are'];

  let frScore = 0;
  let enScore = 0;

  for (const word of frWords) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) frScore++;
  }
  for (const word of enWords) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) enScore++;
  }

  if (frScore > enScore) return 'fr';
  if (enScore > frScore) return 'en';
  return defaultLang;
}

/**
 * Translate a single piece of text from one language to another
 */
export async function translateText(text, fromLang = 'fr', toLang = 'en') {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed) return text;

  const normalizedFrom = fromLang ? fromLang.toLowerCase().slice(0, 2) : 'fr';
  const normalizedTo = toLang ? toLang.toLowerCase().slice(0, 2) : 'en';

  if (normalizedFrom === normalizedTo) {
    return text;
  }

  const cacheKey = `${normalizedFrom}_${normalizedTo}_${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const uri = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${normalizedFrom}|${normalizedTo}`;
    const res = await fetch(uri, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        const translated = data.responseData.translatedText;
        // Verify it didn't return an error message
        if (!translated.toUpperCase().startsWith('MYMEMORY WARNING') && !translated.toUpperCase().startsWith('QUERY LENGTH LIMIT')) {
          translationCache.set(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('[Translator] Live translation timed out or network error:', err);
  }

  // If translation fails or times out, return original text safely
  return text;
}
