# Users Import API (NestJS)

Aplicacao de estudo com CRUD de usuarios, importacao assincrona via RabbitMQ, persistencia em MongoDB, cache/idempotencia em Redis e observabilidade com Prometheus + Grafana.

## Endpoints principais

- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `POST /imports/users`
- `GET /imports`
- `GET /imports/:id`
- `GET /imports/:id/errors`
- `GET /health/live`
- `GET /health/ready`
- `GET /metrics`

## Pipeline

- `.github/workflows/ci-cd.yml`

## Documentacao

Toda a documentacao operacional e de infraestrutura esta centralizada em `explain/`:

- `explain/README.md`
- `explain/project-overview.md`
- `explain/k8s-minikube.md`
- `explain/stress-tests.md`
- `explain/commands-cheatsheet.md`
- `explain/glossary.md`

## Quick start

```bash
npm install
npm run build

# Kubernetes local
minikube start --driver=docker --cpus=4 --memory=6144
minikube kubectl -- apply -f k8s/
minikube kubectl -- get deploy,pods,svc,pvc -n users-import
```
