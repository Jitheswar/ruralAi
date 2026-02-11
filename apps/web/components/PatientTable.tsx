import type { Patient } from '@/lib/supabaseData';

interface PatientTableProps {
  patients: Patient[];
}

export default function PatientTable({ patients }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg mb-2">No patients found</p>
        <p className="text-gray-400 text-sm">Patients will appear here once added.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Age</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Gender</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Village</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ABHA</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Sync</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {patients.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.phone || '—'}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{p.age ?? '—'}</td>
              <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.gender || '—'}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{p.village || '—'}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {p.abha_id ? (
                  <span className="text-green-600 text-xs font-medium">Linked</span>
                ) : (
                  <span className="text-gray-400 text-xs">Not linked</span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  p.is_synced ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.is_synced ? 'bg-green-500' : 'bg-orange-500'}`} />
                  {p.is_synced ? 'Synced' : 'Pending'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
