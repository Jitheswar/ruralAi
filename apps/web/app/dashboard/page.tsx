'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import StatsCard from '@/components/StatsCard';
import {
  getAdminStats,
  getSahayakStats,
  getPatients,
  getPatientsByCreator,
  type Patient,
} from '@/lib/supabaseData';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { API_CONFIG } from '@rural-ai/shared';
import type { UserRole } from '@rural-ai/shared';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Users,
  UserCheck,
  Clock,
  FileCheck,
  FileText,
  HeartPulse,
  Pill,
  CalendarDays,
  Loader2,
  Stethoscope,
  ScanLine,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<ReturnType<typeof getSession>>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getSession());
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  const role: UserRole = user?.role || 'citizen';

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'sahayak') return <SahayakDashboard userId={user?.id || ''} />;
  return <CitizenDashboard userId={user?.id || ''} name={user?.name || ''} />;
}

// ---------- Admin Dashboard ----------

function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ totalPatients: 0, activeSahayaks: 0, pendingSync: 0, syncedRecords: 0 });
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, patients] = await Promise.all([getAdminStats(), getPatients()]);
        setStats(s);
        setRecentPatients(patients.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <TBScreeningBar />
      <BreastCancerScreeningBar />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">{t('nav.dashboard')}</h1>
        <p className="text-muted-foreground text-sm">Overview of system health and patient records.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title={t('patient.total')} value={stats.totalPatients} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-500/10" />
        <StatsCard title="Active Sahayaks" value={stats.activeSahayaks} icon={UserCheck} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-500/10" />
        <StatsCard title="Pending Sync" value={stats.pendingSync} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-500/10" />
        <StatsCard title="Synced Records" value={stats.syncedRecords} icon={FileCheck} iconColor="text-teal-600" iconBg="bg-teal-50 dark:bg-teal-500/10" />
      </div>

      <RecentPatientsList patients={recentPatients} />
    </div>
  );
}

// ---------- Sahayak Dashboard ----------

function SahayakDashboard({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ myPatients: 0, pendingSync: 0, syncedRecords: 0 });
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, patients] = await Promise.all([getSahayakStats(userId), getPatientsByCreator(userId)]);
        setStats(s);
        setRecentPatients(patients.slice(0, 5));
      } catch (err) {
        console.error('Failed to load sahayak dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <TBScreeningBar />
      <BreastCancerScreeningBar />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">{t('nav.dashboard')}</h1>
        <p className="text-muted-foreground text-sm">Manage your patients and data synchronization.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title={t('nav.myPatients')} value={stats.myPatients} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-500/10" />
        <StatsCard title="Pending Sync" value={stats.pendingSync} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-500/10" />
        <StatsCard title="Synced Records" value={stats.syncedRecords} icon={FileCheck} iconColor="text-teal-600" iconBg="bg-teal-50 dark:bg-teal-500/10" />
      </div>

      <RecentPatientsList patients={recentPatients} />
    </div>
  );
}

// ---------- Citizen Dashboard ----------

function CitizenDashboard({ userId, name }: { userId: string; name: string }) {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ totalLogs: 0, lastVisit: null as string | null, vitalsCount: 0, prescriptionCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) { setLoading(false); return; }

        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONFIG.BASE_URL;
        const res = await fetch(`${apiBase}/api/vitals/health-logs`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const logs: { id: string; log_type: string; created_at: string }[] = json.logs || [];
          setStats({
            totalLogs: logs.length,
            lastVisit: logs.length > 0 ? logs[0].created_at : null,
            vitalsCount: logs.filter((l) => l.log_type === 'vitals').length,
            prescriptionCount: logs.filter((l) => l.log_type === 'prescription').length,
          });
        }
      } catch (err) {
        console.error('Failed to load citizen dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <TBScreeningBar />
      <BreastCancerScreeningBar />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">{t('auth.welcomeBack')}, {name || 'User'}</h1>
        <p className="text-muted-foreground text-sm">Track your health records and vitals.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Health Logs" value={stats.totalLogs} icon={FileText} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-500/10" />
        <StatsCard title="Vitals Recorded" value={stats.vitalsCount} icon={HeartPulse} iconColor="text-rose-600" iconBg="bg-rose-50 dark:bg-rose-500/10" />
        <StatsCard title="Prescriptions" value={stats.prescriptionCount} icon={Pill} iconColor="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-500/10" />
        <StatsCard
          title="Last Visit"
          value={stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString() : 'None'}
          icon={CalendarDays}
          iconColor="text-teal-600"
          iconBg="bg-teal-50 dark:bg-teal-500/10"
        />
      </div>

      {stats.totalLogs === 0 && (
        <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No health records yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Your health logs will appear here once recorded by a Sahayak or through the mobile app.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------- TB Screening Bar ----------

function TBScreeningBar() {
  return (
    <a
      href="https://tb-pwa.digitalclinics.ai/login"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 p-1 shadow-md transition-all hover:shadow-lg hover:scale-[1.01] block"
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-center justify-between px-5 py-4 bg-transparent text-white">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight">TB Screening Assessment</p>
            <p className="text-sm text-rose-100/90">Click to start tuberculosis screening via external tool</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-rose-100 font-medium group-hover:text-white transition-colors">
          <span className="text-sm">Start Assessment</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </a>
  );
}

// ---------- Breast Cancer Screening Bar ----------

function BreastCancerScreeningBar() {
  return (
    <a
      href="https://brcai-radiology.digitalclinics.ai/login"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-600 p-1 shadow-md transition-all hover:shadow-lg hover:scale-[1.01] block"
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-center justify-between px-5 py-4 bg-transparent text-white">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight">Breast Cancer Screening</p>
            <p className="text-sm text-pink-100/90">Click to start AI-powered breast cancer radiology screening</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-pink-100 font-medium group-hover:text-white transition-colors">
          <span className="text-sm">Start Screening</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </a>
  );
}

// ---------- Shared Components ----------

function LoadingState() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
    </div>
  );
}

function RecentPatientsList({ patients }: { patients: Patient[] }) {
  if (patients.length === 0) {
    return (
      <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-8 text-center">
        <p className="text-muted-foreground text-sm">No patients added yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <h2 className="text-base font-semibold text-foreground">Recent Patients</h2>
      </div>
      <div className="divide-y divide-border">
        {patients.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.village || 'No village'} {p.district ? `· ${p.district}` : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${p.is_synced
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                }`}>
                {p.is_synced ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {p.is_synced ? 'Synced' : 'Pending'}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Added {new Date(p.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 bg-muted/30 border-t border-border text-center">
        <Link href="/dashboard/patients" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          View all patients
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
