'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, checkAuth } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function verify() {
      // Quick check: if no localStorage session, redirect immediately
      const local = getSession();
      if (!local) {
        router.replace('/login');
        return;
      }

      // Verify the session is still valid with Supabase
      const user = await checkAuth();
      if (!user) {
        router.replace('/login');
        return;
      }

      setVerified(true);
    }
    verify();
  }, [router]);

  if (!verified) return null;

  return <>{children}</>;
}
