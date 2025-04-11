import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HealthService } from './health.service';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { S3HealthIndicator } from './indicators/s3-health.indicator';
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
import { FirebaseHealthIndicator } from './indicators/firebase-health.indicator';
import { DynamodbHealthIndicator } from './indicators/dynamodb-health.indicator';
import { AlloyalApiHealthIndicator } from './indicators/alloyal-health.indicator';
import { SendpulseHealthIndicator } from './indicators/sendpulse-health.indicator';

@Module({
  imports: [
    TerminusModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    S3HealthIndicator,
    RedisHealthIndicator,
    DynamodbHealthIndicator,
    FirebaseHealthIndicator,
    SendpulseHealthIndicator,
    AlloyalApiHealthIndicator,
  ],
})
export class HealthModule {}
