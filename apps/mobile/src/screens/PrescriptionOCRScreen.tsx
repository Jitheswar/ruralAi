import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Image } from 'react-native';
import { scanPrescription, PrescriptionResult, PrescriptionMedicine } from '../services/aiService';
import { useSymptomEngine } from '../hooks/useSymptomEngine';

type ScanState = 'idle' | 'scanning' | 'done';

function MedicineCard({ med }: { med: PrescriptionMedicine }) {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
      <Text className="text-base font-semibold text-gray-900 mb-1">{med.name}</Text>
      <Text className="text-sm text-gray-500 mb-2">
        {med.dosage} · {med.frequency} · {med.duration}
      </Text>

      {/* Price comparison */}
      <View className="bg-green-50 rounded-lg p-3">
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-gray-500">Market Price</Text>
          <Text className="text-sm text-gray-700">₹{med.market_price.toFixed(0)}</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-green-700 font-medium">Jan Aushadhi</Text>
          <Text className="text-sm text-green-700 font-bold">
            ₹{med.jan_aushadhi_price.toFixed(0)}
          </Text>
        </View>
        <View className="flex-row justify-between pt-1 border-t border-green-200 mt-1">
          <Text className="text-xs text-green-600">You save</Text>
          <Text className="text-sm text-green-600 font-bold">{med.savings_percent}%</Text>
        </View>
      </View>

      {med.jan_aushadhi_name !== med.name && (
        <Text className="text-xs text-gray-400 mt-2">
          Jan Aushadhi: {med.jan_aushadhi_name}
        </Text>
      )}
    </View>
  );
}

export default function PrescriptionOCRScreen({ navigation }: any) {
  const [state, setState] = useState<ScanState>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<PrescriptionResult | null>(null);
  const engine = useSymptomEngine();

  async function handlePickImage(source: 'camera' | 'gallery') {
    try {
      // In production: use expo-image-picker
      // For now, simulate with a mock URI
      const mockUri = 'file:///mock-prescription.jpg';
      setImageUri(mockUri);
      setState('scanning');

      const prescription = await scanPrescription(mockUri);
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
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-6">
        {/* Title */}
        <Text className="text-xl font-bold text-gray-900 mb-2">Prescription Scanner</Text>
        <Text className="text-sm text-gray-500 mb-6">
          Scan a prescription to find affordable Jan Aushadhi alternatives.
        </Text>

        {/* Image source selection */}
        {state === 'idle' && (
          <View>
            <Pressable
              onPress={() => handlePickImage('camera')}
              className="bg-primary py-5 rounded-xl items-center mb-3"
            >
              <Text style={{ fontSize: 32, marginBottom: 4 }}>📷</Text>
              <Text className="text-white font-semibold text-base">Take Photo</Text>
              <Text className="text-white/70 text-xs mt-1">Use camera to scan prescription</Text>
            </Pressable>

            <Pressable
              onPress={() => handlePickImage('gallery')}
              className="bg-white border border-gray-300 py-5 rounded-xl items-center mb-6"
            >
              <Text style={{ fontSize: 32, marginBottom: 4 }}>🖼️</Text>
              <Text className="text-gray-800 font-semibold text-base">Choose from Gallery</Text>
              <Text className="text-gray-500 text-xs mt-1">Select existing photo</Text>
            </Pressable>

            {/* Info card */}
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <Text className="text-blue-800 font-semibold mb-2">How it works</Text>
              <View className="flex-row mb-1">
                <Text className="text-blue-600 mr-2">1.</Text>
                <Text className="text-blue-700 text-sm flex-1">
                  Take a photo of your prescription
                </Text>
              </View>
              <View className="flex-row mb-1">
                <Text className="text-blue-600 mr-2">2.</Text>
                <Text className="text-blue-700 text-sm flex-1">
                  We extract medicine names and dosages
                </Text>
              </View>
              <View className="flex-row">
                <Text className="text-blue-600 mr-2">3.</Text>
                <Text className="text-blue-700 text-sm flex-1">
                  See Jan Aushadhi alternatives with prices
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Scanning indicator */}
        {state === 'scanning' && (
          <View className="items-center py-12">
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
            <Text className="text-gray-700 font-medium text-base">
              Scanning prescription...
            </Text>
            <Text className="text-gray-400 text-sm mt-2">
              Extracting medicine information
            </Text>
          </View>
        )}

        {/* Results */}
        {result && state === 'done' && (
          <View>
            {/* Doctor info */}
            <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Prescribed by</Text>
                <Text className="text-sm font-medium text-gray-800">
                  {result.doctor_name}
                </Text>
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-sm text-gray-500">Date</Text>
                <Text className="text-sm text-gray-800">{result.date}</Text>
              </View>
            </View>

            {/* Medicines */}
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Medicines ({result.medicines.length})
            </Text>
            {result.medicines.map((med, i) => (
              <MedicineCard key={i} med={med} />
            ))}

            {/* Total savings */}
            <View className="bg-green-600 rounded-xl p-4 mb-4">
              <Text className="text-white font-bold text-base mb-2">Total Savings</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-white/80 text-sm">Market total</Text>
                <Text className="text-white text-sm">
                  ₹{result.total_market_price.toFixed(0)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-white/80 text-sm">Jan Aushadhi total</Text>
                <Text className="text-white font-bold text-sm">
                  ₹{result.total_jan_aushadhi_price.toFixed(0)}
                </Text>
              </View>
              <View className="border-t border-white/30 mt-2 pt-2 flex-row justify-between">
                <Text className="text-white font-bold">You save</Text>
                <Text className="text-white font-bold text-lg">
                  ₹{(result.total_market_price - result.total_jan_aushadhi_price).toFixed(0)}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <Pressable
              onPress={handleSaveToRecord}
              className="bg-primary py-4 rounded-xl items-center mb-3"
            >
              <Text className="text-white font-semibold">Save to Health Record</Text>
            </Pressable>

            <Pressable
              onPress={handleReset}
              className="bg-gray-200 py-3 rounded-xl items-center mb-8"
            >
              <Text className="text-gray-700 font-medium">Scan Another</Text>
            </Pressable>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
