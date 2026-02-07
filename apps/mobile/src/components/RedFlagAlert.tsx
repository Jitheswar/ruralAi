import React from 'react';
import { View, Text, Pressable, Modal, Linking, Alert } from 'react-native';
import { TriageResult } from '../engine/triageEngine';

interface RedFlagAlertProps {
  visible: boolean;
  result: TriageResult;
  onDismiss: () => void;
}

export default function RedFlagAlert({ visible, result, onDismiss }: RedFlagAlertProps) {
  function handleCall() {
    Linking.openURL('tel:108');
  }

  function handleDismiss() {
    Alert.alert(
      'Are you sure?',
      'This appears to be a medical emergency. Are you sure you want to dismiss?',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Dismiss', style: 'destructive', onPress: onDismiss },
      ]
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-red-600 justify-center px-6">
        {/* Warning icon */}
        <View className="items-center mb-6">
          <Text style={{ fontSize: 64 }}>&#9888;&#65039;</Text>
        </View>

        {/* Title */}
        <Text className="text-white text-2xl font-bold text-center mb-2">
          {result.name}
        </Text>

        {/* Message */}
        <Text className="text-white/90 text-base text-center mb-8">
          {result.message}
        </Text>

        {/* Instructions */}
        <View className="bg-white/10 rounded-xl p-5 mb-8">
          <Text className="text-white font-semibold mb-3">What to do:</Text>
          {result.instructions.map((instruction, i) => (
            <View key={i} className="flex-row mb-2">
              <Text className="text-white font-bold mr-2">{i + 1}.</Text>
              <Text className="text-white/90 flex-1">{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Call button */}
        <Pressable
          onPress={handleCall}
          className="bg-white py-4 rounded-xl items-center mb-4"
        >
          <Text className="text-red-600 text-lg font-bold">
            Call 108 (Ambulance)
          </Text>
        </Pressable>

        {/* Dismiss */}
        <Pressable
          onPress={handleDismiss}
          className="py-3 items-center"
        >
          <Text className="text-white/60 text-sm">Dismiss</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
