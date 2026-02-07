export interface MockPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  village: string;
  district: string;
  abhaId?: string;
  createdBy: string;
  isSynced: boolean;
  createdAt: string;
}

export const mockPatients: MockPatient[] = [
  { id: '1', name: 'Ramesh Kumar', age: 45, gender: 'male', phone: '+919876543210', village: 'Chandpur', district: 'Varanasi', abhaId: '91-1234-5678-9012', createdBy: 'sahayak_001', isSynced: true, createdAt: '2026-01-15' },
  { id: '2', name: 'Sunita Devi', age: 32, gender: 'female', phone: '+919876543211', village: 'Rampur', district: 'Varanasi', createdBy: 'sahayak_001', isSynced: true, createdAt: '2026-01-18' },
  { id: '3', name: 'Mohan Lal', age: 67, gender: 'male', phone: '+919876543212', village: 'Chandpur', district: 'Varanasi', abhaId: '91-2345-6789-0123', createdBy: 'sahayak_002', isSynced: false, createdAt: '2026-01-20' },
  { id: '4', name: 'Priya Sharma', age: 28, gender: 'female', phone: '+919876543213', village: 'Kashi', district: 'Varanasi', createdBy: 'self', isSynced: true, createdAt: '2026-02-01' },
  { id: '5', name: 'Balram Singh', age: 55, gender: 'male', phone: '+919876543214', village: 'Sarnath', district: 'Varanasi', createdBy: 'sahayak_001', isSynced: true, createdAt: '2026-02-03' },
];
