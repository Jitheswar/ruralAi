'use client';

import { useEffect, useState } from 'react';
import { getSahayaks, updateSahayakStatus, type SahayakUser } from '@/lib/supabaseData';
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type DisplayStatus = 'pending' | 'verified' | 'active' | 'suspended';

function getDisplayStatus(s: SahayakUser): DisplayStatus {
  if (s.kyc_status === 'pending') return 'pending';
  if (s.kyc_status === 'verified' && !s.is_verified) return 'verified';
  if (s.is_verified && s.kyc_status !== 'failed') return 'active';
  return 'suspended';
}

const STATUS_CONFIG: Record<DisplayStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400' },
  verified: { label: 'Verified', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400' },
  active: { label: 'Active', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400' },
  suspended: { label: 'Suspended', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400' },
};

export default function SahayakPage() {
  const { t } = useLanguage();
  const [sahayaks, setSahayaks] = useState<SahayakUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getSahayaks();
      setSahayaks(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleStatusChange(id: string, newStatus: DisplayStatus) {
    const isVerified = newStatus === 'active';
    const kycStatus = newStatus === 'pending' ? 'pending'
      : newStatus === 'suspended' ? 'failed'
      : 'verified';

    const success = await updateSahayakStatus(id, isVerified, kycStatus);
    if (success) {
      setSahayaks((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, is_verified: isVerified, kyc_status: kycStatus } : s
        )
      );
    }
  }

  const stats = {
    total: sahayaks.length,
    active: sahayaks.filter((s) => getDisplayStatus(s) === 'active').length,
    pending: sahayaks.filter((s) => getDisplayStatus(s) === 'pending').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('sahayak.management')}</h1>
        <span className="text-sm text-muted-foreground">{stats.total} total</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('sahayak.totalSahayaks')}</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <p className="text-sm text-muted-foreground">{t('sahayak.active')}</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-sm text-muted-foreground">{t('sahayak.pendingApproval')}</p>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
        </div>
      </div>

      {sahayaks.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium text-lg mb-1">{t('sahayak.noSahayaks')}</p>
          <p className="text-muted-foreground text-sm">Sahayaks will appear here once they register with the sahayak role.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">{t('sahayak.name')}</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">{t('auth.email')}</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">{t('sahayak.status')}</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">{t('sahayak.joined')}</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">{t('sahayak.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sahayaks.map((s) => {
                  const status = getDisplayStatus(s);
                  const statusConfig = STATUS_CONFIG[status];
                  return (
                    <tr key={s.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-foreground text-sm">{s.name || '—'}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.email || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          {status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(s.id, 'verified')}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3" /> {t('sahayak.approve')}
                              </button>
                              <button
                                onClick={() => handleStatusChange(s.id, 'suspended')}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                              >
                                <XCircle className="w-3 h-3" /> {t('sahayak.reject')}
                              </button>
                            </>
                          )}
                          {status === 'verified' && (
                            <button
                              onClick={() => handleStatusChange(s.id, 'active')}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              <Shield className="w-3 h-3" /> {t('sahayak.activate')}
                            </button>
                          )}
                          {status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(s.id, 'suspended')}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                            >
                              <XCircle className="w-3 h-3" /> {t('sahayak.suspend')}
                            </button>
                          )}
                          {status === 'suspended' && (
                            <button
                              onClick={() => handleStatusChange(s.id, 'active')}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" /> {t('sahayak.reactivate')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
