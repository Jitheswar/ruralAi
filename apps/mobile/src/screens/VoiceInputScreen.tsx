import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
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
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ alignItems: 'center' }}>
        {/* Title */}
        <Text className="text-xl font-bold text-gray-900 mb-2">Voice Input</Text>
        <Text className="text-sm text-gray-500 text-center mb-8 px-4">
          Describe your symptoms in Hindi or English. We'll translate and identify medical terms.
        </Text>

        {/* Recording button */}
        <View className="my-8">
          <VoiceRecordButton
            isRecording={state === 'recording'}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={state === 'processing'}
          />
        </View>

        {/* Processing indicator */}
        {state === 'processing' && (
          <View className="bg-blue-50 rounded-xl p-4 w-full mb-4">
            <Text className="text-blue-700 text-center">
              Processing your voice input...
            </Text>
          </View>
        )}

        {/* Results */}
        {result && state === 'done' && (
          <View className="w-full">
            {/* Hindi text */}
            {result.hindi_text ? (
              <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
                <Text className="text-xs text-gray-400 mb-1">Hindi</Text>
                <Text className="text-base text-gray-800">{result.hindi_text}</Text>
              </View>
            ) : null}

            {/* English translation */}
            <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
              <Text className="text-xs text-gray-400 mb-1">English</Text>
              <Text className="text-base text-gray-800">{result.english_text}</Text>
            </View>

            {/* Medical terms */}
            {result.medical_terms.length > 0 && (
              <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
                <Text className="text-xs text-gray-400 mb-2">Medical Terms Identified</Text>
                {result.medical_terms.map((term, i) => (
                  <View key={i} className="flex-row items-center mb-1">
                    <View
                      className="w-2 h-2 rounded-full mr-2"
                      style={{
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
                      }}
                    />
                    <Text className="text-gray-800 flex-1">{term.term}</Text>
                    <Text className="text-gray-400 text-xs">{term.snomed_code}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Confidence */}
            <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-400">Confidence</Text>
                <Text className="text-sm font-semibold text-gray-700">
                  {Math.round(result.confidence * 100)}%
                </Text>
              </View>
              <View className="bg-gray-200 h-2 rounded-full mt-2">
                <View
                  className="h-2 rounded-full"
                  style={{
                    width: `${result.confidence * 100}%`,
                    backgroundColor: result.confidence > 0.8 ? '#059669' : '#D97706',
                  }}
                />
              </View>
            </View>

            {/* Actions */}
            {result.suggested_symptoms.length > 0 && (
              <Pressable
                onPress={handleUseSymptoms}
                className="bg-primary py-4 rounded-xl items-center mb-3"
              >
                <Text className="text-white font-semibold">
                  Use These Symptoms ({result.suggested_symptoms.length})
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleReset}
              className="bg-gray-200 py-3 rounded-xl items-center mb-8"
            >
              <Text className="text-gray-700 font-medium">Try Again</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
