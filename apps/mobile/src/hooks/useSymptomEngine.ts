import { useState, useCallback } from 'react';
import { evaluateTriage, TriageInput, TriageResult } from '../engine/triageEngine';
import { database } from '../db';
import HealthLog from '../db/models/HealthLog';

export function useSymptomEngine() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [duration, setDuration] = useState(1);
  const [results, setResults] = useState<TriageResult[]>([]);
  const [isEvaluated, setIsEvaluated] = useState(false);

  const addSymptom = useCallback((id: string) => {
    setSelectedSymptoms((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeSymptom = useCallback((id: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== id));
  }, []);

  const toggleSymptom = useCallback((id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const toggleModifier = useCallback((id: string) => {
    setModifiers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }, []);

  const evaluate = useCallback(() => {
    const input: TriageInput = {
      symptoms: selectedSymptoms,
      modifiers,
      duration_days: duration,
    };
    const triageResults = evaluateTriage(input);
    setResults(triageResults);
    setIsEvaluated(true);
    return triageResults;
  }, [selectedSymptoms, modifiers, duration]);

  const isEmergency = results.some((r) => r.severity === 'critical');

  const saveToHealthLog = useCallback(
    async (patientId: string, recordedBy: string) => {
      await database.write(async () => {
        await database.get<HealthLog>('health_logs').create((log) => {
          log.patientId = patientId;
          log.logType = 'triage';
          log.dataJson = JSON.stringify({
            symptoms: selectedSymptoms,
            modifiers,
            duration_days: duration,
            results: results.map((r) => ({
              ruleId: r.ruleId,
              severity: r.severity,
              message: r.message,
            })),
          });
          log.recordedBy = recordedBy;
          log.isSynced = false;
        });
      });
    },
    [selectedSymptoms, modifiers, duration, results]
  );

  const reset = useCallback(() => {
    setSelectedSymptoms([]);
    setModifiers([]);
    setDuration(1);
    setResults([]);
    setIsEvaluated(false);
  }, []);

  return {
    selectedSymptoms,
    modifiers,
    duration,
    results,
    isEvaluated,
    isEmergency,
    addSymptom,
    removeSymptom,
    toggleSymptom,
    toggleModifier,
    setDuration,
    evaluate,
    saveToHealthLog,
    reset,
  };
}
