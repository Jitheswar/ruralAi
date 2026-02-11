import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {patient.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.headerName}>{patient.name}</Text>
      </View>

      <View style={styles.detailsContainer}>
        {details.map((d) => (
          <View
            key={d.label}
            style={styles.detailRow}
          >
            <Text style={styles.detailLabel}>{d.label}</Text>
            <Text style={styles.detailValue}>{d.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Health Logs</Text>
        <View style={styles.logsEmpty}>
          <Text style={styles.logsEmptyText}>No health logs yet</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6B7280',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailLabel: {
    color: '#6B7280',
  },
  detailValue: {
    color: '#111827',
    fontWeight: '500',
  },
  logsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  logsEmpty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  logsEmptyText: {
    color: '#9CA3AF',
  },
});
