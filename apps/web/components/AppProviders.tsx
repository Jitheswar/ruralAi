'use client';

import type { ReactNode } from 'react';
import { SessionSync } from '@/components/SessionSync';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <SessionSync />
      {children}
    </LanguageProvider>
  );
}
