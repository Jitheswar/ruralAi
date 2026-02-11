import React from 'react';
import { View, Text, Pressable, Modal, Linking, Alert, StyleSheet } from 'react-native';
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
      <View style={styles.container}>
        {/* Warning icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>&#9888;&#65039;</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {result.name}
        </Text>

        {/* Message */}
        <Text style={styles.message}>
          {result.message}
        </Text>

        {/* Instructions */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>What to do:</Text>
          {result.instructions.map((instruction, i) => (
            <View key={i} style={styles.instructionRow}>
              <Text style={styles.instructionNumber}>{i + 1}.</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Call button */}
        <Pressable
          onPress={handleCall}
          style={styles.callButton}
        >
          <Text style={styles.callButtonText}>
            Call 108 (Ambulance)
          </Text>
        </Pressable>

        {/* Dismiss */}
        <Pressable
          onPress={handleDismiss}
          style={styles.dismissButton}
        >
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  instructionsBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  instructionsTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionNumber: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  callButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  callButtonText: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dismissButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
});
