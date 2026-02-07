import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Pressable, RefreshControl } from 'react-native';
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
    <View className="flex-1 bg-gray-50">
      {/* Search */}
      <View className="px-4 pt-4 pb-2">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search patients..."
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
        />
      </View>

      {/* List */}
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
          <View className="items-center py-12">
            <Text className="text-gray-400 text-base">No patients yet</Text>
            <Text className="text-gray-400 text-sm mt-1">
              Tap + to add your first patient
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => navigation.navigate('AddPatient')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </Pressable>
    </View>
  );
}
