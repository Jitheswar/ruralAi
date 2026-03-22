import type { AppLanguage } from './languages';

export type TranslationMap = Record<string, Record<AppLanguage, string>>;

/** Optional callback for missing-key telemetry. */
export type MissingKeyHandler = (key: string, language: AppLanguage) => void;

let _onMissingKey: MissingKeyHandler | null = null;
const _warnedKeys = new Set<string>();

/**
 * Register a handler invoked once per missing key (deduplicated).
 * Useful for logging to analytics in production.
 */
export function setMissingKeyHandler(handler: MissingKeyHandler | null) {
  _onMissingKey = handler;
}

/**
 * Look up a translated string: selected language → English → raw key.
 * Always returns a displayable string — never throws.
 */
export function translate(
  key: string,
  language: AppLanguage,
  translations: TranslationMap,
): string {
  const entry = translations[key];
  if (!entry) {
    const cacheKey = `${key}:${language}`;
    if (!_warnedKeys.has(cacheKey)) {
      _warnedKeys.add(cacheKey);
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        console.warn(`[i18n] missing key: "${key}" (${language})`);
      }
      _onMissingKey?.(key, language);
    }
    return key;
  }
  return entry[language] ?? entry.en ?? key;
}

/**
 * Create a translator bound to a specific translation map.
 */
export function createTranslator(translations: TranslationMap) {
  return (key: string, language: AppLanguage): string =>
    translate(key, language, translations);
}
