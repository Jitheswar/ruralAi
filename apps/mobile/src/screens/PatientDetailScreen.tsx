import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { database } from '../db';
import Patient from '../db/models/Patient';

export default function PatientDetailScreen({ route }: any) {
  const { patientId } = route.params;
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const subscription = database
      .get<Patient>('patients')
      .findAndObserve(patientId)
      .subscribe((p) => setPatient(p));

    return () => subscription.unsubscribe();
  }, [patientId]);

  if (!patient) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  const details = [
    { label: 'Age', value: `${patient.age} years` },
    { label: 'Gender', value: patient.gender },
    { label: 'Phone', value: patient.phone || 'Not provided' },
    { label: 'Village', value: patient.village || 'Not provided' },
    { label: 'District', value: patient.district || 'Not provided' },
    { label: 'ABHA ID', value: patient.abhaId || 'Not linked' },
    { label: 'Sync Status', value: patient.isSynced ? 'Synced' : 'Pending' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-8 pb-8 px-6 items-center">
        <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-3">
          <Text className="text-white text-3xl font-bold">
            {patient.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="text-white text-xl font-bold">{patient.name}</Text>
      </View>

      {/* Details */}
      <View className="p-4">
        {details.map((d) => (
          <View
            key={d.label}
            className="bg-white rounded-lg p-4 mb-2 flex-row justify-between border border-gray-100"
          >
            <Text className="text-gray-500">{d.label}</Text>
            <Text className="text-gray-900 font-medium">{d.value}</Text>
          </View>
        ))}
      </View>

      {/* Health Logs placeholder */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Health Logs</Text>
        <View className="bg-white rounded-lg p-6 border border-gray-100 items-center">
          <Text className="text-gray-400">No health logs yet</Text>
        </View>
      </View>
    </ScrollView>
  );
}
