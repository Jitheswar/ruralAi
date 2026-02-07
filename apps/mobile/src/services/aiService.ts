/**
 * AI Service — calls FastAPI backend for voice transcription and OCR.
 * Falls back to mock data when API is unreachable.
 */

import { API_BASE_URL } from '@rural-ai/shared';

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
  doctor_name: string;
  date: string;
  total_market_price: number;
  total_jan_aushadhi_price: number;
}

// ----- Mock fallbacks -----

const MOCK_TRANSCRIPTION: TranscriptionResult = {
  hindi_text: 'मुझे दो दिन से बुखार है और सिर दर्द भी है',
  english_text: 'I have had fever for two days and also headache',
  medical_terms: [
    { term: 'Fever', snomed_code: '386661006', category: 'general' },
    { term: 'Headache', snomed_code: '25064002', category: 'neuro' },
  ],
  suggested_symptoms: ['fever', 'headache'],
  confidence: 0.95,
};

const MOCK_PRESCRIPTION: PrescriptionResult = {
  medicines: [
    {
      name: 'Paracetamol 650mg',
      dosage: '1 tablet',
      frequency: 'As needed (max 4/day)',
      duration: '3 days',
      market_price: 30.0,
      jan_aushadhi_price: 5.0,
      jan_aushadhi_name: 'Paracetamol 650mg Tab',
      savings_percent: 83,
    },
    {
      name: 'Amoxicillin 500mg',
      dosage: '1 tablet',
      frequency: '3 times a day',
      duration: '5 days',
      market_price: 85.0,
      jan_aushadhi_price: 12.5,
      jan_aushadhi_name: 'Amoxicillin 500mg Cap',
      savings_percent: 85,
    },
  ],
  doctor_name: 'Dr. Sharma',
  date: '2025-01-10',
  total_market_price: 115.0,
  total_jan_aushadhi_price: 17.5,
};

// ----- API calls -----

export async function transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
  try {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);

    const res = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return data.transcription;
  } catch {
    console.log('Voice API unavailable, using mock transcription');
    return MOCK_TRANSCRIPTION;
  }
}

export async function transcribeText(
  text: string,
  language: string = 'hi'
): Promise<TranscriptionResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/voice/transcribe-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return data.transcription;
  } catch {
    console.log('Voice API unavailable, using mock transcription');
    return MOCK_TRANSCRIPTION;
  }
}

export async function scanPrescription(imageUri: string): Promise<PrescriptionResult> {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'prescription.jpg',
    } as any);

    const res = await fetch(`${API_BASE_URL}/api/ocr/prescription`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return data.prescription;
  } catch {
    console.log('OCR API unavailable, using mock prescription');
    return MOCK_PRESCRIPTION;
  }
}

export async function lookupMedicine(
  medicineName: string
): Promise<{ found: boolean; [key: string]: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ocr/medicine-lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicine_name: medicineName }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    return await res.json();
  } catch {
    return { found: false, message: 'API unavailable' };
  }
}
