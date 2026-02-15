/**
 * ABDM Service — calls FastAPI ABDM stub endpoints.
 * Falls back to inline mocks when API is unreachable.
 */

import { Platform } from 'react-native';
import { API_CONFIG } from '@rural-ai/shared';

const API_BASE_URL =
  Platform.OS === 'android' ? API_CONFIG.ANDROID_EMULATOR_URL : API_CONFIG.BASE_URL;

// ----- Types -----

export interface ABHAProfile {
  abha_id: string;
  health_id: string;
  name: string;
  gender: string;
  year_of_birth: number;
  phone: string;
  address: {
    district: string;
    state: string;
    pincode: string;
  };
  linked_facilities: Array<{
    hip_id: string;
    name: string;
    type: string;
  }>;
}

export interface ABHACreateParams {
  name: string;
  phone: string;
  gender: string;
  year_of_birth: number;
  district: string;
  state: string;
}

export interface ConsentRequestParams {
  patient_abha_id: string;
  hip_id: string;
  purpose?: string;
  date_from: string;
  date_to: string;
}

// ----- Mock fallbacks -----

const MOCK_PROFILE: ABHAProfile = {
  abha_id: '12-3456-7890-1234',
  health_id: 'ramesh.kumar@abdm',
  name: 'Ramesh Kumar',
  gender: 'M',
  year_of_birth: 1985,
  phone: '9876543210',
  address: {
    district: 'Jhansi',
    state: 'Uttar Pradesh',
    pincode: '284001',
  },
  linked_facilities: [
    {
      hip_id: 'IN3210000123',
      name: 'CHC Moth',
      type: 'Community Health Center',
    },
  ],
};

// ----- API calls -----

export async function searchABHA(
  abhaId: string
): Promise<{ found: boolean; profile: ABHAProfile | null }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/abdm/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ abha_id: abhaId }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    console.log('ABDM API unavailable, using mock search');
    if (abhaId === '12-3456-7890-1234') {
      return { found: true, profile: MOCK_PROFILE };
    }
    return { found: false, profile: null };
  }
}

export async function createABHA(
  params: ABHACreateParams
): Promise<{ success: boolean; abha_id?: string; health_id?: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/abdm/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    console.log('ABDM API unavailable, using mock create');
    return {
      success: true,
      abha_id: `${params.year_of_birth}-${params.phone.slice(-4)}-0000`,
      health_id: `${params.name.toLowerCase().replace(/\s/g, '').slice(0, 10)}@abdm`,
      message: 'ABHA ID created (offline mock)',
    };
  }
}

export async function initAuth(
  abhaId: string,
  purpose: string = 'KYC'
): Promise<{ transaction_id: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/abdm/auth/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ abha_id: abhaId, purpose }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    console.log('ABDM API unavailable, using mock auth init');
    return {
      transaction_id: 'mock_txn_12345',
      message: 'OTP sent to registered mobile (offline mock)',
    };
  }
}

export async function confirmAuth(
  transactionId: string,
  otp: string
): Promise<{ success: boolean; access_token?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/abdm/auth/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: transactionId, otp }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    console.log('ABDM API unavailable, using mock auth confirm');
    if (otp === '123456') {
      return { success: true, access_token: 'mock_token_offline' };
    }
    return { success: false };
  }
}

export async function requestConsent(
  params: ConsentRequestParams
): Promise<{ consent_request_id: string; status: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/abdm/consent/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    console.log('ABDM API unavailable, using mock consent');
    return {
      consent_request_id: 'mock_cr_001',
      status: 'REQUESTED',
      message: 'Consent request sent (offline mock)',
    };
  }
}
