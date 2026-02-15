import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Patient from '../db/models/Patient';

interface PatientCardProps {
  patient: Patient;
  onPress: () => void;
}

export default function PatientCard({ patient, onPress }: PatientCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { elevation: 1 }]}
    >
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {patient.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>
              {patient.name}
            </Text>
            <Text style={styles.patientDetails}>
              {patient.age} yrs &middot; {patient.gender}
              {patient.village ? ` &middot; ${patient.village}` : ''}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View
            style={[
              styles.syncIndicator,
              patient.isSynced ? styles.syncIndicatorSynced : styles.syncIndicatorPending
            ]}
          />
          <Text style={styles.syncText}>
            {patient.isSynced ? 'Synced' : 'Pending'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 18,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  patientDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  syncIndicator: {
    width: 12,
    height: 12,
    borderRadius: 9999,
  },
  syncIndicatorSynced: {
    backgroundColor: '#22C55E',
  },
  syncIndicatorPending: {
    backgroundColor: '#FB923C',
  },
  syncText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
