import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
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
    navigation.navigate('SymptomChecker', { patientId: activeProfile.id });
  }

  function handleVoiceInput() {
    navigation.navigate('VoiceInput');
  }

  function handlePrescriptionScan() {
    navigation.navigate('PrescriptionOCR');
  }

  function handleRecordVitals() {
    if (!activeProfile) {
      Alert.alert(
        'Select a Profile',
        'Please select a managed profile before recording vitals.'
      );
      return;
    }
    navigation.navigate('VitalsInput', { patientId: activeProfile.id });
  }

  const isSahayak = user?.role === 'sahayak';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>Sahayak Mode</Text>
            <Text style={styles.headerTitle}>
              {user?.name || user?.email || 'Sahayak'}
            </Text>
          </View>
          <ProfileSwitcher
            currentProfile={activeProfile}
            profiles={MOCK_MANAGED_PROFILES}
            onSwitch={setActiveProfile}
          />
        </View>

        {activeProfile && (
          <View style={styles.activeProfileBanner}>
            <Text style={styles.activeProfileText}>
              Acting on behalf of: <Text style={styles.activeProfileName}>{activeProfile.name}</Text>
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
            <Text style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsRow}>
              <Pressable
                onPress={handleSymptomCheck}
                style={styles.quickActionButton}
              >
                <Text style={{ fontSize: 28 }}>🩺</Text>
                <Text style={styles.quickActionText}>Symptom Check</Text>
              </Pressable>
              <Pressable
                onPress={handleVoiceInput}
                style={styles.quickActionButton}
              >
                <Text style={{ fontSize: 28 }}>🎤</Text>
                <Text style={styles.quickActionText}>Voice Input</Text>
              </Pressable>
              <Pressable
                onPress={handlePrescriptionScan}
                style={styles.quickActionButton}
              >
                <Text style={{ fontSize: 28 }}>📋</Text>
                <Text style={styles.quickActionText}>Scan Rx</Text>
              </Pressable>
              <Pressable
                onPress={handleRecordVitals}
                style={styles.quickActionButtonLast}
              >
                <Text style={{ fontSize: 28 }}>💓</Text>
                <Text style={styles.quickActionText}>Vitals</Text>
              </Pressable>
            </View>

            <View style={styles.patientListHeader}>
              <Text style={styles.sectionTitle}>
                Managed Patients
              </Text>
              <Pressable onPress={handleAddPatient}>
                <Text style={styles.addButton}>+ Add</Text>
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handlePatientPress(item)}
            style={styles.patientItem}
          >
            <View
              style={[styles.patientAvatar, { backgroundColor: '#E5E7EB' }]}
            >
              <Text style={styles.patientAvatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{item.name}</Text>
              <Text style={styles.patientDetails}>
                {item.age}y · {item.gender} · {item.village}
              </Text>
            </View>
            <View
              style={[styles.syncIndicator, { backgroundColor: item.isSynced ? '#059669' : '#D97706' }]}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text style={styles.emptyStateText}>
              No patients registered yet.{'\n'}Tap "+ Add" to register a patient.
            </Text>
          </View>
        }
      />

      {!isSahayak && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            You are viewing Sahayak mode in demo. Assign 'sahayak' role for full access.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeProfileBanner: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeProfileText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  activeProfileName: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  quickActionButtonLast: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
    fontWeight: '500',
  },
  patientListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  patientItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  patientAvatarText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  patientDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  syncIndicator: {
    width: 8,
    height: 8,
    borderRadius: 9999,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  warningBanner: {
    backgroundColor: '#FFFBEB',
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  warningText: {
    color: '#854D0E',
    fontSize: 12,
    textAlign: 'center',
  },
});
