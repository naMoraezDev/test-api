import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { Injectable, Logger } from '@nestjs/common';
import { checkWithTimeout } from 'src/common/utils/health-helpers';
import { connected, getRedisClient } from 'src/config/redis.config';

@Injectable()
export class RedisHealthIndicator extends HealthIndicatorService {
  private readonly logger = new Logger(RedisHealthIndicator.name);
  private readonly HEALTH_CHECK_KEY = 'health:check:ping';

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await checkWithTimeout(async () => {
        if (!connected()) {
          throw new Error('Redis client is not connected');
        }

        const client = getRedisClient();
        const randomValue = `health-check-${Date.now()}`;

        await client.set(this.HEALTH_CHECK_KEY, randomValue, {
          EX: 60,
        });

        const result = await client.get(this.HEALTH_CHECK_KEY);

        await client.del(this.HEALTH_CHECK_KEY);

        if (result !== randomValue) {
          throw new Error('Redis data verification failed');
        }

        return true;
      }, 3000);

      return {
        [key]: {
          status: 'up',
          message: 'Redis connection is healthy',
        },
      };
    } catch (error) {
      this.logger.error(
        `Redis health check failed: ${error.message}`,
        error.stack,
      );

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
