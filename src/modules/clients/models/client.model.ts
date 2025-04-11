import * as dotenv from 'dotenv';
import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { ClientSchema } from '../schemas/client.schema';

dotenv.config();

const tableName = process.env.DYNAMODB_CLIENTS_TABLENAME || '';

export const ClientModel = dynamoose.model<ClientDocument>(
  tableName,
  ClientSchema,
);

export interface ClientDocument extends Item {
  name?: string | null;
  active?: boolean | null;
  clientId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  redirectUri?: string | null;
  clientSecret?: string | null;
}
