import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type AppLanguage,
  DEFAULT_LANGUAGE,
  parseLanguage,
  translate,
  UI_TRANSLATIONS,
  DOMAIN_TRANSLATIONS,
} from '@rural-ai/shared';

const STORAGE_KEY = 'rural_ai_language';

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;
  td: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        setLanguageState(parseLanguage(stored));
      }
    });
  }, []);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: string) => translate(key, language, UI_TRANSLATIONS),
    [language],
  );

  const td = useCallback(
    (key: string) => translate(key, language, DOMAIN_TRANSLATIONS),
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, td }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
