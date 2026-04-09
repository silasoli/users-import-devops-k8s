import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  MinLength,
  IsString,
  Max,
  Min,
  ValidationError,
  validateSync,
} from 'class-validator';

export type AppMode = 'api' | 'worker';

export type ValidatedEnv = {
  APP_MODE: AppMode;
  PORT: number;
  API_PREFIX: string;
  TRUST_PROXY: boolean;
  CORS_ORIGINS: string;
  MONGO_URI: string;
  MONGO_USERNAME: string;
  MONGO_PASSWORD: string;
  MONGO_AUTH_SOURCE: string;
  RABBITMQ_URL: string;
  RABBITMQ_QUEUE: string;
  RABBITMQ_PREFETCH: number;
  REDIS_URL?: string;
  REDIS_HOST?: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  SWAGGER_ENABLED: boolean;
  SWAGGER_PATH: string;
  SWAGGER_TITLE: string;
  SWAGGER_DESCRIPTION: string;
  SWAGGER_VERSION: string;
};

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

function toNumber(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

class EnvironmentVariables {
  @IsEnum(['api', 'worker'])
  APP_MODE: AppMode = 'api';

  @IsInt()
  @Min(1)
  @Max(65535)
  @Transform(({ value }) => toNumber(value, 3000))
  PORT = 3000;

  @IsString()
  API_PREFIX = '';

  @Transform(({ value }) => toBoolean(value, false))
  @IsBoolean()
  TRUST_PROXY = false;

  @IsString()
  CORS_ORIGINS = '';

  @IsString()
  MONGO_URI = 'mongodb://localhost:27017/users_db';

  @IsString()
  @MinLength(1)
  MONGO_USERNAME = '';

  @IsString()
  @MinLength(1)
  MONGO_PASSWORD = '';

  @IsString()
  MONGO_AUTH_SOURCE = 'admin';

  @IsString()
  RABBITMQ_URL = 'amqp://localhost:5672';

  @IsString()
  RABBITMQ_QUEUE = 'import-users.queue';

  @IsInt()
  @Min(1)
  @Transform(({ value }) => toNumber(value, 20))
  RABBITMQ_PREFETCH = 20;

  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => toNumber(value, 6379))
  REDIS_PORT = 6379;

  @IsString()
  @MinLength(1)
  REDIS_PASSWORD = '';

  @Transform(({ value }) => toBoolean(value, true))
  @IsBoolean()
  SWAGGER_ENABLED = true;

  @IsString()
  SWAGGER_PATH = 'docs';

  @IsString()
  SWAGGER_TITLE = 'Users Import API';

  @IsString()
  SWAGGER_DESCRIPTION = 'Users CRUD + async import API';

  @IsString()
  SWAGGER_VERSION = '1.0.0';
}

function flattenErrors(errors: ValidationError[], path = ''): string[] {
  const result: string[] = [];

  for (const error of errors) {
    const currentPath = path ? `${path}.${error.property}` : error.property;

    if (error.constraints) {
      result.push(...Object.values(error.constraints).map((msg) => `${currentPath}: ${msg}`));
    }

    if (error.children?.length) {
      result.push(...flattenErrors(error.children, currentPath));
    }
  }

  return result;
}

export function validateEnv(config: Record<string, unknown>): ValidatedEnv {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(env, {
    skipMissingProperties: false,
    whitelist: true,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${flattenErrors(errors).join('\n')}`);
  }

  if (!env.REDIS_URL && !env.REDIS_HOST) {
    throw new Error('Environment validation failed:\nREDIS_URL or REDIS_HOST must be provided.');
  }

  if (!env.REDIS_PASSWORD?.trim()) {
    throw new Error('Environment validation failed:\nREDIS_PASSWORD must be provided.');
  }

  if (!env.MONGO_USERNAME.trim() || !env.MONGO_PASSWORD.trim()) {
    throw new Error(
      'Environment validation failed:\nMONGO_USERNAME and MONGO_PASSWORD must be provided.',
    );
  }

  return {
    APP_MODE: env.APP_MODE,
    PORT: env.PORT,
    API_PREFIX: env.API_PREFIX,
    TRUST_PROXY: env.TRUST_PROXY,
    CORS_ORIGINS: env.CORS_ORIGINS,
    MONGO_URI: env.MONGO_URI,
    MONGO_USERNAME: env.MONGO_USERNAME,
    MONGO_PASSWORD: env.MONGO_PASSWORD,
    MONGO_AUTH_SOURCE: env.MONGO_AUTH_SOURCE,
    RABBITMQ_URL: env.RABBITMQ_URL,
    RABBITMQ_QUEUE: env.RABBITMQ_QUEUE,
    RABBITMQ_PREFETCH: env.RABBITMQ_PREFETCH,
    REDIS_URL: env.REDIS_URL,
    REDIS_HOST: env.REDIS_HOST,
    REDIS_PORT: env.REDIS_PORT,
    REDIS_PASSWORD: env.REDIS_PASSWORD,
    SWAGGER_ENABLED: env.SWAGGER_ENABLED,
    SWAGGER_PATH: env.SWAGGER_PATH,
    SWAGGER_TITLE: env.SWAGGER_TITLE,
    SWAGGER_DESCRIPTION: env.SWAGGER_DESCRIPTION,
    SWAGGER_VERSION: env.SWAGGER_VERSION,
  };
}
