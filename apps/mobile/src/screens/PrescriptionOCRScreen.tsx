import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { scanPrescription, PrescriptionResult, PrescriptionMedicine } from '../services/aiService';
import { supabase } from '../services/supabaseClient';
import { useSymptomEngine } from '../hooks/useSymptomEngine';
import { useLanguage } from '../contexts/LanguageContext';

type ScanState = 'idle' | 'scanning' | 'done';

function MedicineCard({ med }: { med: PrescriptionMedicine }) {
  return (
    <View style={styles.medicineCard}>
      <Text style={styles.medicineName}>{med.name}</Text>
      <Text style={styles.medicineDosage}>
        {med.dosage} · {med.frequency} · {med.duration}
      </Text>

      <View style={styles.priceComparison}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Market Price</Text>
          <Text style={styles.priceMarket}>₹{med.market_price.toFixed(0)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.janAushadhiLabel}>Jan Aushadhi</Text>
          <Text style={styles.janAushadhiPrice}>
            ₹{med.jan_aushadhi_price.toFixed(0)}
          </Text>
        </View>
        <View style={styles.savingsRow}>
          <Text style={styles.savingsLabel}>You save</Text>
          <Text style={styles.savingsValue}>{med.savings_percent}%</Text>
        </View>
      </View>

      {med.jan_aushadhi_name !== med.name && (
        <Text style={styles.janAushadhiName}>
          Jan Aushadhi: {med.jan_aushadhi_name}
        </Text>
      )}
    </View>
  );
}

