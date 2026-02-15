'use client';

import type { Patient } from '@/lib/supabaseData';
import { User, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PatientTableProps {
  patients: Patient[];
}

export default function PatientTable({ patients }: PatientTableProps) {
  const { t } = useLanguage();

  if (patients.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium text-lg mb-1">{t('patient.noPatients')}</p>
        <p className="text-muted-foreground text-sm">Patients will appear here once added.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">{t('patient.name')}</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">{t('patient.age')}</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">{t('patient.gender')}</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">{t('patient.village')}</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">ABHA</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.phone || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{p.age ?? '—'}</td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground capitalize">{p.gender || '—'}</td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{p.village || '—'}</td>
                <td className="px-5 py-3.5 text-sm">
                  {p.abha_id ? (
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Linked
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Not linked</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.is_synced
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                  }`}>
                    {p.is_synced ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {p.is_synced ? 'Synced' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
