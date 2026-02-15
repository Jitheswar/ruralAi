'use client';

import { getSupabaseClient } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import { SESSION_KEY } from '@rural-ai/shared';
import type { UserRole } from '@rural-ai/shared';

export interface WebUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface RegisterResult {
  success: boolean;
  requiresOtp: boolean;
  message?: string;
  user?: WebUser | null;
}

function normalizeRole(role: unknown): UserRole {
  if (role === 'admin' || role === 'sahayak' || role === 'citizen') {
    return role;
  }
  return 'citizen';
}

function mapToWebUser(user: User, roleOverride?: UserRole): WebUser | null {
  if (!user.email) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || '',
    role: roleOverride || normalizeRole(user.user_metadata?.role),
  };
}

export function getSession(): WebUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      role: normalizeRole(parsed?.role),
    };
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

async function getAuthoritativeRole(userId: string, fallbackRole: UserRole): Promise<UserRole> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Role lookup error:', error.message);
    return fallbackRole;
  }

  return normalizeRole(data?.role ?? fallbackRole);
}

function persistSession(webUser: WebUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(webUser));
}

export async function login(email: string, password: string): Promise<WebUser | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    return null;
  }

  if (data.user) {
    const resolvedRole = await getAuthoritativeRole(
      data.user.id,
      normalizeRole(data.user.user_metadata?.role)
    );
    const webUser = mapToWebUser(data.user, resolvedRole);
    if (webUser) {
      persistSession(webUser);
    }
    return webUser;
  }

  return null;
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<RegisterResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });

  if (error) {
    console.error('Register error:', error.message);
    return {
      success: false,
      requiresOtp: false,
      message: error.message,
      user: null,
    };
  }

  if (!data.user) {
    return {
      success: false,
      requiresOtp: false,
      message: 'Sign up did not return a user.',
      user: null,
    };
  }

  // Session present => account is already active (OTP/email confirmation not needed).
  if (data.session) {
    const resolvedRole = await getAuthoritativeRole(data.user.id, role);
    const webUser = mapToWebUser(data.user, resolvedRole);
    if (webUser) persistSession(webUser);
    return {
      success: true,
      requiresOtp: false,
      user: webUser,
    };
  }

  return {
    success: true,
    requiresOtp: true,
    user: null,
  };
}

export async function verifyOtp(email: string, otp: string): Promise<WebUser | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'signup',
  });

  if (error) {
    console.error('OTP verify error:', error.message);
    return null;
  }

  if (data.user) {
    const resolvedRole = await getAuthoritativeRole(
      data.user.id,
      normalizeRole(data.user.user_metadata?.role)
    );
    const webUser = mapToWebUser(data.user, resolvedRole);
    if (webUser) {
      persistSession(webUser);
    }
    return webUser;
  }

  return null;
}

export async function logout(): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
  localStorage.removeItem(SESSION_KEY);
}

export async function checkAuth(): Promise<WebUser | null> {
  const supabase = getSupabaseClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }

  const resolvedRole = await getAuthoritativeRole(
    user.id,
    normalizeRole(user.user_metadata?.role)
  );
  const webUser = mapToWebUser(user, resolvedRole);
  if (webUser) {
    try {
      persistSession(webUser);
      // Session refreshed from Supabase
    } catch (e) {
      console.error('Failed to save CheckAuth session to localStorage:', e);
    }
  }
  return webUser;
}
