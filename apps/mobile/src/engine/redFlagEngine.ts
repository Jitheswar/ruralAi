import { evaluateTriage, TriageResult } from './triageEngine';

export function evaluateRedFlags(symptoms: string[], modifiers: string[] = []): TriageResult[] {
  const results = evaluateTriage({
    symptoms,
    modifiers,
    duration_days: 0,
  });
  return results.filter((r) => r.severity === 'critical');
}

export function isEmergency(symptoms: string[], modifiers: string[] = []): boolean {
  return evaluateRedFlags(symptoms, modifiers).length > 0;
}

export function getEmergencyAction(symptoms: string[], modifiers: string[] = []) {
  const flags = evaluateRedFlags(symptoms, modifiers);
  if (flags.length === 0) return null;

  return {
    ...flags[0],
    ambulanceNumber: '108',
    alternateNumber: '102',
  };
}
