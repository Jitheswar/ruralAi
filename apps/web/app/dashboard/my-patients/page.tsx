'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import PatientTable from '@/components/PatientTable';
import { getPatientsByCreator, type Patient } from '@/lib/supabaseData';

export default function MyPatientsPage() {
  const user = getSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const data = await getPatientsByCreator(user.id);
        setPatients(data);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
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
