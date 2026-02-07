'use client';

const SESSION_KEY = 'rural_ai_admin_session';
const MOCK_PASSWORD = 'admin123';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export function getSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function login(email: string, password: string): AdminUser | null {
  // Stub: accepts any email with MOCK_PASSWORD
  if (password === MOCK_PASSWORD && email.includes('@')) {
    const user: AdminUser = {
      id: 'admin_001',
      email,
      name: 'Dr. Admin',
      role: 'admin',
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
