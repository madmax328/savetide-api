'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type Locale, type TranslationKey, translations, detectLocale } from './i18n';

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'fr',
  setLocale: () => {},
  t: (key) => key,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Default to 'fr' so bots/crawlers always see content (no hidden state)
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('savetide-locale') as Locale | null;
    if (saved === 'fr' || saved === 'en') {
      setLocaleState(saved);
    } else {
      setLocaleState(detectLocale());
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('savetide-locale', l);
    document.documentElement.lang = l;
  }, []);

  const tFn = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[locale] || entry['en'];
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: tFn }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
