'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(storedLanguage);
    loadTranslations(storedLanguage);
  }, []);

  const loadTranslations = async (lang) => {
    try {
      const translations = await import(`@/translations/${lang}.json`);
      setTranslations(translations.default);
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English if translation file not found
      if (lang !== 'en') {
        const enTranslations = await import('@/translations/en.json');
        setTranslations(enTranslations.default);
      }
    }
  };

  const changeLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    await loadTranslations(newLanguage);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
} 