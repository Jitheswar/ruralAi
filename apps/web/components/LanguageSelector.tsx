'use client';

import { SUPPORTED_LANGUAGES } from '@rural-ai/shared';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as typeof language)}
        className="bg-secondary text-foreground text-sm rounded-lg px-2 py-1.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
