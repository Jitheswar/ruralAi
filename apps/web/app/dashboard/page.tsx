'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import StatsCard from '@/components/StatsCard';
import {
  getAdminStats,
  getSahayakStats,
  getCitizenStats,
  getPatients,
  getPatientsByCreator,
  type Patient,
} from '@/lib/supabaseData';
import type { UserRole } from '@rural-ai/shared';

export default function DashboardPage() {
  const user = getSession();
  const role: UserRole = user?.role || 'citizen';

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'sahayak') return <SahayakDashboard userId={user?.id || ''} />;
  return <CitizenDashboard userId={user?.id || ''} name={user?.name || ''} />;
}

// ---------- Admin Dashboard ----------

function AdminDashboard() {
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
    <div>
      <TBScreeningBar />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Patients" value={stats.totalPatients} icon="👥" />
        <StatsCard title="Active Sahayaks" value={stats.activeSahayaks} icon="👩‍⚕️" />
        <StatsCard title="Pending Sync" value={stats.pendingSync} icon="⏳" />
        <StatsCard title="Synced Records" value={stats.syncedRecords} icon="📋" />
      </div>
      <RecentPatientsList patients={recentPatients} />
    </div>
  );
}

// ---------- Sahayak Dashboard ----------

function SahayakDashboard({ userId }: { userId: string }) {
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
    <div>
      <TBScreeningBar />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="My Patients" value={stats.myPatients} icon="👥" />
        <StatsCard title="Pending Sync" value={stats.pendingSync} icon="⏳" />
        <StatsCard title="Synced Records" value={stats.syncedRecords} icon="📋" />
      </div>
      <RecentPatientsList patients={recentPatients} />
    </div>
  );
}

// ---------- Citizen Dashboard ----------

function CitizenDashboard({ userId, name }: { userId: string; name: string }) {
  const [stats, setStats] = useState({ totalLogs: 0, lastVisit: null as string | null, vitalsCount: 0, prescriptionCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await getCitizenStats(userId);
        setStats(s);
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
    <div>
      <TBScreeningBar />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome, {name || 'User'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Health Logs" value={stats.totalLogs} icon="📋" />
        <StatsCard title="Vitals Recorded" value={stats.vitalsCount} icon="❤️" />
        <StatsCard title="Prescriptions" value={stats.prescriptionCount} icon="💊" />
        <StatsCard
          title="Last Visit"
          value={stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString() : 'None'}
          icon="📅"
        />
      </div>
      {stats.totalLogs === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg mb-2">No health records yet</p>
          <p className="text-gray-400 text-sm">Your health logs will appear here once recorded by a Sahayak or through the mobile app.</p>
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
      className="flex items-center justify-between w-full mb-6 px-5 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-sm hover:from-red-700 hover:to-red-600 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🫁</span>
        <div>
          <p className="font-semibold text-sm">TB Screening</p>
          <p className="text-xs text-red-100">Click to start tuberculosis screening assessment</p>
        </div>
      </div>
      <span className="text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all text-lg">&rarr;</span>
    </a>
  );
}

// ---------- Shared Components ----------

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Loading...</div>
    </div>
  );
}

function RecentPatientsList({ patients }: { patients: Patient[] }) {
  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg mb-2">No patients yet</p>
        <p className="text-gray-400 text-sm">Patients added via the mobile app will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h2>
      <div className="space-y-3">
        {patients.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                {p.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-500">{p.village}{p.district ? `, ${p.district}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                p.is_synced ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${p.is_synced ? 'bg-green-500' : 'bg-orange-500'}`} />
                {p.is_synced ? 'Synced' : 'Pending'}
              </span>
              <span className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
