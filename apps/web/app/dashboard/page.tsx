import StatsCard from '@/components/StatsCard';
import { mockPatients } from '@/lib/mockData';

export default function DashboardPage() {
  const syncedCount = mockPatients.filter((p) => p.isSynced).length;
  const pendingCount = mockPatients.filter((p) => !p.isSynced).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Patients" value={mockPatients.length} icon="👥" />
        <StatsCard title="Active Sahayaks" value={2} icon="👩‍⚕️" />
        <StatsCard title="Pending Sync" value={pendingCount} icon="⏳" />
        <StatsCard title="Synced Records" value={syncedCount} icon="📋" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {mockPatients.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.village}, {p.district}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{p.createdAt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
