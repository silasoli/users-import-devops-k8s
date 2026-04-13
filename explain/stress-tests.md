# Stress Tests

## Arquivos

- `stress/k6-users-read.js`: carga de leitura (`/users` e `/health/live`)
- `stress/k6-import-users.js`: carga de importacao (`/imports/users`) para API + RabbitMQ + worker
- `stress/data/import-users.csv`: base de entrada
- `stress/requests.http`: requests manuais

## 1) Obter URL da API

```bash
minikube service users-import-api -n users-import --url
```

## 2) Stress de leitura

```bash
docker run --rm -i -v "${PWD}:/work" -w /work/stress grafana/k6 run k6-users-read.js -e BASE_URL=http://host.docker.internal:30080 -e VUS=50 -e DURATION=120s
```

## 3) Stress de importacao

```bash
docker run --rm -i -v "${PWD}:/work" -w /work/stress grafana/k6 run k6-import-users.js -e BASE_URL=http://host.docker.internal:30080 -e DURATION=120s -e JOBS_PER_SECOND=3 -e ROWS_PER_JOB=10
```

## 4) Observar RabbitMQ durante teste

```bash
minikube kubectl -- exec -n users-import deploy/rabbitmq -- rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers
```

## Evidencias recomendadas

- Dashboard Grafana antes da carga
- Dashboard Grafana durante a carga (variacao de CPU, memoria, RPS, latencia)
- Resumo do `k6`
- Snapshot da fila RabbitMQ durante importacao
