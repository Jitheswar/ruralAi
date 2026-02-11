'use client';

import { useEffect, useState } from 'react';
import { getSahayaks, updateSahayakStatus, type SahayakUser } from '@/lib/supabaseData';

type DisplayStatus = 'pending' | 'verified' | 'active' | 'suspended';

function getDisplayStatus(s: SahayakUser): DisplayStatus {
  if (s.kyc_status === 'pending') return 'pending';
  if (s.kyc_status === 'verified' && !s.is_verified) return 'verified';
  if (s.is_verified && s.kyc_status !== 'failed') return 'active';
  return 'suspended';
}

const STATUS_CONFIG: Record<DisplayStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  verified: { label: 'Verified', bg: 'bg-blue-100', text: 'text-blue-800' },
  active: { label: 'Active', bg: 'bg-green-100', text: 'text-green-800' },
  suspended: { label: 'Suspended', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function SahayakPage() {
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sahayak Management</h1>
        <span className="text-sm text-gray-500">{stats.total} total</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Sahayaks</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
      </div>

      {sahayaks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg mb-2">No sahayaks registered yet</p>
          <p className="text-gray-400 text-sm">Sahayaks will appear here once they register with the sahayak role.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sahayaks.map((s) => {
                const status = getDisplayStatus(s);
                const statusConfig = STATUS_CONFIG[status];
                return (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{s.name || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.email || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(s.id, 'verified')}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(s.id, 'suspended')}
                              className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {status === 'verified' && (
                          <button
                            onClick={() => handleStatusChange(s.id, 'active')}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                          >
                            Activate
                          </button>
                        )}
                        {status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(s.id, 'suspended')}
                            className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200"
                          >
                            Suspend
                          </button>
                        )}
                        {status === 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(s.id, 'active')}
                            className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200"
                          >
                            Reactivate
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
      )}
    </div>
  );
}
