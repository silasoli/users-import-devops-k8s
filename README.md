# Users Import API (NestJS)

Aplicacao de estudo com:

- CRUD de usuarios
- importacao assincrona de usuarios via RabbitMQ
- persistencia em MongoDB
- cache de leitura em Redis (`GET /users/:id` e `GET /imports/:id`)
- idempotencia de processamento no worker usando Redis (`SET NX`)
- metricas Prometheus (`/metrics`)
- health endpoints para probes

## Arquitetura de codigo

Estrutura em estilo Clean Architecture pragmatica:

- `src/domain`: entidades e contratos
- `src/application`: use cases
- `src/infrastructure`: Mongo, Redis, RabbitMQ, metricas
- `src/presentation`: controllers HTTP e consumer RabbitMQ

## Modelo de usuario

- `id` (ObjectId)
- `name` (obrigatorio, 3-120)
- `email` (obrigatorio, unico, lowercase)
- `document` (opcional, unico sparse)
- `source` (`manual | import`, default `manual`)
- `external_ref` (opcional)
- `created_at`, `updated_at`, `deleted_at`

## Import report

A importacao grava:

- `import_jobs`: resumo do job (`total_rows`, `processed_rows`, `success_rows`, `error_rows`, `status`)
- `import_job_items`: resultado por linha (inclui `error_code` e `error_message` em falha)

## Variaveis de ambiente

Copie `.env.example` para `.env`.

Principais:

- `APP_MODE=api|worker`
- `MONGO_URI`
- `MONGO_USERNAME` (obrigatoria)
- `MONGO_PASSWORD` (obrigatoria)
- `RABBITMQ_URL`
- `RABBITMQ_QUEUE`
- `REDIS_URL`
- `REDIS_PASSWORD` (obrigatoria)
- `PORT`

### Validacao de env no startup

A aplicacao valida o `.env` no bootstrap usando `ConfigModule.forRoot({ validate })`.

- arquivo de validacao: `src/infrastructure/config/env.validation.ts`
- service tipado para leitura: `src/infrastructure/config/environment-config.service.ts`

Se alguma variavel estiver invalida, a API nao sobe e mostra a lista de erros.

## Rodar

```bash
npm install
npm run start:dev
```

Worker (processamento da fila):

```bash
npm run start:worker:dev
```

## Rodar com Docker

Subir stack completa local (`api + worker + mongo + redis + rabbitmq + mongo-express`):

```bash
docker compose up --build -d
```

URLs uteis:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- RabbitMQ UI: `http://localhost:15672` (`appuser` / `apppass`)
- Mongo Express: `http://localhost:8081` (`admin` / `admin123`)

Parar e remover volumes:

```bash
docker compose down -v
```

## Endpoints principais

- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `POST /imports/users`
- `GET /imports/:id`
- `GET /imports/:id/errors`
- `GET /health/live`
- `GET /health/ready`
- `GET /metrics`

## Swagger

Com `SWAGGER_ENABLED=true`:

- `http://localhost:3000/docs`

## Kubernetes (desafio)

Os manifests para subir o projeto no Kubernetes estao em `k8s/`.

Guia passo a passo:

- `k8s/README.md`

Pipeline (GitHub Actions):

- `.github/workflows/ci-cd.yml`

Quick start Minikube:

```bash
minikube start --driver=docker --cpus=4 --memory=6144
minikube kubectl -- apply -f k8s/
minikube kubectl -- get pods -n users-import
minikube ip
```
