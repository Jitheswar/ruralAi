'use client';

import { useState } from 'react';

type SahayakStatus = 'pending' | 'verified' | 'active' | 'suspended';

interface Sahayak {
  id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  status: SahayakStatus;
  patientsManaged: number;
  joinedAt: string;
}

const mockSahayaks: Sahayak[] = [
  {
    id: 's1',
    name: 'Priya Sharma',
    phone: '9876543210',
    village: 'Moth',
    district: 'Jhansi',
    status: 'active',
    patientsManaged: 45,
    joinedAt: '2024-06-15',
  },
  {
    id: 's2',
    name: 'Anita Devi',
    phone: '9123456789',
    village: 'Rajpur',
    district: 'Lalitpur',
    status: 'verified',
    patientsManaged: 12,
    joinedAt: '2024-09-20',
  },
  {
    id: 's3',
    name: 'Rekha Yadav',
    phone: '9988776655',
    village: 'Garotha',
    district: 'Jhansi',
    status: 'pending',
    patientsManaged: 0,
    joinedAt: '2025-01-05',
  },
  {
    id: 's4',
    name: 'Kavita Singh',
    phone: '9112233445',
    village: 'Babina',
    district: 'Jhansi',
    status: 'active',
    patientsManaged: 32,
    joinedAt: '2024-03-10',
  },
  {
    id: 's5',
    name: 'Meena Patel',
    phone: '9556677889',
    village: 'Talbehat',
    district: 'Lalitpur',
    status: 'suspended',
    patientsManaged: 8,
    joinedAt: '2024-07-22',
  },
];

const STATUS_CONFIG: Record<SahayakStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  verified: { label: 'Verified', bg: 'bg-blue-100', text: 'text-blue-800' },
  active: { label: 'Active', bg: 'bg-green-100', text: 'text-green-800' },
  suspended: { label: 'Suspended', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function SahayakPage() {
  const [sahayaks, setSahayaks] = useState(mockSahayaks);

  function handleStatusChange(id: string, newStatus: SahayakStatus) {
    setSahayaks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  }

  const stats = {
    total: sahayaks.length,
    active: sahayaks.filter((s) => s.status === 'active').length,
    pending: sahayaks.filter((s) => s.status === 'pending').length,
    totalPatients: sahayaks.reduce((sum, s) => sum + s.patientsManaged, 0),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sahayak Management</h1>
        <span className="text-sm text-gray-500">{stats.total} total (mock data)</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
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
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Patients Managed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalPatients}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Village
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Patients
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sahayaks.map((s) => {
              const statusConfig = STATUS_CONFIG[s.status];
              return (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-500">Joined {s.joinedAt}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.phone}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{s.village}</div>
                    <div className="text-xs text-gray-500">{s.district}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                    >
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.patientsManaged}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {s.status === 'pending' && (
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
                      {s.status === 'verified' && (
                        <button
                          onClick={() => handleStatusChange(s.id, 'active')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                        >
                          Activate
                        </button>
                      )}
                      {s.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(s.id, 'suspended')}
                          className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200"
                        >
                          Suspend
                        </button>
                      )}
                      {s.status === 'suspended' && (
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
    </div>
  );
}
