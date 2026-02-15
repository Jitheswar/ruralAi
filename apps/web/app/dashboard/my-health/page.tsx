'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { API_CONFIG } from '@rural-ai/shared';
import {
  HeartPulse,
  Stethoscope,
  FileText,
  Pill,
  Loader2,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface HealthLog {
  id: string;
  patient_id: string;
  recorded_by: string;
  log_type: string;
  data: Record<string, unknown>;
  notes: string | null;
  created_at: string;
}

const LOG_TYPE_CONFIG: Record<string, { label: string; icon: LucideIcon; bg: string; text: string; border: string }> = {
  vitals: { label: 'Vitals', icon: HeartPulse, bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
  symptoms: { label: 'Symptom Assessment', icon: Stethoscope, bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
  diagnosis: { label: 'Diagnosis', icon: FileText, bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/20' },
  prescription: { label: 'Prescription Scan', icon: Pill, bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-500/20' },
};

function SymptomLogCard({ log }: { log: HealthLog }) {
  const data = log.data as Record<string, unknown>;
  const input = data?.input as Record<string, unknown> | undefined;
  const analysis = data?.analysis as Record<string, unknown> | undefined;
  const alerts = (data?.emergency_alerts || []) as Record<string, unknown>[];

  const symptoms = (input?.symptoms || []) as string[];
  const conditions = (analysis?.possible_conditions || []) as { name: string; likelihood: string; description: string }[];
  const medicines = (analysis?.recommended_medicines || []) as { generic_name: string; dosage: string; frequency: string; duration: string; reason: string }[];
  const urgency = analysis?.see_doctor_urgency as string | undefined;
  const summary = analysis?.summary as string | undefined;
  const homeCare = (analysis?.home_care || []) as string[];

  const URGENCY_COLORS: Record<string, string> = {
    immediately: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300',
    within_24h: 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300',
    within_week: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300',
    monitor: 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300',
  };

  return (
    <div className="space-y-3">
      {/* Emergency alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 rounded-lg p-3">
          <p className="text-red-800 dark:text-red-300 font-bold text-sm">Emergency Alert</p>
          {alerts.map((a, i) => (
            <p key={i} className="text-red-700 dark:text-red-400 text-sm mt-1">{a.message as string}</p>
          ))}
        </div>
      )}

      {/* Summary + urgency */}
      {summary && (
        <div className="flex items-start gap-2">
          <p className="text-foreground text-sm flex-1">{summary}</p>
          {urgency && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${URGENCY_COLORS[urgency] || 'bg-muted text-muted-foreground'}`}>
              {urgency.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      )}

      {/* Symptoms reported */}
      {symptoms.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Symptoms reported</p>
          <div className="flex flex-wrap gap-1.5">
            {symptoms.map((s, i) => (
              <span key={i} className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded text-xs">
                {s.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Conditions identified */}
      {conditions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Possible conditions</p>
          <div className="space-y-1.5">
            {conditions.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  c.likelihood === 'high' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                  c.likelihood === 'medium' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                  'bg-muted text-muted-foreground'
                }`}>{c.likelihood}</span>
                <span className="text-sm text-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended medicines */}
      {medicines.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Recommended medicines</p>
          <div className="space-y-1.5">
            {medicines.map((m, i) => (
              <div key={i} className="bg-green-50 dark:bg-green-500/10 rounded p-2">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">{m.generic_name}</p>
                <p className="text-xs text-green-600 dark:text-green-400">{m.dosage} &middot; {m.frequency} &middot; {m.duration}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Home care */}
      {homeCare.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Home care advice</p>
          <ul className="space-y-1">
            {homeCare.map((tip, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PrescriptionLogCard({ log }: { log: HealthLog }) {
  const data = log.data as Record<string, unknown>;
  const medicines = (data?.medicines || []) as {
    name: string; generic_name?: string; dosage: string;
    frequency: string; duration: string; market_price: number;
    jan_aushadhi_price: number; savings_percent: number;
  }[];
  const doctorName = data?.doctor_name as string | undefined;
  const totalMarket = data?.total_market_price as number | undefined;
  const totalJA = data?.total_jan_aushadhi_price as number | undefined;

  return (
    <div className="space-y-3">
      {doctorName && (
        <p className="text-sm text-muted-foreground">Prescribed by: <span className="font-medium text-foreground">{doctorName}</span></p>
      )}

      {medicines.length > 0 && (
        <div className="space-y-2">
          {medicines.map((m, i) => (
            <div key={i} className="bg-green-50 dark:bg-green-500/10 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  {m.generic_name && m.generic_name !== m.name && (
                    <p className="text-xs text-muted-foreground">Generic: {m.generic_name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{m.dosage} &middot; {m.frequency} &middot; {m.duration}</p>
                </div>
                {m.savings_percent > 0 && (
                  <span className="text-xs bg-green-200 dark:bg-green-500/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                    Save {m.savings_percent.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalMarket != null && totalJA != null && totalMarket > totalJA && (
        <div className="bg-green-100 dark:bg-green-500/20 rounded-lg p-3 text-center">
          <p className="text-sm text-green-800 dark:text-green-300">
            Total savings: <span className="font-bold">&#8377;{(totalMarket - totalJA).toFixed(0)}</span>
            <span className="text-green-600 dark:text-green-400 text-xs ml-1">(&#8377;{totalMarket.toFixed(0)} → &#8377;{totalJA.toFixed(0)})</span>
          </p>
        </div>
      )}
    </div>
  );
}

function VitalsLogCard({ log }: { log: HealthLog }) {
  const data = log.data as Record<string, unknown>;
  const vitals = Object.entries(data).filter(([key]) => !['input', 'analysis', 'emergency_alerts'].includes(key));

  return (
    <div className="grid grid-cols-2 gap-3">
      {vitals.map(([key, value]) => (
        <div key={key} className="bg-red-50 dark:bg-red-500/10 rounded-lg p-3">
          <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
          <p className="text-sm font-medium text-foreground">{String(value)}</p>
        </div>
      ))}
    </div>
  );
}

function GenericLogCard({ log }: { log: HealthLog }) {
  const data = log.data as Record<string, unknown>;
  const entries = Object.entries(data);

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-3">
          <span className="text-xs text-muted-foreground capitalize min-w-[100px]">{key.replace(/_/g, ' ')}:</span>
          <span className="text-sm text-foreground">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function HealthLogCard({ log }: { log: HealthLog }) {
  const config = LOG_TYPE_CONFIG[log.log_type] || {
    label: log.log_type, icon: FileText, bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border',
  };
  const Icon = config.icon;

  return (
    <div className={`bg-card rounded-xl shadow-sm border ${config.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${config.bg} px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.text}`} />
          <span className={`font-medium text-sm ${config.text}`}>{config.label}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(log.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })} at {new Date(log.created_at).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        {log.notes && (
          <p className="text-foreground/80 text-sm mb-3 font-medium">{log.notes}</p>
        )}

        {log.log_type === 'symptoms' && <SymptomLogCard log={log} />}
        {log.log_type === 'prescription' && <PrescriptionLogCard log={log} />}
        {log.log_type === 'vitals' && <VitalsLogCard log={log} />}
        {!['symptoms', 'prescription', 'vitals'].includes(log.log_type) && <GenericLogCard log={log} />}
      </div>
    </div>
  );
}

export default function MyHealthPage() {
  const user = getSession();
  const { t } = useLanguage();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

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
          setLogs(json.logs || []);
        }
      } catch (err) {
        console.error('Failed to fetch health logs:', err);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">{t('health.loadingRecords')}</p>
      </div>
    );
  }

  const filteredLogs = filter === 'all' ? logs : logs.filter((l) => l.log_type === filter);
  const logTypes = [...new Set(logs.map((l) => l.log_type))];

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">{t('health.myRecords')}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {t('health.recordsDescription')}
      </p>

      {/* Stats summary */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{logs.length}</p>
            <p className="text-xs text-muted-foreground">{t('health.totalRecords')}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{logs.filter((l) => l.log_type === 'symptoms').length}</p>
            <p className="text-xs text-muted-foreground">{t('health.assessments')}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{logs.filter((l) => l.log_type === 'prescription').length}</p>
            <p className="text-xs text-muted-foreground">{t('health.prescriptions')}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{logs.filter((l) => l.log_type === 'vitals').length}</p>
            <p className="text-xs text-muted-foreground">{t('patient.vitals')}</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {logTypes.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            All ({logs.length})
          </button>
          {logTypes.map((type) => {
            const config = LOG_TYPE_CONFIG[type] || { label: type, icon: FileText };
            const TypeIcon = config.icon;
            const count = logs.filter((l) => l.log_type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === type ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
                }`}
              >
                <TypeIcon className="w-3.5 h-3.5" />
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Records */}
      {filteredLogs.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium text-lg mb-2">{t('health.noRecords')}</p>
          <p className="text-muted-foreground text-sm mb-6">
            Your health records will appear here automatically when you:
          </p>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Use the <strong className="text-foreground">Symptom Checker</strong> and save results</p>
            <p>Scan a <strong className="text-foreground">Prescription</strong> and save to records</p>
            <p>Have a <strong className="text-foreground">Sahayak</strong> record your vitals</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <HealthLogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
