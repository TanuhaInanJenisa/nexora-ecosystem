import React, { createContext, useContext, useState, ReactNode } from 'react';
import { dictionary } from '@nexora/shared';

export type SupportedLocale = 'en' | 'bn';

interface LocalizationContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  toggleLocale: () => void;
  t: typeof dictionary.en;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>('en');

  const toggleLocale = () => {
    setLocale((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = (dictionary[locale] || dictionary.en) as typeof dictionary.en;

  return (
    <LocalizationContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}

