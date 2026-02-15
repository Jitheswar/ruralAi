export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  village?: string;
  district?: string;
  abhaId?: string;
  createdBy: string;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}
