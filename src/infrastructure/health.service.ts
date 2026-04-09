import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisCacheAdapter } from './cache/redis-cache.adapter';
import { EnvironmentConfigService } from './config/environment-config.service';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly redisCacheAdapter: RedisCacheAdapter,
    private readonly env: EnvironmentConfigService,
  ) {}

  async getReadiness() {
    const mongoReady = this.mongoConnection.readyState === 1;

    let redisReady = false;
    try {
      const ping = await this.redisCacheAdapter.ping();
      redisReady = ping === 'PONG';
    } catch {
      redisReady = false;
    }

    const queue = this.env.rabbitMqQueue;

    return {
      status: mongoReady && redisReady ? 'ok' : 'degraded',
      dependencies: {
        mongodb: mongoReady ? 'up' : 'down',
        redis: redisReady ? 'up' : 'down',
        rabbitmq_queue: queue,
      },
    };
  }
}
