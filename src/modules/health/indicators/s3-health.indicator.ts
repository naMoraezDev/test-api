import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import S3 from 'src/config/s3/s3.config';
import { Injectable } from '@nestjs/common';
import { HeadBucketCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3HealthIndicator extends HealthIndicatorService {
  private readonly bucketName = process.env.BUCKET_BUCKET_NAME || '';

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await S3.send(new HeadBucketCommand({ Bucket: this.bucketName }));
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
