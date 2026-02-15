'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout, getSession } from '@/lib/auth';
import type { UserRole } from '@rural-ai/shared';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  AlertTriangle,
  HeartPulse,
  Stethoscope,
  ScanLine,
  Pill,
  MapPin,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

const portalLabel: Record<UserRole, string> = {
  admin: 'Admin Portal',
  sahayak: 'Sahayak Portal',
  citizen: 'Health Portal',
};

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { href: '/dashboard/patients', labelKey: 'nav.patients', icon: Users },
    { href: '/dashboard/sahayak', labelKey: 'nav.sahayak', icon: UserCheck },
    { href: '/dashboard/outbreaks', labelKey: 'nav.outbreaks', icon: AlertTriangle },
  ],
  sahayak: [
    { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { href: '/dashboard/my-patients', labelKey: 'nav.myPatients', icon: Users },
    { href: '/dashboard/outbreaks', labelKey: 'nav.outbreaks', icon: AlertTriangle },
  ],
  citizen: [
    { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { href: '/dashboard/my-health', labelKey: 'nav.myHealth', icon: HeartPulse },
    { href: '/dashboard/symptom-checker', labelKey: 'nav.symptomChecker', icon: Stethoscope },
    { href: '/dashboard/prescription-scanner', labelKey: 'nav.rxScanner', icon: ScanLine },
    { href: '/dashboard/medicine-search', labelKey: 'nav.medicineSearch', icon: Pill },
    { href: '/dashboard/nearby', labelKey: 'nav.nearbyHelp', icon: MapPin },
    { href: '/dashboard/outbreaks', labelKey: 'nav.outbreaks', icon: AlertTriangle },
  ],
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getSession();
  const { t } = useLanguage();
  const role: UserRole = user?.role || 'citizen';
  const navItems = navByRole[role];

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border flex flex-col
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight">Rural Health AI</h1>
                <p className="text-[11px] text-muted-foreground font-medium">{portalLabel[role]}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                  >
                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          {user && (
            <div className="px-3 py-2.5 mb-2 rounded-lg bg-secondary/50">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {role}
              </p>
            </div>
          )}
          <div className="px-3 py-2 mb-2">
            <LanguageSelector />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('auth.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
