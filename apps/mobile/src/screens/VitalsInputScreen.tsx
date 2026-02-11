import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { database } from '../db';
import HealthLog from '../db/models/HealthLog';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { API_CONFIG } from '@rural-ai/shared';

const API_BASE_URL =
  Platform.OS === 'android' ? API_CONFIG.ANDROID_EMULATOR_URL : API_CONFIG.BASE_URL;

export default function VitalsInputScreen({ navigation, route }: any) {
    const { user } = useAuth();
    const patientId = route?.params?.patientId || null;

    // Vitals State
    const [temp, setTemp] = useState('');
    const [bpSys, setBpSys] = useState('');
    const [bpDia, setBpDia] = useState('');
    const [pulse, setPulse] = useState('');
    const [spo2, setSpo2] = useState('');
    const [respRate, setRespRate] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bloodSugar, setBloodSugar] = useState('');
    const [sugarType, setSugarType] = useState<'random' | 'fasting'>('random');

    const [saving, setSaving] = useState(false);

    async function saveToSupabase() {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const token = currentSession?.access_token;
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/vitals/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    patient_id: patientId,
                    temperature: temp || null,
                    bp_systolic: bpSys || null,
                    bp_diastolic: bpDia || null,
                    pulse: pulse || null,
                    spo2: spo2 || null,
                    respiratory_rate: respRate || null,
                    weight: weight || null,
                    height: height || null,
                    blood_sugar_value: bloodSugar || null,
                    blood_sugar_type: sugarType,
                }),
            });
            const data = await res.json();
            if (!data.success) {
                console.warn('Supabase vitals save failed:', data.error);
            }
        } catch (e) {
            console.warn('Failed to sync vitals to cloud:', e);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            // Save locally to WatermelonDB
            await database.write(async () => {
                await database.get<HealthLog>('health_logs').create((log) => {
                    log.patientId = patientId || user?.id || 'local';
                    log.logType = 'vitals';
                    log.dataJson = JSON.stringify({
                        temperature: temp,
                        bp: { systolic: bpSys, diastolic: bpDia },
                        pulse,
                        spo2,
                        respiratory_rate: respRate,
                        weight,
                        height,
                        blood_sugar: { value: bloodSugar, type: sugarType },
                    });
                    log.recordedBy = user?.id || 'local';
                    log.isSynced = false;
                });
            });

            // Also save to Supabase
            await saveToSupabase();

            Alert.alert('Success', 'Vitals recorded and saved to cloud');
            navigation.goBack();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save vitals');
        } finally {
            setSaving(false);
        }
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Record Vitals</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Temperature (°F)</Text>
                <TextInput
                    style={styles.input}
                    value={temp}
                    onChangeText={setTemp}
                    keyboardType="numeric"
                    placeholder="98.6"
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>BP Systolic</Text>
                    <TextInput
                        style={styles.input}
                        value={bpSys}
                        onChangeText={setBpSys}
                        keyboardType="numeric"
                        placeholder="120"
                    />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>BP Diastolic</Text>
                    <TextInput
                        style={styles.input}
                        value={bpDia}
                        onChangeText={setBpDia}
                        keyboardType="numeric"
                        placeholder="80"
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Pulse (bpm)</Text>
                    <TextInput
                        style={styles.input}
                        value={pulse}
                        onChangeText={setPulse}
                        keyboardType="numeric"
                        placeholder="72"
                    />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>SpO2 (%)</Text>
                    <TextInput
                        style={styles.input}
                        value={spo2}
                        onChangeText={setSpo2}
                        keyboardType="numeric"
                        placeholder="98"
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="60"
                />
            </View>

            <Pressable
                onPress={handleSave}
                disabled={saving}
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            >
                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Vitals'}</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#111827',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
    },
    row: {
        flexDirection: 'row',
    },
    saveButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 40,
    },
    saveButtonDisabled: {
        backgroundColor: '#93C5FD',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});
