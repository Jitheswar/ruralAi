import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { isValidIndianPhone, formatPhone } from '@rural-ai/shared';

export default function LoginScreen({ navigation }: any) {
  const { sendOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOtp() {
    setError('');
    const formatted = formatPhone(phone);

    if (!isValidIndianPhone(formatted)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      const success = await sendOtp(formatted);
      if (success) {
        navigation.navigate('OTP', { phone: formatted });
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-center text-primary mb-2">
          Rural Health AI
        </Text>
        <Text className="text-base text-gray-500 text-center mb-10">
          Your health companion, online or offline
        </Text>

        <Text className="text-sm font-medium text-gray-700 mb-2">
          Mobile Number
        </Text>
        <View className="flex-row items-center border-2 border-gray-300 rounded-lg mb-4">
          <Text className="px-3 py-3 text-gray-500 border-r border-gray-300 bg-gray-50">
            +91
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter 10-digit number"
            keyboardType="phone-pad"
            maxLength={10}
            className="flex-1 px-3 py-3 text-base"
          />
        </View>

        {error ? (
          <Text className="text-danger text-sm mb-4">{error}</Text>
        ) : null}

        <Pressable
          onPress={handleSendOtp}
          disabled={loading || phone.length < 10}
          className={`py-4 rounded-lg items-center ${
            loading || phone.length < 10 ? 'bg-gray-300' : 'bg-primary'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Send OTP</Text>
          )}
        </Pressable>

        <Text className="text-xs text-gray-400 text-center mt-6">
          Dev mode: Use OTP 123456
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
