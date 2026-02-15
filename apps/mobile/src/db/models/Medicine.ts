import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class Medicine extends Model {
  static table = 'medicines';

  @text('name') name: string;
  @text('generic_name') genericName: string;
  @text('dosage_form') dosageForm: string;
  @field('price') price?: number;
  @field('is_nlem') isNlem: boolean;
  @field('jan_aushadhi_price') janAushadhiPrice?: number;
  @text('side_effects') sideEffects?: string;
  @date('updated_at') updatedAt: Date;
}
