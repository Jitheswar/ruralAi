import { Model, Q } from '@nozbe/watermelondb';
import { field, text, readonly, date, children } from '@nozbe/watermelondb/decorators';

export default class Patient extends Model {
  static table = 'patients';

  static associations = {
    health_logs: { type: 'has_many' as const, foreignKey: 'patient_id' },
  } as const;

  @text('name') name: string;
  @field('age') age: number;
  @text('gender') gender: string;
  @text('phone') phone?: string;
  @text('village') village?: string;
  @text('district') district?: string;
  @text('abha_id') abhaId?: string;
  @text('created_by') createdBy: string;
  @field('is_synced') isSynced: boolean;
  @readonly @date('created_at') createdAt: Date;
  @date('updated_at') updatedAt: Date;

  @children('health_logs') healthLogs: any;
}
