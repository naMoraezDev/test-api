import {
  PreferenceModel,
  PreferenceDocument,
} from '../models/preferences.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PreferencesRepository {
  async create(
    data: Partial<PreferenceDocument & { uid: string }>,
  ): Promise<PreferenceDocument> {
    return await PreferenceModel.create(data);
  }

  async update(
    uid: string,
    data: Partial<PreferenceDocument>,
  ): Promise<PreferenceDocument> {
    return await PreferenceModel.update(uid, data);
  }

  async get(uid: string): Promise<PreferenceDocument> {
    return await PreferenceModel.get(uid);
  }

  async query(field: string, equal: string) {
    return await PreferenceModel.query(field).eq(equal).exec();
  }
}
