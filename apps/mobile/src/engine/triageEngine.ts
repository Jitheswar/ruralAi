import jsonLogic from 'json-logic-js';
import emergencyRules from './protocols/emergency-triage.json';
import commonSymptoms from './protocols/common-symptoms.json';

export interface TriageInput {
  symptoms: string[];
  modifiers: string[];
  duration_days: number;
  age?: number;
  gender?: string;
}

export interface TriageResult {
  ruleId: string;
  name: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  instructions: string[];
  suggestedMedicine?: string | null;
}

export interface SymptomItem {
  id: string;
  label: string;
  icon: string;
  category: string;
}

export function evaluateTriage(input: TriageInput): TriageResult[] {
  const results: TriageResult[] = [];

  // Check emergency rules first (highest priority)
  for (const rule of emergencyRules.rules) {
    if (jsonLogic.apply(rule.rule as any, input)) {
      const severity = (['critical', 'warning', 'info'] as const).includes(
        rule.severity as any
      )
        ? (rule.severity as TriageResult['severity'])
        : 'critical';
      results.push({
        ruleId: rule.id,
        name: rule.name,
        severity,
        message: rule.action.message,
        instructions: rule.action.instructions,
      });
    }
  }

  // If any critical result found, return immediately
  if (results.some((r) => r.severity === 'critical')) {
    return results;
  }

  // Check common symptom rules
  for (const symptom of commonSymptoms.symptoms) {
    if (symptom.rule && jsonLogic.apply(symptom.rule as any, input)) {
      results.push({
        ruleId: symptom.id,
        name: symptom.label,
        severity: symptom.action.type as 'warning' | 'info',
        message: symptom.action.message,
        instructions: symptom.action.advice,
        suggestedMedicine: symptom.action.suggestedMedicine,
      });
    }
  }

  // If no rules matched, give a generic response
  if (results.length === 0 && input.symptoms.length > 0) {
    results.push({
      ruleId: 'generic',
      name: 'General Advice',
      severity: 'info',
      message: 'Based on your symptoms, we recommend monitoring your condition.',
      instructions: [
        'Rest and stay hydrated',
        'Monitor symptoms for any changes',
        'Visit the nearest PHC if symptoms worsen or persist beyond 2 days',
      ],
    });
  }

  return results;
}

export function getSymptomList(): SymptomItem[] {
  return commonSymptoms.symptomList;
}

export function getCategories(): string[] {
  const cats = new Set(commonSymptoms.symptomList.map((s) => s.category));
  return Array.from(cats);
}
