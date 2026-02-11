'use client';

import { useEffect } from 'react';
import { checkAuth } from '@/lib/auth';
import { SESSION_KEY } from '@rural-ai/shared';

export function SessionSync() {
    useEffect(() => {
        async function syncSession() {
            // Check if we have a session in localStorage
            const localSession = localStorage.getItem(SESSION_KEY);

            if (!localSession) {
                console.log('SessionSync: No local session found, checking Supabase...');
                try {
                    // Attempt to restore session from Supabase auth state
                    const user = await checkAuth();
                    if (user) {
                        console.log('SessionSync: Session restored from Supabase!');
                    } else {
                        console.log('SessionSync: No Supabase session found either.');
                    }
                } catch (err) {
                    console.error('SessionSync: Failed to sync session:', err);
                }
            } else {
                // Optional: validating the session could happen here
                // console.log('SessionSync: Local session exists.');
            }
        }

        syncSession();
    }, []);

    return null; // This component renders nothing
}
