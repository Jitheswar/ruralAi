import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { schema } from './schema';
import { migrations } from './migrations';
import Patient from './models/Patient';
import User from './models/User';
import HealthLog from './models/HealthLog';
import Medicine from './models/Medicine';

const adapter = new LokiJSAdapter({
  schema,
  migrations,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [User, Patient, HealthLog, Medicine],
});

// Seed medicine data on first run
export async function seedMedicines() {
  const count = await database.get<Medicine>('medicines').query().fetchCount();
  if (count > 0) return;

  const medicines = [
    { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', dosageForm: 'Tablet', price: 15, isNlem: true, janAushadhiPrice: 2.5, sideEffects: '["Nausea","Liver damage (overdose)"]' },
    { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', dosageForm: 'Capsule', price: 35, isNlem: true, janAushadhiPrice: 5, sideEffects: '["Diarrhea","Rash","Allergic reaction"]' },
    { name: 'Metformin 500mg', genericName: 'Metformin HCl', dosageForm: 'Tablet', price: 25, isNlem: true, janAushadhiPrice: 3, sideEffects: '["Nausea","Stomach upset","Lactic acidosis (rare)"]' },
    { name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', dosageForm: 'Tablet', price: 30, isNlem: true, janAushadhiPrice: 2, sideEffects: '["Swelling","Dizziness","Flushing"]' },
    { name: 'Atenolol 50mg', genericName: 'Atenolol', dosageForm: 'Tablet', price: 20, isNlem: true, janAushadhiPrice: 2.5, sideEffects: '["Fatigue","Cold hands","Dizziness"]' },
    { name: 'Omeprazole 20mg', genericName: 'Omeprazole', dosageForm: 'Capsule', price: 40, isNlem: true, janAushadhiPrice: 4, sideEffects: '["Headache","Nausea","Stomach pain"]' },
    { name: 'Azithromycin 500mg', genericName: 'Azithromycin', dosageForm: 'Tablet', price: 70, isNlem: true, janAushadhiPrice: 12, sideEffects: '["Diarrhea","Nausea","Stomach pain"]' },
    { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', dosageForm: 'Tablet', price: 10, isNlem: true, janAushadhiPrice: 1.5, sideEffects: '["Drowsiness","Dry mouth"]' },
    { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', dosageForm: 'Tablet', price: 12, isNlem: true, janAushadhiPrice: 2, sideEffects: '["Stomach upset","Headache","Dizziness"]' },
    { name: 'ORS Powder', genericName: 'Oral Rehydration Salts', dosageForm: 'Powder', price: 20, isNlem: true, janAushadhiPrice: 5, sideEffects: '["Vomiting (if taken too fast)"]' },
    { name: 'Iron + Folic Acid', genericName: 'Ferrous Sulphate + Folic Acid', dosageForm: 'Tablet', price: 15, isNlem: true, janAushadhiPrice: 1, sideEffects: '["Constipation","Dark stools","Nausea"]' },
    { name: 'Albendazole 400mg', genericName: 'Albendazole', dosageForm: 'Tablet', price: 10, isNlem: true, janAushadhiPrice: 2, sideEffects: '["Stomach pain","Nausea","Headache"]' },
    { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', dosageForm: 'Tablet', price: 45, isNlem: true, janAushadhiPrice: 6, sideEffects: '["Nausea","Diarrhea","Dizziness"]' },
    { name: 'Ranitidine 150mg', genericName: 'Ranitidine HCl', dosageForm: 'Tablet', price: 15, isNlem: true, janAushadhiPrice: 2, sideEffects: '["Headache","Constipation"]' },
    { name: 'Salbutamol Inhaler', genericName: 'Salbutamol', dosageForm: 'Inhaler', price: 120, isNlem: true, janAushadhiPrice: 30, sideEffects: '["Tremor","Headache","Fast heartbeat"]' },
    { name: 'Doxycycline 100mg', genericName: 'Doxycycline', dosageForm: 'Capsule', price: 35, isNlem: true, janAushadhiPrice: 5, sideEffects: '["Sun sensitivity","Nausea","Esophageal irritation"]' },
    { name: 'Losartan 50mg', genericName: 'Losartan Potassium', dosageForm: 'Tablet', price: 35, isNlem: true, janAushadhiPrice: 4, sideEffects: '["Dizziness","Fatigue","High potassium"]' },
    { name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', dosageForm: 'Tablet', price: 8, isNlem: true, janAushadhiPrice: 1, sideEffects: '["Stomach bleeding","Bruising"]' },
    { name: 'Chloroquine 250mg', genericName: 'Chloroquine Phosphate', dosageForm: 'Tablet', price: 12, isNlem: true, janAushadhiPrice: 2, sideEffects: '["Nausea","Headache","Vision changes"]' },
    { name: 'Vitamin D3 60000 IU', genericName: 'Cholecalciferol', dosageForm: 'Capsule', price: 30, isNlem: false, janAushadhiPrice: 8, sideEffects: '["Nausea (high dose)","Hypercalcemia (overdose)"]' },
  ];

  await database.write(async () => {
    const collection = database.get<Medicine>('medicines');
    for (const med of medicines) {
      await collection.create((m) => {
        m.name = med.name;
        m.genericName = med.genericName;
        m.dosageForm = med.dosageForm;
        m.price = med.price;
        m.isNlem = med.isNlem;
        m.janAushadhiPrice = med.janAushadhiPrice;
        m.sideEffects = med.sideEffects;
      });
    }
  });

  console.log(`[DB] Seeded ${medicines.length} medicines`);
}
