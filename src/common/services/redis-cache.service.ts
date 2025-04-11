import {
  Logger,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  connected,
  connectRedis,
  getRedisClient,
  disconnectRedis,
  getCurrentAttempts,
  resetConnectionAttempts,
} from '../../config/redis.config';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);

  private defaultTTL = 3600;

  private keyPrefix = process.env.REDIS_KEY_PREFIX || '';

  private cacheAvailable = false;

  private reconnectInterval = 30000;

  private reconnectTimer: NodeJS.Timeout | null = null;

  private maxReconnectAttempts = 3;

  private reconnectAttempts = 0;

  private cachePermanentlyDisabled = false;

  async onModuleInit() {
    this.connectToRedis();
  }

  async onModuleDestroy() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.cacheAvailable) {
      await disconnectRedis();
    }
  }

  private buildKey(key: string) {
    return `${this.keyPrefix}${key}`;
  }

  private async connectToRedis() {
    if (this.cachePermanentlyDisabled) {
      this.logger.warn(
        'Cache foi permanentemente desabilitado após falhas consecutivas',
      );
      return;
    }

    try {
      await connectRedis();
      this.cacheAvailable = true;
      this.logger.log('Serviço de cache conectado com sucesso');

      this.reconnectAttempts = 0;

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    } catch (error) {
      this.cacheAvailable = false;

      const currentRedisAttempts = getCurrentAttempts();

      if (currentRedisAttempts >= 5) {
        this.logger.error(
          `Número máximo de tentativas de conexão ao Redis atingido (${currentRedisAttempts})`,
        );
        this.cachePermanentlyDisabled = true;
        this.logger.warn(
          'Cache foi permanentemente desabilitado. A aplicação continuará funcionando sem cache.',
        );

        return;
      }

      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.logger.warn(
          `Serviço de cache desistiu após ${this.reconnectAttempts} tentativas de reconexão`,
        );
        this.cachePermanentlyDisabled = true;

        resetConnectionAttempts();
        this.reconnectAttempts = 0;

        this.logger.warn(
          'Cache foi permanentemente desabilitado. A aplicação continuará funcionando sem cache.',
        );
        return;
      }

      this.logger.warn(`Falha ao conectar ao Redis: ${error.message}`);
      this.logger.warn(
        `Tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts} do serviço de cache`,
      );
      this.logger.warn('A aplicação continuará funcionando sem cache');

      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectTimer && !this.cachePermanentlyDisabled) {
      const delay = Math.min(
        this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
        5 * 60 * 1000,
      );

      this.logger.log(
        `Agendando tentativa de reconexão ao Redis em ${delay / 1000} segundos`,
      );
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connectToRedis();
      }, delay);
    }
  }

  public async reactivateCache(): Promise<boolean> {
    if (this.cachePermanentlyDisabled) {
      this.logger.log(
        'Tentando reativar o cache que estava permanentemente desabilitado',
      );
      this.cachePermanentlyDisabled = false;
      this.reconnectAttempts = 0;
      resetConnectionAttempts();

      try {
        await this.connectToRedis();
        return this.cacheAvailable;
      } catch (error) {
        this.logger.error(`Falha ao reativar o cache: ${error.message}`);
        return false;
      }
    }

    return this.cacheAvailable;
  }

  private isAvailable(): boolean {
    if (this.cachePermanentlyDisabled) {
      return false;
    }

    const isConnected = connected();

    if (this.cacheAvailable !== isConnected) {
      this.cacheAvailable = isConnected;

      if (!this.cacheAvailable) {
        this.logger.warn('Conexão com o Redis perdida');
        this.scheduleReconnect();
      } else {
        this.logger.log('Conexão com o Redis restaurada');
      }
    }

    return this.cacheAvailable;
  }

  async set(
    key: string,
    value: any,
    ttl: number = this.defaultTTL,
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      this.logger.error('Erro ao armazenar no cache: Redis indisponível');
      return false;
    }

    try {
      const redisClient = getRedisClient();
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);

      await redisClient.set(this.buildKey(key), stringValue, { EX: ttl });
      return true;
    } catch (error) {
      this.logger.error(`Erro ao armazenar no cache: ${error.message}`);

      this.cacheAvailable = false;
      this.scheduleReconnect();
      return false;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const redisClient = getRedisClient();
      const value = await redisClient.get(this.buildKey(key));

      if (!value) return null;

      try {
        return JSON.parse(value) as T;
      } catch (e) {
        return value as unknown as T;
      }
    } catch (error) {
      this.logger.error(`Erro ao recuperar do cache: ${error.message}`);

      this.cacheAvailable = false;
      this.scheduleReconnect();

      return null;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const redisClient = getRedisClient();
      await redisClient.del(this.buildKey(key));
    } catch (error) {
      this.logger.error(`Erro ao remover do cache: ${error.message}`);

      this.cacheAvailable = false;
      this.scheduleReconnect();
    }
  }

  async has(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const redisClient = getRedisClient();
      const exists = await redisClient.exists(this.buildKey(key));
      return exists === 1;
    } catch (error) {
      this.logger.error(
        `Erro ao verificar existência no cache: ${error.message}`,
      );

      this.cacheAvailable = false;
      this.scheduleReconnect();

      return false;
    }
  }

  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = this.defaultTTL,
  ): Promise<T> {
    if (this.isAvailable()) {
      const cachedValue = await this.get<T>(this.buildKey(key));

      if (cachedValue !== null) {
        return cachedValue;
      }
    }

    const value = await factory();

    if (this.isAvailable()) {
      await this.set(this.buildKey(key), value, ttl);
    }

    return value;
  }

  public isCacheAvailable(): boolean {
    return this.isAvailable();
  }

  public isCachePermanentlyDisabled(): boolean {
    return this.cachePermanentlyDisabled;
  }

  public getCacheStatus(): {
    available: boolean;
    permanentlyDisabled: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      available: this.cacheAvailable,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      permanentlyDisabled: this.cachePermanentlyDisabled,
    };
  }
}
