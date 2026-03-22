/**
 * AI Service — calls FastAPI backend for voice transcription and OCR.
 */

import { Platform } from 'react-native';
import { API_CONFIG } from '@rural-ai/shared';

const API_BASE_URL =
  Platform.OS === 'android' ? API_CONFIG.ANDROID_EMULATOR_URL : API_CONFIG.BASE_URL;

// ----- Types -----

export interface MedicalTerm {
  term: string;
  snomed_code: string;
  category: string;
}

export interface TranscriptionResult {
  hindi_text: string;
  english_text: string;
  medical_terms: MedicalTerm[];
  suggested_symptoms: string[];
  confidence: number;
}

export interface PrescriptionMedicine {
  name: string;
  generic_name?: string;
  dosage: string;
  frequency: string;
  duration: string;
  market_price: number;
  jan_aushadhi_price: number;
  jan_aushadhi_name: string;
  savings_percent: number;
}

export interface PrescriptionResult {
  medicines: PrescriptionMedicine[];
  doctor_name: string | null;
  date: string | null;
  notes: string | null;
  total_market_price: number;
  total_jan_aushadhi_price: number;
  raw_text?: string;
  ocr_engine?: string;
  ocr_confidence?: number;
  warnings?: string[];
}

// ----- API calls -----

export async function transcribeAudio(audioUri: string, token?: string): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as any);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!res.ok) throw new Error(`Voice API error: HTTP ${res.status}`);

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Transcription failed');
  return data.transcription;
}

export async function transcribeText(
  text: string,
  language: string = 'hi',
  token?: string,
): Promise<TranscriptionResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/voice/transcribe-text`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, language }),
  });

  if (!res.ok) throw new Error(`Voice API error: HTTP ${res.status}`);

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Text analysis failed');
  return data.transcription;
}

export async function scanPrescription(imageUri: string, token: string): Promise<PrescriptionResult> {
  if (!token) {
    throw new Error('Missing auth token for prescription scan');
  }

  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'prescription.jpg',
  } as any);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${API_BASE_URL}/api/ocr/prescription`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!res.ok) throw new Error(`OCR API error: HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Prescription scan failed');
  return data.prescription;
}

export async function lookupMedicine(
  medicineName: string
): Promise<{ found: boolean;[key: string]: unknown }> {
  const res = await fetch(`${API_BASE_URL}/api/ocr/medicine-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medicine_name: medicineName }),
  });

  if (!res.ok) throw new Error(`Medicine lookup error: HTTP ${res.status}`);
  return await res.json();
}
