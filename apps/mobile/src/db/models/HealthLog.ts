import { Model } from '@nozbe/watermelondb';
import { field, text, readonly, date, immutableRelation } from '@nozbe/watermelondb/decorators';

export default class HealthLog extends Model {
  static table = 'health_logs';

  static associations = {
    patients: { type: 'belongs_to' as const, key: 'patient_id' },
  } as const;

  @text('patient_id') patientId: string;
  @text('log_type') logType: string;
  @text('data_json') dataJson: string;
  @text('recorded_by') recordedBy: string;
  @field('is_synced') isSynced: boolean;
  @readonly @date('created_at') createdAt: Date;

  @immutableRelation('patients', 'patient_id') patient: any;
}
