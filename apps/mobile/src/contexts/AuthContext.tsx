import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabaseClient';
import type { AuthContextType, AuthUser, UserRole } from '@rural-ai/shared';
import { SESSION_KEY } from '@rural-ai/shared';
import type { Session, User } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Supabase user to our AuthUser type
function mapSupabaseUser(user: User | null): AuthUser | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || '',
    role: (user.user_metadata?.role as UserRole) || 'citizen',
    isVerified: !!user.email_confirmed_at,
    abhaId: user.user_metadata?.abha_id,
  };
}

// Fetch authoritative role from public.users table (server-side truth)
async function getAuthoritativeRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    if (!error && data?.role) {
      return data.role as UserRole;
    }
  } catch (e) {
    console.warn('Failed to fetch authoritative role, using metadata fallback:', e);
  }
  return 'citizen';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        const mappedUser = mapSupabaseUser(session?.user ?? null);
        // Validate role from DB to prevent spoofing via user_metadata
        if (mappedUser) {
          mappedUser.role = await getAuthoritativeRole(mappedUser.id);
        }
        setUser(mappedUser);

        // Cache user data for offline access
        if (mappedUser) {
          await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(mappedUser));
        } else {
          await SecureStore.deleteItemAsync(SESSION_KEY);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkSession() {
    try {
      // First try to get session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        // Validate role from DB to prevent spoofing via user_metadata
        if (mappedUser) {
          mappedUser.role = await getAuthoritativeRole(mappedUser.id);
        }
        setUser(mappedUser);
      } else {
        // Fallback to cached session for offline access
        const cached = await SecureStore.getItemAsync(SESSION_KEY);
        if (cached) {
          setUser(JSON.parse(cached));
        }
      }
    } catch (e) {
      console.warn('Failed to check session:', e);
      // Try offline cache
      try {
        const cached = await SecureStore.getItemAsync(SESSION_KEY);
        if (cached) {
          setUser(JSON.parse(cached));
        }
      } catch (cacheError) {
        console.warn('Failed to load cached session:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.user) {
        const mappedUser = mapSupabaseUser(data.user);
        setUser(mappedUser);
        if (mappedUser) {
          await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(mappedUser));
        }
        return true;
      }

      return false;
    } catch (e) {
      console.error('Login exception:', e);
      return false;
    }
  }

  async function signUp(email: string, password: string, name: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
        },
      });

      if (error) {
        console.error('Sign up error:', error.message);
        return false;
      }

      console.log('Verification email sent to:', email);
      return true;
    } catch (e) {
      console.error('Sign up exception:', e);
      return false;
    }
  }

  async function verifyOtp(email: string, otp: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });

      if (error) {
        console.error('OTP verify error:', error.message);
        return false;
      }

      if (data.user) {
        const mappedUser = mapSupabaseUser(data.user);
        setUser(mappedUser);

        // Cache for offline
        if (mappedUser) {
          await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(mappedUser));
        }

        return true;
      }

      return false;
    } catch (e) {
      console.error('OTP verify exception:', e);
      return false;
    }
  }

  async function completeProfile(password: string, name: string, role: UserRole): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
        data: { name, role },
      });

      if (error) {
        console.error('Complete profile error:', error.message);
        return false;
      }

      if (data.user) {
        const mappedUser = mapSupabaseUser(data.user);
        setUser(mappedUser);
        if (mappedUser) {
          await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(mappedUser));
        }
        return true;
      }

      return false;
    } catch (e) {
      console.error('Complete profile exception:', e);
      return false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setUser(null);
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signUp,
        verifyOtp,
        completeProfile,
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
