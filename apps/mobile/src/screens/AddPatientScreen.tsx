import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
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
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Add Patient</Text>

        <Text style={styles.label}>Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Patient name"
          style={styles.input}
        />

        <Text style={styles.label}>Age *</Text>
        <TextInput
          value={age}
          onChangeText={setAge}
          placeholder="Age in years"
          keyboardType="number-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Gender *</Text>
        <View style={styles.genderContainer}>
          {genderOptions.map((g) => (
            <Pressable
              key={g}
              onPress={() => setGender(g)}
              style={[
                styles.genderButton,
                gender === g ? styles.genderButtonActive : styles.genderButtonInactive
              ]}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === g ? styles.genderButtonTextActive : styles.genderButtonTextInactive
                ]}
              >
                {g}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Mobile number"
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Village</Text>
        <TextInput
          value={village}
          onChangeText={setVillage}
          placeholder="Village name"
          style={styles.input}
        />

        <Text style={styles.label}>District</Text>
        <TextInput
          value={district}
          onChangeText={setDistrict}
          placeholder="District name"
          style={styles.input}
        />

        <Text style={styles.label}>ABHA ID</Text>
        <TextInput
          value={abhaId}
          onChangeText={setAbhaId}
          placeholder="XX-XXXX-XXXX-XXXX or name@abdm"
          style={styles.input}
        />

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveButton,
            saving ? styles.saveButtonDisabled : styles.saveButtonEnabled
          ]}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Patient'}
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          Works offline. Data syncs when internet is available.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  genderButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  genderButtonInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  genderButtonText: {
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  genderButtonTextInactive: {
    color: '#374151',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonEnabled: {
    backgroundColor: '#2563EB',
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
});
