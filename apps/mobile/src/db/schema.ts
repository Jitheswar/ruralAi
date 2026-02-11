import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'email', type: 'string', isOptional: true },
        { name: 'phone', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'abha_id', type: 'string', isOptional: true },
        { name: 'is_verified', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'patients',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'age', type: 'number' },
        { name: 'gender', type: 'string' },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'village', type: 'string', isOptional: true },
        { name: 'district', type: 'string', isOptional: true },
        { name: 'abha_id', type: 'string', isOptional: true },
        { name: 'created_by', type: 'string' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'health_logs',
      columns: [
        { name: 'patient_id', type: 'string' },
        { name: 'log_type', type: 'string' },
        { name: 'data_json', type: 'string' },
        { name: 'recorded_by', type: 'string' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'medicines',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'generic_name', type: 'string' },
        { name: 'dosage_form', type: 'string' },
        { name: 'price', type: 'number', isOptional: true },
        { name: 'is_nlem', type: 'boolean' },
        { name: 'jan_aushadhi_price', type: 'number', isOptional: true },
        { name: 'side_effects', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
