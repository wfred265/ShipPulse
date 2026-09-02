import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

/**
 * Auto-detect user language preference from browser environment
 */
const detectDefaultLanguage = () => {
  // 1. Prioritize user's saved manual selection
  const saved = localStorage.getItem('shippulse_lang');
  if (saved === 'en' || saved === 'fr') {
    return saved;
  }

  // 2. Auto-detect browser preferred language (e.g. 'fr', 'fr-FR', 'fr-CA')
  try {
    const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    if (browserLang.toLowerCase().startsWith('fr')) {
      return 'fr';
    }
  } catch (e) {
    console.warn("Browser language detection fallback:", e);
  }

  // 3. Default to English
  return 'en';
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectDefaultLanguage);

  const setLang = (newLang) => {
    if (newLang === 'en' || newLang === 'fr') {
      setLangState(newLang);
      localStorage.setItem('shippulse_lang', newLang);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'fr' : 'en');
  };

  const t = (key) => {
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    // Fallback to EN if key missing in FR
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return key;
  };

  const currencySymbol = lang === 'fr' ? '€' : '$';

  const formatCurrency = (amount) => {
    const numericVal = Number(amount || 0);
    const formatted = numericVal.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US');
    return lang === 'fr' ? `${formatted} €` : `$${formatted}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, currencySymbol, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
