import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { database } from '../db';
import { Q } from '@nozbe/watermelondb';
import Patient from '../db/models/Patient';
import PatientCard from '../components/PatientCard';
import { syncWithServer } from '../sync/syncAdapter';

export default function PatientListScreen({ navigation }: any) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const subscription = database
      .get<Patient>('patients')
      .query(Q.sortBy('created_at', Q.desc))
      .observe()
      .subscribe((records) => {
        setPatients(records);
      });

    return () => subscription.unsubscribe();
  }, []);

  const filteredPatients = search
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.village && p.village.toLowerCase().includes(search.toLowerCase()))
      )
    : patients;

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await syncWithServer();
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search patients..."
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PatientCard
            patient={item}
            onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No patients yet</Text>
            <Text style={styles.emptySubtext}>
              Tap + to add your first patient
            </Text>
          </View>
        }
      />

      <Pressable
        onPress={() => navigation.navigate('AddPatient')}
        style={[styles.fab, { elevation: 5 }]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
  },
});
