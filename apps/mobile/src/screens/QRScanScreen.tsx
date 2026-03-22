import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../services/supabaseClient';
import { API_CONFIG } from '@rural-ai/shared';
import { useLanguage } from '../contexts/LanguageContext';

type ScreenState = 'scanning' | 'loading' | 'result' | 'error';

interface VerifiedRecord {
  type: string;
  record: Record<string, unknown>;
}

export default function QRScanScreen({ navigation }: any) {
  const [state, setState] = useState<ScreenState>('scanning');
  const [result, setResult] = useState<VerifiedRecord | null>(null);
  const [error, setError] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { t } = useLanguage();

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    setState('loading');
    setError('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setState('error');
        return;
      }

      const apiBase = API_CONFIG.BASE_URL;
      const res = await fetch(`${apiBase}/api/qr/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qr_payload: data }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.detail || 'Verification failed.');
        setState('error');
        return;
      }

      setResult({ type: json.type, record: json.record });
      setState('result');
    } catch (err) {
      console.error('QR verify error:', err);
      setError('Verification failed. Check your connection.');
      setState('error');
    }
  }

  function handleReset() {
    setScanned(false);
    setResult(null);
    setError('');
    setState('scanning');
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.subtitle}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Camera Permission</Text>
        <Text style={styles.subtitle}>Camera access is needed to scan QR codes.</Text>
        <Pressable onPress={requestPermission} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {state === 'scanning' && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>Point camera at QR code</Text>
          </View>
        </View>
      )}

      {state === 'loading' && (
        <View style={styles.centered}>
          <Text style={styles.subtitle}>Verifying QR code...</Text>
        </View>
      )}

      {state === 'error' && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={handleReset} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Scan Again</Text>
          </Pressable>
        </View>
      )}

      {state === 'result' && result && (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>
            {result.type === 'patient' ? 'Patient Record' : 'Health Log'}
          </Text>

          <View style={styles.card}>
            {Object.entries(result.record).map(([key, value]) => (
              <View key={key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{key}</Text>
                <Text style={styles.fieldValue}>
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '-')}
                </Text>
              </View>
            ))}
          </View>

          <Pressable onPress={handleReset} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Scan Another</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  cameraContainer: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scanText: {
    marginTop: 24,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fieldLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', flex: 1 },
  fieldValue: { fontSize: 14, color: '#1F2937', flex: 2, textAlign: 'right' },
  errorText: { fontSize: 14, color: '#DC2626', textAlign: 'center', marginBottom: 16 },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#374151', fontWeight: '500', fontSize: 14 },
});
