import {
  createClient,
  createCluster,
  RedisClientType,
  RedisClusterType,
} from 'redis';
import { Logger } from '@nestjs/common';

const logger = new Logger('RedisConfig');

let isConnected = false;
let isConnecting = false;
let redisClient: RedisClientType | RedisClusterType;
let connectionTimeout: NodeJS.Timeout | null = null;

let connectionAttempts = 0;

const CONFIG = {
  BACKOFF_FACTOR: 2,
  MAX_RETRY_DELAY: 30000,
  BASE_RETRY_DELAY: 1000,
  CONNECTION_TIMEOUT: 5000,
  MAX_CONNECTION_ATTEMPTS: 5,
  RESET_ATTEMPTS_AFTER: 60000 * 10,
};

let resetAttemptsTimer: NodeJS.Timeout | null = null;

function connected(): boolean {
  return isConnected;
}

function scheduleResetAttempts(): void {
  if (resetAttemptsTimer) {
    clearTimeout(resetAttemptsTimer);
  }

  resetAttemptsTimer = setTimeout(() => {
    logger.log('Resetando contador de tentativas de conexão ao Redis');
    connectionAttempts = 0;
    resetAttemptsTimer = null;
  }, CONFIG.RESET_ATTEMPTS_AFTER);
}

function calculateBackoff(attempts: number): number {
  const delay = Math.min(
    CONFIG.BASE_RETRY_DELAY * Math.pow(CONFIG.BACKOFF_FACTOR, attempts),
    CONFIG.MAX_RETRY_DELAY,
  );

  return delay + Math.random() * 1000;
}

async function connectRedis(): Promise<RedisClientType | RedisClusterType> {
  if (isConnected) {
    return redisClient;
  }

  if (isConnecting) {
    throw new Error('Já existe uma tentativa de conexão em andamento.');
  }

  if (connectionAttempts >= CONFIG.MAX_CONNECTION_ATTEMPTS) {
    logger.error(
      `Limite máximo de tentativas de conexão (${CONFIG.MAX_CONNECTION_ATTEMPTS}) atingido.`,
    );
    throw new Error(
      `Não foi possível conectar ao Redis após ${CONFIG.MAX_CONNECTION_ATTEMPTS} tentativas.`,
    );
  }

  connectionAttempts++;
  isConnecting = true;

  if (connectionAttempts === 1) {
    scheduleResetAttempts();
  }

  logger.log(
    `Tentativa de conexão ao Redis ${connectionAttempts}/${CONFIG.MAX_CONNECTION_ATTEMPTS}`,
  );

  try {
    const isCluster = process.env.REDIS_CLUSTER === '1';
    const connectionUrl =
      process.env.REDIS_CONNECT_URL || 'redis://localhost:6379';
    const maxRetries = parseInt(
      process.env.REDIS_MAX_RETRY_ATTEMPTS || '10',
      10,
    );

    const redisOptions = {
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > maxRetries) {
            logger.error(
              'Máximo de tentativas de reconexão automática atingido.',
            );
            return new Error('Máximo de tentativas de reconexão atingido');
          }

          const delay = calculateBackoff(retries);
          logger.log(
            `Tentando reconexão automática em ${Math.round(delay)}ms (tentativa ${retries}/${maxRetries})`,
          );
          return delay;
        },
        connectTimeout: CONFIG.CONNECTION_TIMEOUT,
        keepAlive: 5000,
      },
      commandsQueueMaxLength: 5000,
    };

    redisClient = isCluster
      ? createCluster({
          rootNodes: [{ url: connectionUrl }],
          useReplicas: true,
          defaults: redisOptions,
        })
      : createClient({
          url: connectionUrl,
          ...redisOptions,
        });

    redisClient.on('error', (err) => {
      logger.error(`Erro no cliente Redis: ${err.message}`);
      isConnected = false;
    });

    redisClient.on('reconnecting', () => {
      logger.log('Redis tentando reconectar automaticamente...');
    });

    redisClient.on('ready', () => {
      logger.log('Cliente Redis pronto');
      isConnected = true;
      connectionAttempts = 0;
    });

    const connectionPromise = new Promise<RedisClientType | RedisClusterType>(
      (resolve, reject) => {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
        }

        connectionTimeout = setTimeout(() => {
          connectionTimeout = null;
          reject(
            new Error(
              `Tempo limite de conexão Redis excedido (${CONFIG.CONNECTION_TIMEOUT}ms)`,
            ),
          );
        }, CONFIG.CONNECTION_TIMEOUT);

        redisClient
          .connect()
          .then(() => {
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }

            isConnected = true;
            connectionAttempts = 0;

            logger.log(
              `Redis ${isCluster ? 'Cluster' : 'Client'} conectado com sucesso em: ${connectionUrl}`,
            );
            resolve(redisClient);
          })
          .catch((error) => {
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }

            isConnected = false;
            reject(error);
          });
      },
    );

    return await connectionPromise;
  } catch (error) {
    logger.error(
      `Falha ao conectar ao Redis (tentativa ${connectionAttempts}/${CONFIG.MAX_CONNECTION_ATTEMPTS}): ${error.message}`,
    );
    isConnected = false;
    throw error;
  } finally {
    isConnecting = false;
  }
}

function getRedisClient(): RedisClientType | RedisClusterType {
  if (!isConnected) {
    logger.warn('Tentativa de usar cliente Redis não conectado');
    throw new Error(
      'Cliente Redis não está conectado. Chame connectRedis() primeiro.',
    );
  }
  return redisClient;
}

async function disconnectRedis(): Promise<void> {
  if (isConnected && redisClient) {
    try {
      await redisClient.quit();
      isConnected = false;
      logger.log('Conexão Redis fechada');
    } catch (error) {
      logger.error(`Erro ao desconectar Redis: ${error.message}`);
      throw error;
    }
  }
}

function resetConnectionAttempts(): void {
  connectionAttempts = 0;
  logger.log('Contador de tentativas de conexão ao Redis resetado manualmente');
}

function getCurrentAttempts(): number {
  return connectionAttempts;
}

export {
  connected,
  connectRedis,
  getRedisClient,
  disconnectRedis,
  getCurrentAttempts,
  resetConnectionAttempts,
};
