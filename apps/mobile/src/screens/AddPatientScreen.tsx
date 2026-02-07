import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { database } from '../db';
import Patient from '../db/models/Patient';
import { useAuth } from '../contexts/AuthContext';

export default function AddPatientScreen({ navigation }: any) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [saving, setSaving] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other'];

  async function handleSave() {
    if (!name.trim() || !age || !gender) {
      Alert.alert('Required', 'Please fill in Name, Age, and Gender');
      return;
    }

    setSaving(true);
    try {
      await database.write(async () => {
        await database.get<Patient>('patients').create((p) => {
          p.name = name.trim();
          p.age = parseInt(age, 10);
          p.gender = gender.toLowerCase();
          p.phone = phone.trim() || undefined;
          p.village = village.trim() || undefined;
          p.district = district.trim() || undefined;
          p.abhaId = abhaId.trim() || undefined;
          p.createdBy = user?.id || 'unknown';
          p.isSynced = false;
        });
      });

      Alert.alert('Success', 'Patient added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error('Failed to save patient:', e);
      Alert.alert('Error', 'Failed to save patient. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Add Patient</Text>

        {/* Name */}
        <Text className="text-sm font-medium text-gray-700 mb-1">Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Patient name"
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        />

        {/* Age */}
        <Text className="text-sm font-medium text-gray-700 mb-1">Age *</Text>
        <TextInput
          value={age}
          onChangeText={setAge}
          placeholder="Age in years"
          keyboardType="number-pad"
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        />

        {/* Gender */}
        <Text className="text-sm font-medium text-gray-700 mb-1">Gender *</Text>
        <View className="flex-row gap-2 mb-4">
          {genderOptions.map((g) => (
            <Pressable
              key={g}
              onPress={() => setGender(g)}
              className={`flex-1 py-3 rounded-lg items-center border ${
                gender === g
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-300'
              }`}
            >
              <Text
                className={`font-medium ${
                  gender === g ? 'text-white' : 'text-gray-700'
                }`}
              >
                {g}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Phone */}
        <Text className="text-sm font-medium text-gray-700 mb-1">Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Mobile number"
          keyboardType="phone-pad"
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        />

        {/* Village */}
        <Text className="text-sm font-medium text-gray-700 mb-1">Village</Text>
        <TextInput
          value={village}
          onChangeText={setVillage}
          placeholder="Village name"
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        />

        {/* District */}
        <Text className="text-sm font-medium text-gray-700 mb-1">District</Text>
        <TextInput
          value={district}
          onChangeText={setDistrict}
          placeholder="District name"
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        />

        {/* ABHA ID */}
        <Text className="text-sm font-medium text-gray-700 mb-1">ABHA ID</Text>
        <TextInput
          value={abhaId}
          onChangeText={setAbhaId}
          placeholder="XX-XXXX-XXXX-XXXX or name@abdm"
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        />

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className={`py-4 rounded-lg items-center mt-2 ${
            saving ? 'bg-gray-300' : 'bg-primary'
          }`}
        >
          <Text className="text-white font-semibold text-base">
            {saving ? 'Saving...' : 'Save Patient'}
          </Text>
        </Pressable>

        <Text className="text-xs text-gray-400 text-center mt-4">
          Works offline. Data syncs when internet is available.
        </Text>
      </View>
    </ScrollView>
  );
}
