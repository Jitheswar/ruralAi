'use client';

import { useEffect } from 'react';
import { checkAuth } from '@/lib/auth';

export function SessionSync() {
    useEffect(() => {
        const syncSession = () => checkAuth().catch((err) => {
            console.error('SessionSync: Failed to sync session:', err);
        });

        // Always validate the session with Supabase on mount.
        syncSession();

        // Periodically refresh session and role metadata.
        const intervalId = window.setInterval(syncSession, 5 * 60 * 1000);
        return () => window.clearInterval(intervalId);
    }, []);

    return null;
}
