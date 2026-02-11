import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import VoiceRecordButton from '../components/VoiceRecordButton';
import { transcribeAudio, TranscriptionResult } from '../services/aiService';

type RecordingState = 'idle' | 'recording' | 'processing' | 'done';

export default function VoiceInputScreen({ navigation, route }: any) {
  const [state, setState] = useState<RecordingState>('idle');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const recordingRef = useRef<any>(null);

  async function handlePressIn() {
    try {
      // In production: use expo-av Audio.Recording
      // For now, we simulate recording start
      setState('recording');
      console.log('[Voice] Recording started (mock)');
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Could not start recording. Please check microphone permissions.');
    }
  }

  async function handlePressOut() {
    try {
      setState('processing');

      // In production: stop recording and get URI from expo-av
      // For now, simulate with a mock URI
      const mockUri = 'file:///mock-recording.m4a';

      // Stop recording if active
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        // const uri = recordingRef.current.getURI();
        recordingRef.current = null;
      }

      const transcription = await transcribeAudio(mockUri);
      setResult(transcription);
      setState('done');
    } catch (err) {
      console.error('Failed to process recording:', err);
      setState('idle');
      Alert.alert('Error', 'Could not process recording. Please try again.');
    }
  }

  function handleUseSymptoms() {
    if (result?.suggested_symptoms && result.suggested_symptoms.length > 0) {
      navigation.navigate('SymptomChecker', {
        preselectedSymptoms: result.suggested_symptoms,
      });
    }
  }

  function handleReset() {
    setResult(null);
    setState('idle');
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ alignItems: 'center' }}>
        <Text style={styles.title}>Voice Input</Text>
        <Text style={styles.subtitle}>
          Describe your symptoms in Hindi or English. We'll translate and identify medical terms.
        </Text>

        <View style={styles.recordingButtonContainer}>
          <VoiceRecordButton
            isRecording={state === 'recording'}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={state === 'processing'}
          />
        </View>

        {state === 'processing' && (
          <View style={styles.processingContainer}>
            <Text style={styles.processingText}>
              Processing your voice input...
            </Text>
          </View>
        )}

        {result && state === 'done' && (
          <View style={styles.resultsContainer}>
            {result.hindi_text ? (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Hindi</Text>
                <Text style={styles.resultText}>{result.hindi_text}</Text>
              </View>
            ) : null}

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>English</Text>
              <Text style={styles.resultText}>{result.english_text}</Text>
            </View>

            {result.medical_terms.length > 0 && (
              <View style={styles.resultCard}>
                <Text style={styles.medicalTermsLabel}>Medical Terms Identified</Text>
                {result.medical_terms.map((term, i) => (
                  <View key={i} style={styles.medicalTermRow}>
                    <View
                      style={[
                        styles.medicalTermDot,
                        {
                          backgroundColor:
                            term.category === 'cardiac'
                              ? '#DC2626'
                              : term.category === 'neuro'
                              ? '#4F46E5'
                              : term.category === 'respiratory'
                              ? '#2563EB'
                              : term.category === 'gastro'
                              ? '#D97706'
                              : '#6B7280',
                        }
                      ]}
                    />
                    <Text style={styles.medicalTermText}>{term.term}</Text>
                    <Text style={styles.medicalTermCode}>{term.snomed_code}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.confidenceCard}>
              <View style={styles.confidenceHeader}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <Text style={styles.confidenceValue}>
                  {Math.round(result.confidence * 100)}%
                </Text>
              </View>
              <View style={styles.confidenceBarBackground}>
                <View
                  style={[
                    styles.confidenceBarFill,
                    {
                      width: `${result.confidence * 100}%`,
                      backgroundColor: result.confidence > 0.8 ? '#059669' : '#D97706',
                    }
                  ]}
                />
              </View>
            </View>

            {result.suggested_symptoms.length > 0 && (
              <Pressable
                onPress={handleUseSymptoms}
                style={styles.useSymptomsButton}
              >
                <Text style={styles.useSymptomsText}>
                  Use These Symptoms ({result.suggested_symptoms.length})
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleReset}
              style={styles.tryAgainButton}
            >
              <Text style={styles.tryAgainText}>Try Again</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  recordingButtonContainer: {
    marginVertical: 32,
  },
  processingContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  processingText: {
    color: '#1D4ED8',
    textAlign: 'center',
  },
  resultsContainer: {
    width: '100%',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  resultLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 16,
    color: '#1F2937',
  },
  medicalTermsLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  medicalTermRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  medicalTermDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    marginRight: 8,
  },
  medicalTermText: {
    color: '#1F2937',
    flex: 1,
  },
  medicalTermCode: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  confidenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  confidenceBarBackground: {
    backgroundColor: '#E5E7EB',
    height: 8,
    borderRadius: 9999,
    marginTop: 8,
  },
  confidenceBarFill: {
    height: 8,
    borderRadius: 9999,
  },
  useSymptomsButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  useSymptomsText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tryAgainButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  tryAgainText: {
    color: '#374151',
    fontWeight: '500',
  },
});
