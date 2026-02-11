import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL as SHARED_URL, SUPABASE_ANON_KEY as SHARED_KEY } from '@rural-ai/shared';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || SHARED_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SHARED_KEY;

// Browser client for client components
export function createClient() {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Singleton instance for convenience
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
    if (!browserClient) {
        browserClient = createClient();
    }
    return browserClient;
}
