import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../db';
import Patient from '../db/models/Patient';
import ProfileSwitcher, { ManagedProfile } from '../components/ProfileSwitcher';

// Mock managed profiles for Sahayak mode
const MOCK_MANAGED_PROFILES: ManagedProfile[] = [
  {
    id: 'p1',
    name: 'Sunita Devi',
    relation: 'Village member',
    consentExpiry: '2025-03-15',
  },
  {
    id: 'p2',
    name: 'Ramesh Kumar',
    relation: 'Village member',
    consentExpiry: '2025-02-28',
  },
  {
    id: 'p3',
    name: 'Geeta Bai',
    relation: 'Village member',
  },
];

export default function SahayakScreen({ navigation }: any) {
  const { user } = useAuth();
  const [activeProfile, setActiveProfile] = useState<ManagedProfile | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const sub = database
      .get<Patient>('patients')
      .query()
      .observe()
      .subscribe((records) => setPatients(records));
    return () => sub.unsubscribe();
  }, []);

  function handleAddPatient() {
    navigation.navigate('AddPatient');
  }

  function handlePatientPress(patient: Patient) {
    navigation.navigate('PatientDetail', { patientId: patient.id });
  }

  function handleSymptomCheck() {
    if (!activeProfile) {
      Alert.alert(
        'Select a Profile',
        'Please select a managed profile before performing a symptom check.'
      );
      return;
    }
    navigation.navigate('SymptomChecker');
  }

  function handleVoiceInput() {
    navigation.navigate('VoiceInput');
  }

  function handlePrescriptionScan() {
    navigation.navigate('PrescriptionOCR');
  }

  const isSahayak = user?.role === 'sahayak';

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-14 pb-5 px-4">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1">
            <Text className="text-white/80 text-xs">Sahayak Mode</Text>
            <Text className="text-white text-lg font-bold">
              {user?.name || user?.phone || 'Sahayak'}
            </Text>
          </View>
          <ProfileSwitcher
            currentProfile={activeProfile}
            profiles={MOCK_MANAGED_PROFILES}
            onSwitch={setActiveProfile}
          />
        </View>

        {activeProfile && (
          <View className="bg-white/10 rounded-lg px-3 py-2">
            <Text className="text-white/90 text-xs">
              Acting on behalf of: <Text className="font-bold">{activeProfile.name}</Text>
              {activeProfile.consentExpiry
                ? ` (consent until ${activeProfile.consentExpiry})`
                : ''}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            {/* Quick actions */}
            <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Quick Actions
            </Text>
            <View className="flex-row mb-6">
              <Pressable
                onPress={handleSymptomCheck}
                className="flex-1 bg-white rounded-xl p-4 mr-2 border border-gray-100 items-center"
              >
                <Text style={{ fontSize: 28 }}>🩺</Text>
                <Text className="text-xs text-gray-700 mt-1 font-medium">Symptom Check</Text>
              </Pressable>
              <Pressable
                onPress={handleVoiceInput}
                className="flex-1 bg-white rounded-xl p-4 mr-2 border border-gray-100 items-center"
              >
                <Text style={{ fontSize: 28 }}>🎤</Text>
                <Text className="text-xs text-gray-700 mt-1 font-medium">Voice Input</Text>
              </Pressable>
              <Pressable
                onPress={handlePrescriptionScan}
                className="flex-1 bg-white rounded-xl p-4 border border-gray-100 items-center"
              >
                <Text style={{ fontSize: 28 }}>📋</Text>
                <Text className="text-xs text-gray-700 mt-1 font-medium">Scan Rx</Text>
              </Pressable>
            </View>

            {/* Patient list header */}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Managed Patients
              </Text>
              <Pressable onPress={handleAddPatient}>
                <Text className="text-primary text-sm font-semibold">+ Add</Text>
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handlePatientPress(item)}
            className="bg-white rounded-xl p-4 mb-2 border border-gray-100 flex-row items-center"
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: '#E5E7EB' }}
            >
              <Text className="text-gray-600 font-bold">
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">{item.name}</Text>
              <Text className="text-xs text-gray-500">
                {item.age}y · {item.gender} · {item.village}
              </Text>
            </View>
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.isSynced ? '#059669' : '#D97706' }}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text className="text-gray-500 text-center mt-3">
              No patients registered yet.{'\n'}Tap "+ Add" to register a patient.
            </Text>
          </View>
        }
      />

      {/* Role warning for non-sahayaks */}
      {!isSahayak && (
        <View className="bg-yellow-50 border-t border-yellow-200 px-4 py-3">
          <Text className="text-yellow-800 text-xs text-center">
            You are viewing Sahayak mode in demo. Assign 'sahayak' role for full access.
          </Text>
        </View>
      )}
    </View>
  );
}
