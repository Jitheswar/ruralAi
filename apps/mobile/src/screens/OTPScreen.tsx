import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import OTPInput from '../components/OTPInput';

export default function OTPScreen({ route }: any) {
  const { email } = route.params;
  const { verifyOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleVerify(otp: string) {
    setError('');
    setLoading(true);
    try {
      const success = await verifyOtp(email, otp);
      if (!success) {
        setError('Invalid code. Please try again.');
      }
      // On success, auth state change will auto-navigate to Dashboard
    } catch (_e) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {email}
      </Text>

      <OTPInput onComplete={handleVerify} />

      {loading && (
        <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
      )}

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      <Text style={styles.resendText}>
        Didn't receive code? Resend in 30s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  loader: {
    marginTop: 24,
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 32,
  },
});
