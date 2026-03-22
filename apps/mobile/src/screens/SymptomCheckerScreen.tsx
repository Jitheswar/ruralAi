import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSymptomEngine } from '../hooks/useSymptomEngine';
import { getSymptomList } from '../engine/triageEngine';
import SymptomBubble from '../components/SymptomBubble';
import ChatMessage from '../components/ChatMessage';
import RedFlagAlert from '../components/RedFlagAlert';
import { useRoute } from '@react-navigation/native';

type ChatStep = 'symptoms' | 'duration' | 'modifiers' | 'results';

export default function SymptomCheckerScreen() {
  const { user } = useAuth();
  const engine = useSymptomEngine();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState<ChatStep>('symptoms');
  const [showRedFlag, setShowRedFlag] = useState(false);
  const symptoms = getSymptomList();
  const route = useRoute<any>();

  // Apply preselected symptoms from voice input on mount
  useEffect(() => {
    const preselected = route.params?.preselectedSymptoms as string[] | undefined;
    if (preselected?.length) {
      preselected.forEach((id) => engine.addSymptom(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <View style={styles.container}>
      <ScrollView ref={scrollRef} style={styles.scrollView}>
        {/* Greeting */}
        <ChatMessage
          type="system"
          text={`Hi ${user?.name || 'there'}, how are you feeling today? Select your symptoms below.`}
        />

        {/* Symptom Selection */}
        {step === 'symptoms' && (
          <View style={styles.symptomSection}>
            <View style={styles.symptomList}>
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
              <View style={styles.durationContainer}>
                {durationOptions.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => engine.setDuration(d)}
                    style={[
                      styles.durationButton,
                      engine.duration === d ? styles.durationButtonSelected : styles.durationButtonUnselected
                    ]}
                  >
                    <Text style={engine.duration === d ? styles.durationTextSelected : styles.durationTextUnselected}>
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
              <View style={styles.modifiersContainer}>
                <Pressable
                  onPress={() => engine.toggleModifier('sudden_onset')}
                  style={[
                    styles.modifierButton,
                    styles.modifierButtonLeft,
                    engine.modifiers.includes('sudden_onset')
                      ? styles.modifierButtonSelected
                      : styles.modifierButtonUnselected
                  ]}
                >
                  <Text
                    style={
                      engine.modifiers.includes('sudden_onset')
                        ? styles.modifierTextSelected
                        : styles.modifierTextUnselected
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
                  style={[
                    styles.modifierButton,
                    !engine.modifiers.includes('sudden_onset')
                      ? styles.modifierButtonSelected
                      : styles.modifierButtonUnselected
                  ]}
                >
                  <Text
                    style={
                      !engine.modifiers.includes('sudden_onset')
                        ? styles.modifierTextSelected
                        : styles.modifierTextUnselected
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
              <View key={r.ruleId} style={styles.resultItem}>
                <ChatMessage
                  type="system"
                  text={r.message}
                  severity={r.severity}
                />
                {r.instructions.map((inst, i) => (
                  <View key={i} style={styles.instructionRow}>
                    <Text style={styles.instructionNumber}>{i + 1}.</Text>
                    <Text style={styles.instructionText}>{inst}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        {step === 'results' ? (
          <Pressable
            onPress={handleReset}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>Start Over</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            disabled={step === 'symptoms' && engine.selectedSymptoms.length === 0}
            style={[
              styles.nextButton,
              step === 'symptoms' && engine.selectedSymptoms.length === 0
                ? styles.nextButtonDisabled
                : styles.nextButtonEnabled
            ]}
          >
            <Text style={styles.nextButtonText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  symptomSection: {
    marginBottom: 16,
  },
  symptomList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    margin: 4,
  },
  durationButtonSelected: {
    backgroundColor: '#2563EB',
  },
  durationButtonUnselected: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  durationTextSelected: {
    color: '#ffffff',
    fontWeight: '500',
  },
  durationTextUnselected: {
    color: '#374151',
  },
  modifiersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modifierButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  modifierButtonLeft: {
    marginRight: 8,
  },
  modifierButtonSelected: {
    backgroundColor: '#2563EB',
  },
  modifierButtonUnselected: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  modifierTextSelected: {
    color: '#ffffff',
    fontWeight: '500',
  },
  modifierTextUnselected: {
    color: '#374151',
  },
  resultItem: {
    marginBottom: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    marginLeft: 16,
    marginBottom: 4,
  },
  instructionNumber: {
    color: '#6B7280',
    fontSize: 12,
    marginRight: 4,
  },
  instructionText: {
    color: '#4B5563',
    fontSize: 12,
    flex: 1,
  },
  spacer: {
    height: 96,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resetButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonEnabled: {
    backgroundColor: '#2563EB',
  },
  nextButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
