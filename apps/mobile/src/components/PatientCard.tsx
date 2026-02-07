import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Patient from '../db/models/Patient';

interface PatientCardProps {
  patient: Patient;
  onPress: () => void;
}

export default function PatientCard({ patient, onPress }: PatientCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
      style={{ elevation: 1 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
            <Text className="text-primary font-bold text-lg">
              {patient.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {patient.name}
            </Text>
            <Text className="text-sm text-gray-500">
              {patient.age} yrs &middot; {patient.gender}
              {patient.village ? ` &middot; ${patient.village}` : ''}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <View
            className={`w-3 h-3 rounded-full ${
              patient.isSynced ? 'bg-green-500' : 'bg-orange-400'
            }`}
          />
          <Text className="text-xs text-gray-400 mt-1">
            {patient.isSynced ? 'Synced' : 'Pending'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
