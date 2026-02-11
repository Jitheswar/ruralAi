// Supabase configuration — reads from environment variables.
// Fallback values are only used in development when env vars are not set.

function getEnvVar(key: string, fallback: string): string {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key] as string;
  }
  return fallback;
}

// IMPORTANT: For production, always set these via environment variables.
// The fallback values below are for local development convenience only.
export const SUPABASE_URL = getEnvVar(
  'NEXT_PUBLIC_SUPABASE_URL',
  'https://smokqvbgscykedlunigv.supabase.co'
);

export const SUPABASE_ANON_KEY = getEnvVar(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb2txdmJnc2N5a2VkbHVuaWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzczOTQsImV4cCI6MjA4NjAxMzM5NH0.biIy5wIdQFlZXjJ19Hs1XNQTB7fnEwOebMHogRXnebw'
);
