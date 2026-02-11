'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { getHealthLogsByUser, type HealthLog } from '@/lib/supabaseData';

const LOG_TYPE_CONFIG: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  vitals: { label: 'Vitals', icon: '❤️', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  symptoms: { label: 'Symptom Assessment', icon: '🩺', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  diagnosis: { label: 'Diagnosis', icon: '📋', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  prescription: { label: 'Prescription Scan', icon: '💊', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
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
    immediately: 'bg-red-100 text-red-800',
    within_24h: 'bg-orange-100 text-orange-800',
    within_week: 'bg-yellow-100 text-yellow-800',
    monitor: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-3">
      {/* Emergency alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3">
          <p className="text-red-800 font-bold text-sm">Emergency Alert</p>
          {alerts.map((a, i) => (
            <p key={i} className="text-red-700 text-sm mt-1">{a.message as string}</p>
          ))}
        </div>
      )}

      {/* Summary + urgency */}
      {summary && (
        <div className="flex items-start gap-2">
          <p className="text-gray-800 text-sm flex-1">{summary}</p>
          {urgency && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${URGENCY_COLORS[urgency] || 'bg-gray-100 text-gray-700'}`}>
              {urgency.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      )}

      {/* Symptoms reported */}
      {symptoms.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Symptoms reported</p>
          <div className="flex flex-wrap gap-1.5">
            {symptoms.map((s, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                {s.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Conditions identified */}
      {conditions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Possible conditions</p>
          <div className="space-y-1.5">
            {conditions.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  c.likelihood === 'high' ? 'bg-red-100 text-red-700' :
                  c.likelihood === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{c.likelihood}</span>
                <span className="text-sm text-gray-800">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended medicines */}
      {medicines.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Recommended medicines</p>
          <div className="space-y-1.5">
            {medicines.map((m, i) => (
              <div key={i} className="bg-green-50 rounded p-2">
                <p className="text-sm font-medium text-green-800">{m.generic_name}</p>
                <p className="text-xs text-green-600">{m.dosage} &middot; {m.frequency} &middot; {m.duration}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Home care */}
      {homeCare.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Home care advice</p>
          <ul className="space-y-1">
            {homeCare.map((tip, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-gray-600">
                <span className="text-green-500 mt-0.5">&#10003;</span>
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
        <p className="text-sm text-gray-600">Prescribed by: <span className="font-medium text-gray-800">{doctorName}</span></p>
      )}

      {medicines.length > 0 && (
        <div className="space-y-2">
          {medicines.map((m, i) => (
            <div key={i} className="bg-green-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.name}</p>
                  {m.generic_name && m.generic_name !== m.name && (
                    <p className="text-xs text-gray-500">Generic: {m.generic_name}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">{m.dosage} &middot; {m.frequency} &middot; {m.duration}</p>
                </div>
                {m.savings_percent > 0 && (
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">
                    Save {m.savings_percent.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalMarket != null && totalJA != null && totalMarket > totalJA && (
        <div className="bg-green-100 rounded-lg p-3 text-center">
          <p className="text-sm text-green-800">
            Total savings: <span className="font-bold">&#8377;{(totalMarket - totalJA).toFixed(0)}</span>
            <span className="text-green-600 text-xs ml-1">(&#8377;{totalMarket.toFixed(0)} → &#8377;{totalJA.toFixed(0)})</span>
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
        <div key={key} className="bg-red-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
          <p className="text-sm font-medium text-gray-900">{String(value)}</p>
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
          <span className="text-xs text-gray-500 capitalize min-w-[100px]">{key.replace(/_/g, ' ')}:</span>
          <span className="text-sm text-gray-800">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function HealthLogCard({ log }: { log: HealthLog }) {
  const config = LOG_TYPE_CONFIG[log.log_type] || {
    label: log.log_type, icon: '📝', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200',
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${config.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${config.bg} px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span>{config.icon}</span>
          <span className={`font-medium text-sm ${config.text}`}>{config.label}</span>
        </div>
        <span className="text-xs text-gray-500">
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
          <p className="text-gray-700 text-sm mb-3 font-medium">{log.notes}</p>
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
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const data = await getHealthLogsByUser(user.id);
        setLogs(data);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading health records...</div>
      </div>
    );
  }

  const filteredLogs = filter === 'all' ? logs : logs.filter((l) => l.log_type === filter);
  const logTypes = [...new Set(logs.map((l) => l.log_type))];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Health Records</h1>
      <p className="text-gray-500 text-sm mb-6">
        Your symptom assessments, prescription scans, and health data — all in one place.
      </p>

      {/* Stats summary */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            <p className="text-xs text-gray-500">Total Records</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{logs.filter((l) => l.log_type === 'symptoms').length}</p>
            <p className="text-xs text-gray-500">Assessments</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{logs.filter((l) => l.log_type === 'prescription').length}</p>
            <p className="text-xs text-gray-500">Prescriptions</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{logs.filter((l) => l.log_type === 'vitals').length}</p>
            <p className="text-xs text-gray-500">Vitals</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {logTypes.length > 1 && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({logs.length})
          </button>
          {logTypes.map((type) => {
            const config = LOG_TYPE_CONFIG[type] || { label: type, icon: '📝' };
            const count = logs.filter((l) => l.log_type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === type ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {config.icon} {config.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Records */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500 text-lg mb-2">No health records yet</p>
          <p className="text-gray-400 text-sm mb-6">
            Your health records will appear here automatically when you:
          </p>
          <div className="text-sm text-gray-500 space-y-2">
            <p>Use the <strong>Symptom Checker</strong> and save results</p>
            <p>Scan a <strong>Prescription</strong> and save to records</p>
            <p>Have a <strong>Sahayak</strong> record your vitals</p>
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
