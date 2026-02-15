import { Model } from '@nozbe/watermelondb';
import { field, text, readonly, date } from '@nozbe/watermelondb/decorators';

export default class User extends Model {
  static table = 'users';

  @text('email') email?: string;
  @text('phone') phone: string;
  @text('name') name: string;
  @text('role') role: string;
  @text('abha_id') abhaId?: string;
  @field('is_verified') isVerified: boolean;
  @readonly @date('created_at') createdAt: Date;
  @date('updated_at') updatedAt: Date;
}
