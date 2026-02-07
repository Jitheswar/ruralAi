import StatsCard from '@/components/StatsCard';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Patients" value={0} icon="👥" />
        <StatsCard title="Active Sahayaks" value={0} icon="👩‍⚕️" />
        <StatsCard title="Pending Verifications" value={0} icon="⏳" />
        <StatsCard title="Health Logs Today" value={0} icon="📋" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-500 text-sm">
          No activity yet. Patient data will appear here once the mobile app is connected.
        </p>
      </div>
    </div>
  );
}
