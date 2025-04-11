import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { getFirebaseAuth } from 'src/config/firebase.config';

@Injectable()
export class FirebaseHealthIndicator extends HealthIndicatorService {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await getFirebaseAuth().listUsers(1);
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
