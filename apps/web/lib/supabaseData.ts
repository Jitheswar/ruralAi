import { getSupabaseClient } from './supabaseClient';

// ---------- Types ----------

export interface Patient {
  id: string;
  name: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  village: string | null;
  district: string | null;
  abha_id: string | null;
  is_self_profile: boolean;
  is_synced: boolean;
  created_by: string;
  created_at: string;
}

export interface SahayakUser {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  role: string;
  is_verified: boolean;
  kyc_status: string;
  created_at: string;
}

export interface HealthLog {
  id: string;
  patient_id: string;
  recorded_by: string;
  log_type: string;
  data: Record<string, unknown>;
  notes: string | null;
  created_at: string;
}

// ---------- Patient Queries ----------

export async function getPatients(): Promise<Patient[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patients:', error.message);
    return [];
  }
  return data || [];
}

export async function getPatientsByCreator(userId: string): Promise<Patient[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patients by creator:', error.message);
    return [];
  }
  return data || [];
}

// ---------- Sahayak / User Queries ----------

export async function getSahayaks(): Promise<SahayakUser[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'sahayak')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sahayaks:', error.message);
    return [];
  }
  return data || [];
}

export async function updateSahayakStatus(
  userId: string,
  isVerified: boolean,
  kycStatus: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('users')
    .update({ is_verified: isVerified, kyc_status: kycStatus })
    .eq('id', userId);

  if (error) {
    console.error('Error updating sahayak status:', error.message);
    return false;
  }
  return true;
}

// ---------- Health Log Queries ----------

export async function getHealthLogs(patientId: string): Promise<HealthLog[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching health logs:', error.message);
    return [];
  }
  return data || [];
}

export async function getHealthLogsByUser(userId: string): Promise<HealthLog[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('recorded_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user health logs:', error.message);
    return [];
  }
  return data || [];
}

// ---------- Medicine Queries ----------

export interface Medicine {
  id: string;
  brand_name: string;
  generic_name: string;
  salt_composition: string | null;
  category: string;
  market_price: number | null;
  jan_aushadhi_name: string | null;
  jan_aushadhi_price: number | null;
  savings_percent: number | null;
  dosage_form: string | null;
  strength: string | null;
  manufacturer: string | null;
  uses: string[];
  side_effects: string[];
  contraindications: string[];
  hindi_name: string | null;
  is_nlem: boolean;
}

function escapeIlikePattern(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}

export async function searchMedicines(query: string, limit = 50): Promise<Medicine[]> {
  const supabase = getSupabaseClient();
  const pattern = `%${escapeIlikePattern(query)}%`;

  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .or(`brand_name.ilike.${pattern},generic_name.ilike.${pattern},salt_composition.ilike.${pattern},hindi_name.ilike.${pattern}`)
    .limit(limit);

  if (error) {
    console.error('Error searching medicines:', error.message);
    return [];
  }
  return data || [];
}

export async function getMedicinesByCategory(category: string): Promise<Medicine[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .ilike('category', category)
    .order('generic_name');

  if (error) {
    console.error('Error fetching medicines by category:', error.message);
    return [];
  }
  return data || [];
}

export async function getMedicineById(id: string): Promise<Medicine | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching medicine:', error.message);
    return null;
  }
  return data;
}

// ---------- Stats Queries ----------

export async function getAdminStats() {
  const supabase = getSupabaseClient();

  const [patientsRes, sahayaksRes] = await Promise.all([
    supabase.from('patients').select('id, is_synced'),
    supabase.from('users').select('id, is_verified').eq('role', 'sahayak'),
  ]);

  const patients: { id: string; is_synced: boolean }[] = patientsRes.data || [];
  const sahayaks: { id: string; is_verified: boolean }[] = sahayaksRes.data || [];

  return {
    totalPatients: patients.length,
    activeSahayaks: sahayaks.filter((s) => s.is_verified).length,
    pendingSync: patients.filter((p) => !p.is_synced).length,
    syncedRecords: patients.filter((p) => p.is_synced).length,
  };
}

export async function getSahayakStats(userId: string) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('patients')
    .select('id, is_synced')
    .eq('created_by', userId);

  const patients: { id: string; is_synced: boolean }[] = data || [];
  return {
    myPatients: patients.length,
    pendingSync: patients.filter((p) => !p.is_synced).length,
    syncedRecords: patients.filter((p) => p.is_synced).length,
  };
}
