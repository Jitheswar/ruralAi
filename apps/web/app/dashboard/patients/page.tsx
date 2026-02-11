'use client';

import { useEffect, useState } from 'react';
import PatientTable from '@/components/PatientTable';
import { getPatients, type Patient } from '@/lib/supabaseData';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getPatients();
      setPatients(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        {!loading && <span className="text-sm text-gray-500">{patients.length} total</span>}
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      ) : (
        <PatientTable patients={patients} />
      )}
    </div>
  );
}
