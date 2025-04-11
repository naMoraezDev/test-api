import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { sendpulseInit } from 'src/config/sendpulse.config';

@Injectable()
export class SendpulseHealthIndicator extends HealthIndicatorService {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await sendpulseInit();
      return {
        [key]: {
          status: 'up',
        },
      };
    } catch (error) {
      return {
        [key]: {
          status: 'down',
          message: error.message,
          ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
        },
      };
    }
  }
}
