'use client';

import { useEffect, useState } from 'react';
import PatientTable from '@/components/PatientTable';
import { getPatients, type Patient } from '@/lib/supabaseData';
import { Loader2 } from 'lucide-react';

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
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Patients</h1>
        {!loading && <span className="text-sm text-muted-foreground">{patients.length} total</span>}
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <PatientTable patients={patients} />
      )}
    </div>
  );
}
