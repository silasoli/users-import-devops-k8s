import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppMode, ValidatedEnv } from './env.validation';

@Injectable()
export class EnvironmentConfigService {
  constructor(
    private readonly configService: ConfigService<ValidatedEnv, true>,
  ) {}

  get appMode(): AppMode {
    return this.configService.get('APP_MODE', { infer: true });
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true });
  }

  get apiPrefix(): string {
    return this.configService.get('API_PREFIX', { infer: true });
  }

  get trustProxy(): boolean {
    return this.configService.get('TRUST_PROXY', { infer: true });
  }

  get corsOrigins(): string[] {
    const raw = this.configService.get('CORS_ORIGINS', { infer: true });
    return raw
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  get mongoUri(): string {
    return this.configService.get('MONGO_URI', { infer: true });
  }

  get mongoUsername(): string {
    return this.configService.get('MONGO_USERNAME', { infer: true });
  }

  get mongoPassword(): string {
    return this.configService.get('MONGO_PASSWORD', { infer: true });
  }

  get mongoAuthSource(): string {
    return this.configService.get('MONGO_AUTH_SOURCE', { infer: true });
  }

  get rabbitMqUrl(): string {
    return this.configService.get('RABBITMQ_URL', { infer: true });
  }

  get rabbitMqQueue(): string {
    return this.configService.get('RABBITMQ_QUEUE', { infer: true });
  }

  get rabbitMqPrefetch(): number {
    return this.configService.get('RABBITMQ_PREFETCH', { infer: true });
  }

  get redisUrl(): string | undefined {
    return this.configService.get('REDIS_URL', { infer: true });
  }

  get redisHost(): string | undefined {
    return this.configService.get('REDIS_HOST', { infer: true });
  }

  get redisPort(): number {
    return this.configService.get('REDIS_PORT', { infer: true });
  }

  get redisPassword(): string {
    return this.configService.get('REDIS_PASSWORD', { infer: true });
  }

  get swaggerEnabled(): boolean {
    return this.configService.get('SWAGGER_ENABLED', { infer: true });
  }

  get swaggerPath(): string {
    return this.configService.get('SWAGGER_PATH', { infer: true });
  }

  get swaggerTitle(): string {
    return this.configService.get('SWAGGER_TITLE', { infer: true });
  }

  get swaggerDescription(): string {
    return this.configService.get('SWAGGER_DESCRIPTION', { infer: true });
  }

  get swaggerVersion(): string {
    return this.configService.get('SWAGGER_VERSION', { infer: true });
  }
}
