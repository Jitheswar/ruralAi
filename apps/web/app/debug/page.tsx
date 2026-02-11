'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function DebugPage() {
    const [info, setInfo] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState<string | null>(null);

    useEffect(() => {
        async function checkSystem() {
            try {
                const debugInfo: any = {
                    timestamp: new Date().toISOString(),
                };

                // 1. Check User Agent
                try {
                    debugInfo.userAgent = navigator.userAgent;
                } catch (e: any) {
                    debugInfo.userAgent = `Error: ${e.message}`;
                }

                // 2. Check Cookies
                try {
                    debugInfo.cookieEnabled = navigator.cookieEnabled;
                } catch (e: any) {
                    debugInfo.cookieEnabled = `Error: ${e.message}`;
                }

                // 3. Check LocalStorage Access
                try {
                    debugInfo.localStorageAccess = 'OK';
                    debugInfo.localStorageKeys = Object.keys(localStorage);
                    debugInfo.hasSupabaseKeyInStorage = Object.keys(localStorage).some(k => k.includes('supabase'));

                    // Test Write
                    try {
                        localStorage.setItem('debug_test', '1');
                        localStorage.removeItem('debug_test');
                        debugInfo.localStorageWrite = 'OK';
                    } catch (writeErr: any) {
                        debugInfo.localStorageWrite = `Failed: ${writeErr.message}`;
                    }

                } catch (e: any) {
                    debugInfo.localStorageAccess = `BLOCKED: ${e.message}`;
                    debugInfo.localStorageKeys = 'Inaccessible';
                }

                // 4. Check Supabase Client
                try {
                    debugInfo.supabaseClientInit = 'Attempting...';
                    const supabase = getSupabaseClient();
                    debugInfo.supabaseClientInit = 'Success';

                    // 5. Check Session
                    try {
                        const { data, error } = await supabase.auth.getSession();
                        debugInfo.supabaseSession = data.session ? 'Present' : 'Missing';
                        debugInfo.supabaseUser = data.session?.user?.email || 'None';
                        debugInfo.supabaseError = error ? error.message : 'None';
                    } catch (sessionErr: any) {
                        debugInfo.supabaseSession = `CRASH: ${sessionErr.message}`;
                    }

                } catch (clientErr: any) {
                    debugInfo.supabaseClientInit = `FAILED: ${clientErr.message}`;
                }

                setInfo(debugInfo);
            } catch (criticalErr: any) {
                setGlobalError(criticalErr.message);
            } finally {
                setLoading(false);
            }
        }

        checkSystem();
    }, []);

    if (globalError) {
        return (
            <div className="p-8 font-mono text-red-600">
                <h1 className="text-xl font-bold">CRITICAL ERROR</h1>
                <pre>{globalError}</pre>
            </div>
        );
    }

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Debug Information (Hardened)</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="space-y-4">
                    <pre className="bg-gray-100 p-4 rounded overflow-auto border border-gray-300">
                        {JSON.stringify(info, null, 2)}
                    </pre>

                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="font-bold text-yellow-800">Diagnostics Analysis:</p>
                        <ul className="list-disc pl-5 text-yellow-900 mt-2">
                            {info.localStorageAccess?.toString().includes('BLOCKED') && (
                                <li>🔴 <strong>LocalStorage is BLOCKED.</strong> This will prevent login from persisting. Check browser privacy settings.</li>
                            )}
                            {info.cookieEnabled?.toString().includes('false') && (
                                <li>🔴 <strong>Cookies are disabled.</strong> Supabase requires cookies for auth.</li>
                            )}
                            {info.supabaseClientInit?.toString().includes('FAILED') && (
                                <li>🔴 <strong>Supabase Client Failed.</strong> Likely missing env vars or blocked initialization.</li>
                            )}
                            {!info.localStorageAccess?.toString().includes('BLOCKED') && info.supabaseSession === 'Missing' && (
                                <li>🟠 <strong>Session Missing.</strong> LocalStorage works, but no session found. Try logging in again.</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
