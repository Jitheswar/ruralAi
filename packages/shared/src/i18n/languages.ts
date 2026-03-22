export type AppLanguage = 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn';

export const SUPPORTED_LANGUAGES: readonly { code: AppLanguage; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
] as const;

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

const SPEECH_LOCALE_MAP: Record<AppLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
};

const INTL_LOCALE_MAP: Record<AppLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
};

const VALID_LANGUAGE_CODES = new Set<string>(SUPPORTED_LANGUAGES.map(l => l.code));

/** BCP-47 locale for Web Speech API / expo-speech */
export function toSpeechLocale(language: AppLanguage): string {
  return SPEECH_LOCALE_MAP[language] ?? SPEECH_LOCALE_MAP.en;
}

/** BCP-47 locale for Intl.DateTimeFormat / Intl.NumberFormat */
export function toIntlLocale(language: AppLanguage): string {
  return INTL_LOCALE_MAP[language] ?? INTL_LOCALE_MAP.en;
}

/** Short code sent to backend APIs (identity — backend uses the same codes) */
export function toBackendLanguage(language: AppLanguage): string {
  return language;
}

/** Validate and coerce a string to AppLanguage, defaulting to 'en' */
export function parseLanguage(value: string | null | undefined): AppLanguage {
  if (value && VALID_LANGUAGE_CODES.has(value)) {
    return value as AppLanguage;
  }
  // Handle BCP-47 tags like 'hi-IN' -> 'hi'
  if (value) {
    const short = value.split('-')[0].toLowerCase();
    if (VALID_LANGUAGE_CODES.has(short)) {
      return short as AppLanguage;
    }
  }
  return DEFAULT_LANGUAGE;
}
