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

function mapToWebUser(user: User): WebUser | null {
  if (!user.email) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || '',
    role: (user.user_metadata?.role as UserRole) || 'citizen',
  };
}

export function getSession(): WebUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
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
    const webUser = mapToWebUser(data.user);
    if (webUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(webUser));
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
): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });

  if (error) {
    console.error('Register error:', error.message);
    return false;
  }

  return true;
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
    const webUser = mapToWebUser(data.user);
    if (webUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(webUser));
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

  const webUser = mapToWebUser(user);
  if (webUser) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(webUser));
      console.log('CheckAuth session refreshed in localStorage:', SESSION_KEY);
    } catch (e) {
      console.error('Failed to save CheckAuth session to localStorage:', e);
    }
  }
  return webUser;
}
