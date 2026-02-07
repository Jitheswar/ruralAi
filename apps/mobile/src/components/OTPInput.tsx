import React, { useRef, useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

export default function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  function handleChange(text: string, index: number) {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '')) {
      onComplete(newOtp.join(''));
    }
  }

  function handleKeyPress(e: any, index: number) {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  return (
    <View className="flex-row justify-center gap-2">
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputs.current[index] = ref; }}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          className="w-12 h-14 border-2 border-gray-300 rounded-lg text-center text-xl font-bold bg-white"
          style={{ fontSize: 22 }}
        />
      ))}
    </View>
  );
}
