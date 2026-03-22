// Supabase configuration — reads from environment variables.
// Returns empty strings if env vars are not set (avoids throwing at import time
// when the barrel index is loaded by consumers that don't need Supabase config).

function getEnvVar(key: string): string {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key] as string;
  }
  return '';
}

export const SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');

export const SUPABASE_ANON_KEY = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
