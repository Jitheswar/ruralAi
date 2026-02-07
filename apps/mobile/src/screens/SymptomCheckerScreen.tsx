import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSymptomEngine } from '../hooks/useSymptomEngine';
import { getSymptomList } from '../engine/triageEngine';
import SymptomBubble from '../components/SymptomBubble';
import ChatMessage from '../components/ChatMessage';
import RedFlagAlert from '../components/RedFlagAlert';

type ChatStep = 'symptoms' | 'duration' | 'modifiers' | 'results';

export default function SymptomCheckerScreen() {
  const { user } = useAuth();
  const engine = useSymptomEngine();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState<ChatStep>('symptoms');
  const [showRedFlag, setShowRedFlag] = useState(false);
  const symptoms = getSymptomList();

  function handleNext() {
    if (step === 'symptoms' && engine.selectedSymptoms.length > 0) {
      setStep('duration');
    } else if (step === 'duration') {
      setStep('modifiers');
    } else if (step === 'modifiers') {
      const results = engine.evaluate();
      setStep('results');
      if (results.some((r) => r.severity === 'critical')) {
        setShowRedFlag(true);
      }
    }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function handleReset() {
    engine.reset();
    setStep('symptoms');
    setShowRedFlag(false);
  }

  const durationOptions = [1, 2, 3, 5, 7];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView ref={scrollRef} className="flex-1 px-4 pt-4">
        {/* Greeting */}
        <ChatMessage
          type="system"
          text={`Hi ${user?.name || 'there'}, how are you feeling today? Select your symptoms below.`}
        />

        {/* Symptom Selection */}
        {step === 'symptoms' && (
          <View className="mb-4">
            <View className="flex-row flex-wrap mt-2">
              {symptoms.map((s) => (
                <SymptomBubble
                  key={s.id}
                  id={s.id}
                  label={s.label}
                  category={s.category}
                  isSelected={engine.selectedSymptoms.includes(s.id)}
                  onToggle={engine.toggleSymptom}
                />
              ))}
            </View>
          </View>
        )}

        {/* Show selected symptoms as user message */}
        {step !== 'symptoms' && (
          <ChatMessage
            type="user"
            text={`I'm experiencing: ${engine.selectedSymptoms
              .map((id) => symptoms.find((s) => s.id === id)?.label || id)
              .join(', ')}`}
          />
        )}

        {/* Duration */}
        {(step === 'duration' || step === 'modifiers' || step === 'results') && (
          <>
            <ChatMessage
              type="system"
              text="How long have you had these symptoms?"
            />
            {step === 'duration' ? (
              <View className="flex-row flex-wrap mb-4">
                {durationOptions.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => engine.setDuration(d)}
                    className={`px-4 py-2 rounded-full m-1 ${
                      engine.duration === d ? 'bg-primary' : 'bg-white border border-gray-300'
                    }`}
                  >
                    <Text className={engine.duration === d ? 'text-white font-medium' : 'text-gray-700'}>
                      {d} {d === 1 ? 'day' : 'days'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <ChatMessage
                type="user"
                text={`About ${engine.duration} ${engine.duration === 1 ? 'day' : 'days'}`}
              />
            )}
          </>
        )}

        {/* Modifiers */}
        {(step === 'modifiers' || step === 'results') && (
          <>
            <ChatMessage
              type="system"
              text="Did the symptoms start suddenly?"
            />
            {step === 'modifiers' ? (
              <View className="flex-row mb-4">
                <Pressable
                  onPress={() => engine.toggleModifier('sudden_onset')}
                  className={`px-6 py-3 rounded-full mr-2 ${
                    engine.modifiers.includes('sudden_onset')
                      ? 'bg-primary'
                      : 'bg-white border border-gray-300'
                  }`}
                >
                  <Text
                    className={
                      engine.modifiers.includes('sudden_onset')
                        ? 'text-white font-medium'
                        : 'text-gray-700'
                    }
                  >
                    Yes, suddenly
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (engine.modifiers.includes('sudden_onset')) {
                      engine.toggleModifier('sudden_onset');
                    }
                  }}
                  className={`px-6 py-3 rounded-full ${
                    !engine.modifiers.includes('sudden_onset')
                      ? 'bg-primary'
                      : 'bg-white border border-gray-300'
                  }`}
                >
                  <Text
                    className={
                      !engine.modifiers.includes('sudden_onset')
                        ? 'text-white font-medium'
                        : 'text-gray-700'
                    }
                  >
                    Gradually
                  </Text>
                </Pressable>
              </View>
            ) : (
              <ChatMessage
                type="user"
                text={engine.modifiers.includes('sudden_onset') ? 'Yes, suddenly' : 'Gradually'}
              />
            )}
          </>
        )}

        {/* Results */}
        {step === 'results' && engine.results.length > 0 && (
          <>
            <ChatMessage type="system" text="Here's what I found:" />
            {engine.results.map((r) => (
              <View key={r.ruleId} className="mb-3">
                <ChatMessage
                  type="system"
                  text={r.message}
                  severity={r.severity}
                />
                {r.instructions.map((inst, i) => (
                  <View key={i} className="flex-row ml-4 mb-1">
                    <Text className="text-gray-500 text-xs mr-1">{i + 1}.</Text>
                    <Text className="text-gray-600 text-xs flex-1">{inst}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Bottom action bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        {step === 'results' ? (
          <Pressable
            onPress={handleReset}
            className="bg-gray-200 py-4 rounded-lg items-center"
          >
            <Text className="text-gray-700 font-semibold">Start Over</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            disabled={step === 'symptoms' && engine.selectedSymptoms.length === 0}
            className={`py-4 rounded-lg items-center ${
              step === 'symptoms' && engine.selectedSymptoms.length === 0
                ? 'bg-gray-300'
                : 'bg-primary'
            }`}
          >
            <Text className="text-white font-semibold">
              {step === 'modifiers' ? 'Check Symptoms' : 'Next'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Red Flag Alert Modal */}
      {engine.isEmergency && engine.results[0] && (
        <RedFlagAlert
          visible={showRedFlag}
          result={engine.results[0]}
          onDismiss={() => setShowRedFlag(false)}
        />
      )}
    </View>
  );
}
