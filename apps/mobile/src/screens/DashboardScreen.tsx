import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../db';
import Patient from '../db/models/Patient';

interface DashboardCardProps {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress?: () => void;
}

function DashboardCard({ title, subtitle, icon, color, onPress }: DashboardCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
      style={{ elevation: 2 }}
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: color + '20' }}
        >
          <Text style={{ fontSize: 24 }}>{icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
          <Text className="text-sm text-gray-500">{subtitle}</Text>
        </View>
        <Text className="text-gray-400 text-xl">&rsaquo;</Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    const sub = database
      .get<Patient>('patients')
      .query()
      .observeCount()
      .subscribe((count) => setPatientCount(count));
    return () => sub.unsubscribe();
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-14 pb-6 px-6 rounded-b-3xl">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-sm opacity-80">Welcome back</Text>
            <Text className="text-white text-xl font-bold">
              {user?.name || user?.phone || 'User'}
            </Text>
          </View>
          <Pressable
            onPress={logout}
            className="bg-white/20 px-4 py-2 rounded-full"
          >
            <Text className="text-white text-sm font-medium">Logout</Text>
          </Pressable>
        </View>
      </View>

      {/* Cards */}
      <ScrollView className="flex-1 px-4 pt-6">
        <DashboardCard
          title="Patients"
          subtitle={`${patientCount} registered`}
          icon="👥"
          color="#2563EB"
          onPress={() => navigation.navigate('PatientList')}
        />
        <DashboardCard
          title="Symptom Check"
          subtitle="AI-powered health assessment"
          icon="🩺"
          color="#059669"
          onPress={() => navigation.navigate('SymptomChecker')}
        />
        <DashboardCard
          title="Voice Input"
          subtitle="Describe symptoms by voice"
          icon="🎤"
          color="#7C3AED"
          onPress={() => navigation.navigate('VoiceInput')}
        />
        <DashboardCard
          title="Scan Prescription"
          subtitle="Find affordable alternatives"
          icon="📋"
          color="#D97706"
          onPress={() => navigation.navigate('PrescriptionOCR')}
        />
        <DashboardCard
          title="Sahayak Mode"
          subtitle="Manage village health records"
          icon="🤝"
          color="#0891B2"
          onPress={() => navigation.navigate('Sahayak')}
        />
        <DashboardCard
          title="Emergency"
          subtitle="Call 108 for ambulance"
          icon="🚨"
          color="#DC2626"
        />

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
