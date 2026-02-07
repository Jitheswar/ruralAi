import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { AuthContextType, AuthUser } from '@rural-ai/shared';
import { MOCK_OTP, SESSION_KEY } from '@rural-ai/shared';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const stored = await SecureStore.getItemAsync(SESSION_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendOtp(phone: string): Promise<boolean> {
    // Stub: always succeeds. In production, calls supabase.auth.signInWithOtp()
    console.log(`[STUB] OTP sent to ${phone}`);
    return true;
  }

  async function verifyOtp(phone: string, otp: string): Promise<boolean> {
    // Stub: accepts MOCK_OTP. In production, calls supabase.auth.verifyOtp()
    if (otp === MOCK_OTP) {
      const mockUser: AuthUser = {
        id: `user_${phone.slice(-4)}`,
        phone,
        name: '',
        role: 'citizen',
        isVerified: true,
      };
      setUser(mockUser);
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(mockUser));
      return true;
    }
    return false;
  }

  async function logout(): Promise<void> {
    setUser(null);
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
