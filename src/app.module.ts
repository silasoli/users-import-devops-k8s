import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TOKENS } from './shared/constants/tokens';
import { QUEUES } from './shared/constants/queues';
import { validateEnv } from './infrastructure/config/env.validation';
import { EnvironmentConfigService } from './infrastructure/config/environment-config.service';
import { UserMongo, UserSchema } from './infrastructure/persistence/mongo/schemas/user.schema';
import {
  ImportJobMongo,
  ImportJobSchema,
} from './infrastructure/persistence/mongo/schemas/import-job.schema';
import {
  ImportJobItemMongo,
  ImportJobItemSchema,
} from './infrastructure/persistence/mongo/schemas/import-job-item.schema';
import { MongoUserRepository } from './infrastructure/persistence/mongo/repositories/mongo-user.repository';
import { MongoImportJobRepository } from './infrastructure/persistence/mongo/repositories/mongo-import-job.repository';
import { MongoImportJobItemRepository } from './infrastructure/persistence/mongo/repositories/mongo-import-job-item.repository';
import { RedisCacheAdapter } from './infrastructure/cache/redis-cache.adapter';
import { RabbitImportPublisherAdapter } from './infrastructure/messaging/rabbitmq/rabbit-import-publisher.adapter';
import { CreateUserUseCase } from './application/users/use-cases/create-user.usecase';
import { GetUserUseCase } from './application/users/use-cases/get-user.usecase';
import { ListUsersUseCase } from './application/users/use-cases/list-users.usecase';
import { UpdateUserUseCase } from './application/users/use-cases/update-user.usecase';
import { DeleteUserUseCase } from './application/users/use-cases/delete-user.usecase';
import { CreateUsersImportJobUseCase } from './application/imports/use-cases/create-users-import-job.usecase';
import { GetImportJobUseCase } from './application/imports/use-cases/get-import-job.usecase';
import { ListImportJobsUseCase } from './application/imports/use-cases/list-import-jobs.usecase';
import { ListImportJobErrorsUseCase } from './application/imports/use-cases/list-import-job-errors.usecase';
import { ProcessImportUserRowUseCase } from './application/imports/use-cases/process-import-user-row.usecase';
import { UsersController } from './presentation/http/users.controller';
import { ImportsController } from './presentation/http/imports.controller';
import { HealthController } from './presentation/http/health.controller';
import { MetricsController } from './presentation/http/metrics.controller';
import { ImportsConsumerController } from './presentation/rabbit/imports.consumer.controller';
import { MetricsService } from './infrastructure/metrics.service';
import { HttpMetricsMiddleware } from './infrastructure/http-metrics.middleware';
import { HealthService } from './infrastructure/health.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
        user: configService.getOrThrow<string>('MONGO_USERNAME'),
        pass: configService.getOrThrow<string>('MONGO_PASSWORD'),
        authSource: configService.get<string>('MONGO_AUTH_SOURCE') ?? 'admin',
      }),
    }),
    MongooseModule.forFeature([
      { name: UserMongo.name, schema: UserSchema },
      { name: ImportJobMongo.name, schema: ImportJobSchema },
      { name: ImportJobItemMongo.name, schema: ImportJobItemSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: QUEUES.IMPORT_USERS_QUEUE,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672',
            ],
            queue:
              configService.get<string>('RABBITMQ_QUEUE') ??
              QUEUES.IMPORT_USERS_QUEUE,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [
    UsersController,
    ImportsController,
    HealthController,
    MetricsController,
    ImportsConsumerController,
  ],
  providers: [
    MetricsService,
    HealthService,
    EnvironmentConfigService,
    RedisCacheAdapter,
    {
      provide: TOKENS.USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
    {
      provide: TOKENS.IMPORT_JOB_REPOSITORY,
      useClass: MongoImportJobRepository,
    },
    {
      provide: TOKENS.IMPORT_JOB_ITEM_REPOSITORY,
      useClass: MongoImportJobItemRepository,
    },
    {
      provide: TOKENS.CACHE_PORT,
      useExisting: RedisCacheAdapter,
    },
    {
      provide: TOKENS.IMPORT_PUBLISHER_PORT,
      useClass: RabbitImportPublisherAdapter,
    },
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    CreateUsersImportJobUseCase,
    GetImportJobUseCase,
    ListImportJobsUseCase,
    ListImportJobErrorsUseCase,
    ProcessImportUserRowUseCase,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(HttpMetricsMiddleware)
      .exclude({ path: 'metrics', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