export default function PrescriptionOCRScreen({ navigation }: any) {
  const { t } = useLanguage();
  const [state, setState] = useState<ScanState>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<PrescriptionResult | null>(null);
  const engine = useSymptomEngine();

  async function handlePickImage(source: 'camera' | 'gallery') {
    try {
      let pickerResult: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera access is needed to scan prescriptions.');
          return;
        }
        pickerResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: false,
        });
      } else {
        // Request media library permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Photo library access is needed to select prescriptions.');
          return;
        }
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: false,
        });
      }

      // User cancelled the picker
      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return;
      }

      const uri = pickerResult.assets[0].uri;
      console.log('[OCR] Image selected, URI:', uri);
      setImageUri(uri);
      setState('scanning');

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error('You must be logged in to scan prescriptions.');
      }

      const prescription = await scanPrescription(uri, token);
      setResult(prescription);
      setState('done');
    } catch (err) {
      console.error('Failed to scan prescription:', err);
      setState('idle');
      Alert.alert('Error', 'Could not scan prescription. Please try again.');
    }
  }

  async function handleSaveToRecord() {
    if (!result) return;

    try {
      await engine.saveToHealthLog('self', 'current_user');
      Alert.alert('Saved', 'Prescription saved to health records.');
    } catch (err) {
      console.error('Failed to save:', err);
      Alert.alert('Error', 'Could not save prescription.');
    }
  }

  function handleReset() {
    setResult(null);
    setImageUri(null);
    setState('idle');
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>{t('prescription.scanner')}</Text>
        <Text style={styles.subtitle}>
          {t('prescription.scanDescription')}
        </Text>

        {state === 'idle' && (
          <View>
            <Pressable
              onPress={() => handlePickImage('camera')}
              style={styles.cameraButton}
            >
              <Text style={{ fontSize: 32, marginBottom: 4 }}>📷</Text>
              <Text style={styles.cameraButtonText}>Take Photo</Text>
              <Text style={styles.cameraButtonSubtext}>Use camera to scan prescription</Text>
            </Pressable>

            <Pressable
              onPress={() => handlePickImage('gallery')}
              style={styles.galleryButton}
            >
              <Text style={{ fontSize: 32, marginBottom: 4 }}>🖼️</Text>
              <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
              <Text style={styles.galleryButtonSubtext}>Select existing photo</Text>
            </Pressable>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>{t('prescription.howItWorks')}</Text>
              <View style={styles.infoStep}>
                <Text style={styles.infoStepNumber}>1.</Text>
                <Text style={styles.infoStepText}>
                  Take a photo of your prescription
                </Text>
              </View>
              <View style={styles.infoStep}>
                <Text style={styles.infoStepNumber}>2.</Text>
                <Text style={styles.infoStepText}>
                  We extract medicine names and dosages
                </Text>
              </View>
              <View style={styles.infoStepLast}>
                <Text style={styles.infoStepNumber}>3.</Text>
                <Text style={styles.infoStepText}>
                  See Jan Aushadhi alternatives with prices
                </Text>
              </View>
            </View>
          </View>
        )}

        {state === 'scanning' && (
          <View style={styles.scanningContainer}>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            )}
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
            <Text style={styles.scanningText}>
              {t('prescription.scanning')}
            </Text>
            <Text style={styles.scanningSubtext}>
              Extracting medicine information
            </Text>
          </View>
        )}

        {result && state === 'done' && (
          <View>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            )}
            <View style={styles.doctorCard}>
              <View style={styles.doctorRow}>
                <Text style={styles.doctorLabel}>{t('prescription.prescribedBy')}</Text>
                <Text style={styles.doctorValue}>
                  {result.doctor_name}
                </Text>
              </View>
              <View style={styles.doctorRowLast}>
                <Text style={styles.doctorLabel}>{t('prescription.date')}</Text>
                <Text style={styles.doctorDate}>{result.date}</Text>
              </View>
            </View>

            <Text style={styles.medicinesTitle}>
              {t('prescription.medicines')} ({result.medicines.length})
            </Text>
            {result.medicines.map((med, i) => (
              <MedicineCard key={i} med={med} />
            ))}

            <View style={styles.totalSavingsCard}>
              <Text style={styles.totalSavingsTitle}>{t('prescription.totalSavings')}</Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Market total</Text>
                <Text style={styles.totalValue}>
                  ₹{result.total_market_price.toFixed(0)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Jan Aushadhi total</Text>
                <Text style={styles.totalJanAushadhiValue}>
                  ₹{result.total_jan_aushadhi_price.toFixed(0)}
                </Text>
              </View>
              <View style={styles.totalSavingsRow}>
                <Text style={styles.totalSavingsLabel}>You save</Text>
                <Text style={styles.totalSavingsAmount}>
                  ₹{(result.total_market_price - result.total_jan_aushadhi_price).toFixed(0)}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleSaveToRecord}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </Pressable>

            <Pressable
              onPress={handleReset}
              style={styles.scanAnotherButton}
            >
              <Text style={styles.scanAnotherText}>{t('prescription.scanAnother')}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  cameraButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cameraButtonSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  galleryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  galleryButtonText: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 16,
  },
  galleryButtonSubtext: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoCardTitle: {
    color: '#1E40AF',
    fontWeight: '600',
    marginBottom: 8,
  },
  infoStep: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoStepLast: {
    flexDirection: 'row',
  },
  infoStepNumber: {
    color: '#2563EB',
    marginRight: 8,
  },
  infoStepText: {
    color: '#1D4ED8',
    fontSize: 14,
    flex: 1,
  },
  scanningContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  scanningText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 16,
  },
  scanningSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  doctorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doctorRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  doctorLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  doctorValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  doctorDate: {
    fontSize: 14,
    color: '#1F2937',
  },
  medicinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  medicineDosage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceComparison: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceMarket: {
    fontSize: 14,
    color: '#374151',
  },
  janAushadhiLabel: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '500',
  },
  janAushadhiPrice: {
    fontSize: 14,
    color: '#15803D',
    fontWeight: 'bold',
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
    marginTop: 4,
  },
  savingsLabel: {
    fontSize: 12,
    color: '#16A34A',
  },
  savingsValue: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: 'bold',
  },
  janAushadhiName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  totalSavingsCard: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalSavingsTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  totalJanAushadhiValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  totalSavingsRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    marginTop: 8,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalSavingsLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  totalSavingsAmount: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scanAnotherButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  scanAnotherText: {
    color: '#374151',
    fontWeight: '500',
  },
  spacer: {
    height: 24,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
});
