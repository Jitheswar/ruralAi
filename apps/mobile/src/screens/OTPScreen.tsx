import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import OTPInput from '../components/OTPInput';

export default function OTPScreen({ route }: any) {
  const { phone } = route.params;
  const { verifyOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleVerify(otp: string) {
    setError('');
    setLoading(true);
    try {
      const success = await verifyOtp(phone, otp);
      if (!success) {
        setError('Invalid OTP. Please try again.');
      }
      // On success, AuthContext updates -> RootNavigator auto-navigates to Dashboard
    } catch (e) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-2xl font-bold text-center mb-2">
        Verify OTP
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-8">
        Enter the 6-digit code sent to {phone}
      </Text>

      <OTPInput onComplete={handleVerify} />

      {loading && (
        <ActivityIndicator size="large" color="#2563EB" className="mt-6" />
      )}

      {error ? (
        <Text className="text-danger text-sm text-center mt-4">{error}</Text>
      ) : null}

      <Text className="text-xs text-gray-400 text-center mt-8">
        Dev mode: Use 123456
      </Text>
    </View>
  );
}
