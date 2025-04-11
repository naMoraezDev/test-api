import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import * as dynamoose from 'dynamoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DynamodbHealthIndicator extends HealthIndicatorService {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const ddb = dynamoose.aws.ddb();
      await ddb.listTables({ Limit: 1 });
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
