import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { CachePort } from '../../application/shared/ports/cache.port';
import { EnvironmentConfigService } from '../config/environment-config.service';

@Injectable()
export class RedisCacheAdapter implements CachePort, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheAdapter.name);
  private readonly redis: Redis;

  constructor(private readonly env: EnvironmentConfigService) {
    const redisUrl = this.env.redisUrl;

    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        password: this.env.redisPassword,
        maxRetriesPerRequest: null,
      });
    } else {
      this.redis = new Redis({
        host: this.env.redisHost ?? 'localhost',
        port: this.env.redisPort,
        password: this.env.redisPassword,
        maxRetriesPerRequest: null,
      });
    }

    this.redis.on('error', (error) => {
      this.logger.error(`Redis error: ${String(error)}`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async acquireIdempotencyKey(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redis.set(key, '1', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async ping(): Promise<string> {
    return this.redis.ping();
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
