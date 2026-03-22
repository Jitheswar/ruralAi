/**
 * AI Service — calls FastAPI backend for prescription OCR and medicine lookup.
 * Real API calls only — no mock fallbacks.
 */

import { API_CONFIG } from '@rural-ai/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONFIG.BASE_URL;

// ----- Types -----

export interface PrescriptionMedicine {
  name: string;
  generic_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  market_price: number;
  jan_aushadhi_price: number;
  jan_aushadhi_name: string;
  savings_percent: number;
  uses: string[];
  side_effects: string[];
  found_in_db: boolean;
}

export interface PrescriptionResult {
  medicines: PrescriptionMedicine[];
  doctor_name: string;
  date: string;
  total_market_price: number;
  total_jan_aushadhi_price: number;
  notes: string;
  raw_text?: string;
  ocr_engine?: string;
  ocr_confidence?: number;
  warnings?: string[];
}

export interface MedicineLookupResult {
  found: boolean;
  medicine_name?: string;
  generic_name?: string;
  salt_composition?: string;
  category?: string;
  market_price?: number;
  jan_aushadhi_name?: string;
  jan_aushadhi_price?: number;
  savings_percent?: number;
  dosage_form?: string;
  strength?: string;
  uses?: string[];
  side_effects?: string[];
  contraindications?: string[];
  hindi_name?: string;
  is_nlem?: boolean;
  alternatives?: {
    brand_name: string;
    generic_name: string;
    strength: string;
    market_price: number | null;
    jan_aushadhi_price: number | null;
  }[];
  message?: string;
}

export interface TranscribeTextResult {
  text: string;
  language: string;
  suggested_symptoms: string[];
  medical_terms: { term: string; symptom_id: string; confidence: number }[];
}

// ----- API calls -----

export async function transcribeText(
  text: string,
  language: string,
  token: string,
): Promise<TranscribeTextResult> {
  const res = await fetch(`${API_BASE}/api/voice/transcribe-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ text, language }),
  });

  if (!res.ok) {
    throw new Error(`Voice API error: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function scanPrescription(file: File, token?: string): Promise<PrescriptionResult & { saved?: boolean }> {
  const formData = new FormData();
  formData.append('image', file);

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/ocr/prescription`, {
    method: 'POST',
    body: formData,
    headers: headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Prescription scan failed: ${text}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Prescription scan failed');
  }
  return { ...data.prescription, saved: !!data.saved };
}

export async function lookupMedicine(medicineName: string): Promise<MedicineLookupResult> {
  const res = await fetch(`${API_BASE}/api/ocr/medicine-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medicine_name: medicineName }),
  });

  if (!res.ok) {
    throw new Error(`Medicine lookup failed: HTTP ${res.status}`);
  }

  return await res.json();
}
