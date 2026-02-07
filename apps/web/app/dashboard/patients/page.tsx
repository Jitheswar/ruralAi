import PatientTable from '@/components/PatientTable';
import { mockPatients } from '@/lib/mockData';

export default function PatientsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <span className="text-sm text-gray-500">{mockPatients.length} total (mock data)</span>
      </div>
      <PatientTable patients={mockPatients} />
    </div>
  );
}
