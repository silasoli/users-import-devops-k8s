import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as hpp from 'hpp';
import { AppModule } from './app.module';
import { validateEnv } from './infrastructure/config/env.validation';
import { EnvironmentConfigService } from './infrastructure/config/environment-config.service';

const runtimeEnv = validateEnv(process.env as Record<string, unknown>);

async function bootstrapWorkerMode(): Promise<void> {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [runtimeEnv.RABBITMQ_URL],
      queue: runtimeEnv.RABBITMQ_QUEUE,
      queueOptions: {
        durable: true,
      },
      noAck: false,
      prefetchCount: runtimeEnv.RABBITMQ_PREFETCH,
    },
  });

  await app.listen();
}

async function bootstrapApiMode(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const env = app.get(EnvironmentConfigService);

  if (env.trustProxy) {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
      frameguard: { action: 'deny' },
    }),
  );
  app.use(hpp());

  const allowedOrigins = env.corsOrigins;

  app.enableCors({
    origin: (origin, callback) => {
      if (allowedOrigins.length === 0) {
        callback(null, true);
        return;
      }

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const apiPrefix = env.apiPrefix;
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  const swaggerEnabled = env.swaggerEnabled;

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(env.swaggerTitle)
      .setDescription(env.swaggerDescription)
      .setVersion(env.swaggerVersion)
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(env.swaggerPath, app, swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  await app.listen(env.port);
}

async function bootstrap(): Promise<void> {
  const appMode = runtimeEnv.APP_MODE;

  if (appMode === 'worker') {
    await bootstrapWorkerMode();
    return;
  }

  await bootstrapApiMode();
}

void bootstrap();
