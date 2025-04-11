import { promisify } from 'util';
import { Injectable } from '@nestjs/common';
import * as sendpulseApi from 'sendpulse-api';
import { sendpulseInit } from 'src/config/sendpulse.config';

const SENDPULSE_ADDRESS_BOOK_ID = 1005387;

@Injectable()
export class SendpulseService {
  private readonly sendpulse = sendpulseInit();

  private addEmailsAsync: (
    addressId: number,
    emails: Array<{ email: string; variables: Record<string, any> }>,
  ) => Promise<any>;

  constructor() {
    this.initAddEmailsAsync();
  }

  private async initAddEmailsAsync(): Promise<void> {
    try {
      await this.sendpulse;
      this.addEmailsAsync = promisify((addressId, emails, callback) => {
        sendpulseApi.addEmails(callback, addressId, emails);
      });
    } catch (error) {
      console.error('Falha ao inicializar SendPulse:', error);
    }
  }

  async subscribe(email: string): Promise<string> {
    if (!this.addEmailsAsync) {
      await this.initAddEmailsAsync();
    }

    const result = await this.addEmailsAsync(SENDPULSE_ADDRESS_BOOK_ID, [
      { email, variables: {} },
    ]);

    if (!result || !result.result) {
      throw new Error('Falha ao adicionar email no sendpulse');
    }

    return email;
  }
}
