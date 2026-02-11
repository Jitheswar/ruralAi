'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout, getSession } from '@/lib/auth';
import type { UserRole } from '@rural-ai/shared';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/patients', label: 'Patients', icon: '👥' },
    { href: '/dashboard/sahayak', label: 'Sahayak', icon: '👩‍⚕️' },
  ],
  sahayak: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/my-patients', label: 'My Patients', icon: '👥' },
  ],
  citizen: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/my-health', label: 'My Health', icon: '💊' },
    { href: '/dashboard/symptom-checker', label: 'Symptom Checker', icon: '🩺' },
    { href: '/dashboard/prescription-scanner', label: 'Rx Scanner', icon: '📷' },
    { href: '/dashboard/medicine-search', label: 'Medicine Search', icon: '💊' },
    { href: '/dashboard/nearby', label: 'Nearby Help', icon: '📍' },
  ],
};

const portalLabel: Record<UserRole, string> = {
  admin: 'Admin Portal',
  sahayak: 'Sahayak Portal',
  citizen: 'Health Portal',
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getSession();
  const role: UserRole = user?.role || 'citizen';
  const navItems = navByRole[role];

  function handleLogout() {
    logout();
    router.replace('/');
  }

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Rural Health AI</h1>
        <p className="text-xs text-gray-400 mt-1">{portalLabel[role]}</p>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        {user && (
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-white truncate">{user.name || user.email}</p>
            <p className="text-xs text-gray-400 capitalize">{role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
