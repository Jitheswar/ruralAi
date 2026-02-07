export type LogType = 'vitals' | 'symptom' | 'prescription' | 'triage';

export interface HealthLog {
  id: string;
  patientId: string;
  logType: LogType;
  dataJson: string;
  recordedBy: string;
  isSynced: boolean;
  createdAt: string;
}

export interface VitalsData {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodSugar?: number;
  spO2?: number;
  height?: number;
  weight?: number;
  temperature?: number;
}

export interface SymptomData {
  symptoms: string[];
  duration_days: number;
  modifiers: string[];
  severity: 'critical' | 'warning' | 'info';
  triageMessage?: string;
}
