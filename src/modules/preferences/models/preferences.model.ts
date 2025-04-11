import * as dotenv from 'dotenv';
import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { PreferenceSchema } from '../schemas/preference.schema';

dotenv.config();

const tableName = process.env.DYNAMODB_PREFERENCES_TABLENAME || '';

export const PreferenceModel = dynamoose.model<PreferenceDocument>(
  tableName,
  PreferenceSchema,
);

export interface PreferenceDocument extends Item {
  uid?: string | null;
  cpf?: string | null;
  team?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  phoneNumber?: string | null;
  likedPosts?: string[] | null;
  loyaltyUserId?: number | null;
  termsAccepted?: boolean | null;
  newsletterAccepted?: boolean | null;
  loyaltyActiveSubscription?: string | null;
}
