import * as os from 'os';
import * as jwt from 'jsonwebtoken';
import {
  HealthStatus,
  checkWithTimeout,
  formatMemoryUsage,
  checkEnvironmentVariables,
} from 'src/common/utils/health-helpers';
import { Injectable, Logger } from '@nestjs/common';
import { S3HealthIndicator } from './indicators/s3-health.indicator';
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
import { DynamodbHealthIndicator } from './indicators/dynamodb-health.indicator';
import { FirebaseHealthIndicator } from './indicators/firebase-health.indicator';
import { AlloyalApiHealthIndicator } from './indicators/alloyal-health.indicator';
import { SendpulseHealthIndicator } from './indicators/sendpulse-health.indicator';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly s3: S3HealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly firebase: FirebaseHealthIndicator,
    private readonly dynamodb: DynamodbHealthIndicator,
    private readonly alloyal: AlloyalApiHealthIndicator,
    private readonly sendpulse: SendpulseHealthIndicator,
  ) {}

  async checkLiveness(): Promise<Partial<HealthStatus>> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async checkReadiness(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      const healthStatus: HealthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime() / 60)} minutos`,
        checks: {},
      };

      const [
        s3Result,
        redisResult,
        alloyalResult,
        firebaseResult,
        dynamodbResult,
        sendpulseResult,
      ] = await Promise.allSettled([
        checkWithTimeout(() => this.s3.isHealthy('s3')),
        checkWithTimeout(() => this.redis.isHealthy('redis')),
        checkWithTimeout(() => this.alloyal.isHealthy('alloyal')),
        checkWithTimeout(() => this.firebase.isHealthy('firebase')),
        checkWithTimeout(() => this.dynamodb.isHealthy('dynamodb')),
        checkWithTimeout(() => this.sendpulse.isHealthy('sendpulse')),
      ]);

      await this.checkJwtSecret(healthStatus);
      this.processS3Check(healthStatus, s3Result);
      this.processRedisCheck(healthStatus, redisResult);
      this.processAlloyalCheck(healthStatus, alloyalResult);
      this.processFirebaseCheck(healthStatus, firebaseResult);
      this.processDynamodbCheck(healthStatus, dynamodbResult);
      this.processSendpulseCheck(healthStatus, sendpulseResult);

      this.checkEnvironmentVars(healthStatus);

      this.addSystemInfo(healthStatus);

      healthStatus.responseTime = `${Date.now() - startTime}ms`;

      return healthStatus;
    } catch (error) {
      this.logger.error(`Readiness check error: ${error.message}`, error.stack);
      return this.createErrorResponse();
    }
  }

  private async checkJwtSecret(healthStatus: HealthStatus): Promise<void> {
    try {
      const jwtTest = jwt.sign(
        { test: 'health-check' },
        process.env.JWT_SECRET || '',
      );
      jwt.verify(jwtTest, process.env.JWT_SECRET || '');

      healthStatus.checks.jwtSecret = {
        status: 'ok',
        message: 'JWT secret validado com sucesso',
      };
    } catch (error: any) {
      healthStatus.checks.jwtSecret = {
        status: 'error',
        error: 'Falha na validação do JWT secret',
        details: error.message,
      };
      healthStatus.status = 'degraded';
      this.logger.warn(`JWT secret check failed: ${error.message}`);
    }
  }

  private checkEnvironmentVars(healthStatus: HealthStatus): void {
    const requiredEnvVars = [
      'ALLOWED_ORIGINS',
      'AUTH_PROVIDER_URL',
      'JWT_SECRET',
      'API_KEYS',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'GOOGLE_CLIENT_ID',
      'DYNAMODB_ACCESS_KEY_ID',
      'DYNAMODB_SECRET_ACCESS_KEY',
      'DYNAMODB_REGION',
      'DYNAMODB_PREFERENCES_TABLENAME',
      'DYNAMODB_CLIENTS_TABLENAME',
      'BUCKET_ACCESS_KEY',
      'BUCKET_SECRET_KEY',
      'BUCKET_BUCKET_NAME',
      'BUCKET_REGION',
      'BUCKET_PATH',
      'REDIS_CONNECT_URL',
      'REDIS_CLUSTER',
      'REDIS_KEY_PREFIX',
      'SENDPULSE_API_USER_ID',
      'SENDPULSE_API_SECRET',
      'ALLOYAL_API_BASE_URL',
      'ALLOYAL_MAIN_BUSINESS_ID',
      'ALLOYAL_FREEMIUM_BUSINESS_ID',
      'ALLOYAL_EMPLOYEE_EMAIL',
      'ALLOYAL_EMPLOYEE_PASSWORD',
      'ALLOYAL_MAIN_SESSION_TOKEN',
      'ALLOYAL_FREEMIUM_SESSION_TOKEN',
    ];

    const missingEnvVars = checkEnvironmentVariables(requiredEnvVars);

    healthStatus.checks.envVars = {
      status: missingEnvVars.length === 0 ? 'ok' : 'error',
      checked: requiredEnvVars.length,
      missing: missingEnvVars,
    };

    if (missingEnvVars.length > 0) {
      healthStatus.checks.envVars.error = `Variáveis de ambiente ausentes: ${missingEnvVars.join(
        ', ',
      )}`;
      healthStatus.status = 'degraded';
      this.logger.warn(
        `Missing environment variables: ${missingEnvVars.join(', ')}`,
      );
    }
  }

  private addSystemInfo(healthStatus: HealthStatus): void {
    const memoryUsage = process.memoryUsage();

    healthStatus.system = {
      memory: {
        free: formatMemoryUsage(os.freemem()),
        total: formatMemoryUsage(os.totalmem()),
        usage: {
          rss: formatMemoryUsage(memoryUsage.rss),
          heapUsed: formatMemoryUsage(memoryUsage.heapUsed),
          heapTotal: formatMemoryUsage(memoryUsage.heapTotal),
        },
      },
      cpuLoad: os.loadavg(),
      platform: os.platform(),
      cpuCores: os.cpus().length,
    };
  }

  private processFirebaseCheck(
    healthStatus: HealthStatus,
    result: PromiseSettledResult<any>,
  ): void {
    if (result.status === 'fulfilled') {
      healthStatus.checks.firebase = {
        status: result.value.firebase.status === 'up' ? 'ok' : 'error',
        initialized: result.value.firebase.status === 'up',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        message:
          result.value.firebase.status === 'up'
            ? 'Conexão com Firebase Auth estabelecida'
            : undefined,
        error:
          result.value.firebase.status !== 'up'
            ? result.value.firebase.message ||
              'Falha na comunicação com Firebase'
            : undefined,
      };

      if (result.value.firebase.status !== 'up') {
        healthStatus.status = 'degraded';
      }
    } else {
      healthStatus.checks.firebase = {
        status: 'error',
        initialized: false,
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        error: `Falha ao verificar Firebase: ${result.reason?.message || 'Erro desconhecido'}`,
      };
      healthStatus.status = 'degraded';
    }
  }

  private processDynamodbCheck(
    healthStatus: HealthStatus,
    result: PromiseSettledResult<any>,
  ): void {
    if (result.status === 'fulfilled') {
      healthStatus.checks.dynamodb = {
        status: result.value.dynamodb.status === 'up' ? 'ok' : 'error',
        message:
          result.value.dynamodb.status === 'up'
            ? 'Conexão com DynamoDB estabelecida'
            : undefined,
        error:
          result.value.dynamodb.status !== 'up'
            ? result.value.dynamodb.message ||
              'Falha na comunicação com DynamoDB'
            : undefined,
      };

      if (result.value.dynamodb.status !== 'up') {
        healthStatus.status = 'degraded';
      }
    } else {
      healthStatus.checks.dynamodb = {
        status: 'error',
        error: `Falha ao verificar DynamoDB: ${result.reason?.message || 'Erro desconhecido'}`,
      };
      healthStatus.status = 'degraded';
    }
  }

  private processRedisCheck(
    healthStatus: HealthStatus,
    result: PromiseSettledResult<any>,
  ): void {
    if (result.status === 'fulfilled') {
      healthStatus.checks.redis = {
        status: result.value.redis.status === 'up' ? 'ok' : 'error',
        message:
          result.value.redis.status === 'up'
            ? 'Conexão com Redis estabelecida'
            : undefined,
        error:
          result.value.redis.status !== 'up'
            ? result.value.redis.message || 'Falha na comunicação com Redis'
            : undefined,
      };

      if (result.value.redis.status !== 'up') {
        healthStatus.status = 'degraded';
      }
    } else {
      healthStatus.checks.redis = {
        status: 'error',
        error: `Falha ao verificar Redis: ${result.reason?.message || 'Erro desconhecido'}`,
      };
      healthStatus.status = 'degraded';
    }
  }

  private processS3Check(
    healthStatus: HealthStatus,
    result: PromiseSettledResult<any>,
  ): void {
    if (result.status === 'fulfilled') {
      healthStatus.checks.s3 = {
        status: result.value.s3.status === 'up' ? 'ok' : 'error',
        bucketName: process.env.BUCKET_BUCKET_NAME,
        message:
          result.value.s3.status === 'up'
            ? 'Conexão com S3 estabelecida'
            : undefined,
        error:
          result.value.s3.status !== 'up'
            ? result.value.s3.message || 'Falha na comunicação com S3'
            : undefined,
      };

      if (result.value.s3.status !== 'up') {
        healthStatus.status = 'degraded';
      }
    } else {
      healthStatus.checks.s3 = {
        status: 'error',
        bucketName: process.env.BUCKET_BUCKET_NAME,
        error: `Falha ao verificar S3: ${result.reason?.message || 'Erro desconhecido'}`,
      };
      healthStatus.status = 'degraded';
    }
  }

  private processSendpulseCheck(
    healthStatus: HealthStatus,
    result: PromiseSettledResult<any>,
  ): void {
    if (result.status === 'fulfilled') {
      healthStatus.checks.sendpulse = {
        status: result.value.sendpulse.status === 'up' ? 'ok' : 'error',
        message:
          result.value.sendpulse.status === 'up'
            ? 'Conexão com SendPulse estabelecida'
            : undefined,
        error:
          result.value.sendpulse.status !== 'up'
            ? result.value.sendpulse.message ||
              'Falha na comunicação com SendPulse'
            : undefined,
      };

      if (result.value.sendpulse.status !== 'up') {
        healthStatus.status = 'degraded';
      }
    } else {
      healthStatus.checks.sendpulse = {
        status: 'error',
        error: `Falha ao verificar SendPulse: ${result.reason?.message || 'Erro desconhecido'}`,
      };
      healthStatus.status = 'degraded';
    }
  }

  private processAlloyalCheck(
    healthStatus: HealthStatus,
    result: PromiseSettledResult<any>,
  ): void {
    if (result.status === 'fulfilled') {
      healthStatus.checks.alloyal = {
        status: result.value.alloyal.status === 'up' ? 'ok' : 'error',
        message:
          result.value.alloyal.status === 'up'
            ? 'Conexão com Alloyal Api estabelecida'
            : undefined,
        error:
          result.value.alloyal.status !== 'up'
            ? result.value.alloyal.message ||
              'Falha na comunicação com Alloyal Api'
            : undefined,
      };

      if (result.value.alloyal.status !== 'up') {
        healthStatus.status = 'degraded';
      }
    } else {
      healthStatus.checks.alloyal = {
        status: 'error',
        error: `Falha ao verificar Alloyal Api: ${result.reason?.message || 'Erro desconhecido'}`,
      };
      healthStatus.status = 'degraded';
    }
  }

  private createErrorResponse(): HealthStatus {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime() / 60)} minutos`,
      checks: {},
      service: {
        env: process.env.NODE_ENV || 'development',
        name: 'auth-api',
        version: process.env.npm_package_version || '0.0.1',
      },
    };
  }
}
