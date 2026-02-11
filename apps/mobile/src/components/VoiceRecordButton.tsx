import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';

interface VoiceRecordButtonProps {
  isRecording: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  disabled?: boolean;
}

export default function VoiceRecordButton({
  isRecording,
  onPressIn,
  onPressOut,
  disabled = false,
}: VoiceRecordButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  return (
    <View style={styles.container}>
      {isRecording && (
        <Animated.View
          style={{
            position: 'absolute',
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            transform: [{ scale: pulseAnim }],
          }}
        />
      )}

      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: isRecording ? '#DC2626' : disabled ? '#D1D5DB' : '#2563EB',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
      >
        <Text style={{ fontSize: 40 }}>{isRecording ? '⏹' : '🎤'}</Text>
      </Pressable>

      <Text style={styles.label}>
        {isRecording ? 'Recording... Release to stop' : disabled ? 'Processing...' : 'Hold to speak'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});
