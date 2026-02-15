import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { database } from '../db';
import Patient from '../db/models/Patient';
import OutbreakAlertBanner from '../components/OutbreakAlertBanner';
import { LanguageSelector } from '../components/LanguageSelector';

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
      style={[styles.card, { elevation: 2 }]}
    >
      <View style={styles.cardRow}>
        <View
          style={[styles.iconContainer, { backgroundColor: color + '20' }]}
        >
          <Text style={{ fontSize: 24 }}>{icon}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.chevron}>&rsaquo;</Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>{t('auth.welcomeBack')}</Text>
            <Text style={styles.userName}>
              {user?.name || user?.email || 'User'}
            </Text>
          </View>
          <Pressable
            onPress={logout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          </Pressable>
        </View>
      </View>

      {/* Cards */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <OutbreakAlertBanner />

        <View style={styles.langRow}>
          <LanguageSelector />
        </View>

        <DashboardCard
          title={t('nav.patients')}
          subtitle={`${patientCount} registered`}
          icon="👥"
          color="#2563EB"
          onPress={() => navigation.navigate('PatientList')}
        />
        <DashboardCard
          title={t('symptom.checkSymptoms')}
          subtitle={t('symptom.describeSymptoms')}
          icon="🩺"
          color="#059669"
          onPress={() => navigation.navigate('SymptomChecker')}
        />
        <DashboardCard
          title={t('nav.voiceInput')}
          subtitle={t('symptom.voiceInput')}
          icon="🎤"
          color="#7C3AED"
          onPress={() => navigation.navigate('VoiceInput')}
        />
        <DashboardCard
          title={t('prescription.scan')}
          subtitle={t('prescription.medicineName')}
          icon="📋"
          color="#D97706"
          onPress={() => navigation.navigate('PrescriptionOCR')}
        />
        <DashboardCard
          title={t('nav.sahayak')}
          subtitle={t('nav.patients')}
          icon="🤝"
          color="#0891B2"
          onPress={() => navigation.navigate('Sahayak')}
        />
        <DashboardCard
          title={t('advice.emergency')}
          subtitle={t('advice.emergency')}
          icon="🚨"
          color="#DC2626"
        />

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
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  chevron: {
    color: '#9CA3AF',
    fontSize: 20,
  },
  langRow: {
    marginBottom: 16,
  },
  spacer: {
    height: 24,
  },
});
