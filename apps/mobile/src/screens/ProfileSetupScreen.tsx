import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '@rural-ai/shared';
import type { UserRole } from '@rural-ai/shared';

const roles: UserRole[] = ['citizen', 'sahayak', 'admin'];

export default function ProfileSetupScreen() {
  const { completeProfile } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleComplete() {
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const success = await completeProfile(password, name.trim(), role);
      if (!success) {
        setError('Failed to complete registration. Please try again.');
      }
    } catch (_e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Set up your account details to get started.
        </Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          autoCapitalize="words"
          style={styles.input}
        />

        <Text style={styles.label}>Password *</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password (min 6 characters)"
          secureTextEntry
          style={styles.input}
        />

        <Text style={styles.label}>I am a *</Text>
        <View style={styles.roleContainer}>
          {roles.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              style={[
                styles.roleButton,
                role === r ? styles.roleButtonActive : styles.roleButtonInactive,
              ]}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === r ? styles.roleButtonTextActive : styles.roleButtonTextInactive,
                ]}
              >
                {ROLE_LABELS[r]}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <Pressable
          onPress={handleComplete}
          disabled={loading || !name.trim() || password.length < 6}
          style={[
            styles.button,
            (loading || !name.trim() || password.length < 6) ? styles.buttonDisabled : styles.buttonActive,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Complete Registration</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  roleContainer: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 24,
  },
  roleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  roleButtonInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  roleButtonTextInactive: {
    color: '#374151',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonActive: {
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
