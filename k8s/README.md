# Kubernetes com Minikube

## 0) Pre-requisitos

- Docker Desktop rodando
- `minikube` instalado
- `kubectl` instalado

## 1) Subir cluster local

```bash
minikube start --driver=docker --cpus=4 --memory=6144
minikube kubectl -- get nodes
```

## 2) Build e push da imagem

Troque `SEU_USUARIO_DOCKERHUB` nos manifests `k8s/20-api.yaml` e `k8s/21-worker.yaml`.

```bash
docker build -t SEU_USUARIO_DOCKERHUB/users-import-api:latest .
docker push SEU_USUARIO_DOCKERHUB/users-import-api:latest
```

## 3) Aplicar manifests no cluster

Use `minikube kubectl --` para evitar incompatibilidade de versao do `kubectl` local.

```bash
minikube kubectl -- apply -f k8s/00-namespace.yaml
minikube kubectl -- apply -f k8s/01-secrets.yaml
minikube kubectl -- apply -f k8s/02-app-configmap.yaml
minikube kubectl -- apply -f k8s/10-mongo.yaml
minikube kubectl -- apply -f k8s/11-redis.yaml
minikube kubectl -- apply -f k8s/12-rabbitmq.yaml
minikube kubectl -- apply -f k8s/20-api.yaml
minikube kubectl -- apply -f k8s/21-worker.yaml
minikube kubectl -- apply -f k8s/30-prometheus-rbac.yaml
minikube kubectl -- apply -f k8s/31-prometheus-configmap.yaml
minikube kubectl -- apply -f k8s/32-prometheus.yaml
minikube kubectl -- apply -f k8s/40-grafana-datasource-configmap.yaml
minikube kubectl -- apply -f k8s/41-grafana-dashboards-configmap.yaml
minikube kubectl -- apply -f k8s/42-grafana-dashboard-json-configmap.yaml
minikube kubectl -- apply -f k8s/43-grafana.yaml
```

## 4) Validar status

```bash
minikube kubectl -- get pods -n users-import
minikube kubectl -- get svc -n users-import
minikube kubectl -- get deploy -n users-import
```

Esperado:

- `users-import-api` com `4/4` replicas
- `users-import-worker` com `1/1`
- Mongo, Redis, RabbitMQ, Prometheus e Grafana com `1/1`

## 5) Acessar API e Grafana

```bash
minikube ip
```

Com o IP retornado:

- API: `http://<MINIKUBE_IP>:30080`
- Swagger: `http://<MINIKUBE_IP>:30080/docs`
- Grafana: `http://<MINIKUBE_IP>:30300` (`admin` / `admin123`)

## 6) Stress test

```bash
hey -z 60s -c 50 http://<MINIKUBE_IP>:30080/health/live
```

## 7) Diagnostico rapido

```bash
minikube kubectl -- get events -n users-import --sort-by=.metadata.creationTimestamp
minikube kubectl -- logs -n users-import deploy/users-import-api --tail=200
minikube kubectl -- logs -n users-import deploy/users-import-worker --tail=200
```

## 8) Ajustes para entrega final

- troque senhas do `Secret`
- use tag imutavel da imagem (`:v1.0.0`)
- mantenha apenas Grafana exposto externamente no cluster

## 9) Pipeline de entrega com GitHub Actions

Workflow criado em `.github/workflows`:

- `ci-cd.yml`: pipeline unico com job de CI (build) e job de Docker Publish

Secrets necessarios no GitHub:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

Observacao:

- O pipeline publica imagem no Docker Hub automaticamente.
- O deploy no Minikube e manual:

```bash
minikube kubectl -- apply -f k8s/
```

## 10) Parar ambiente Minikube

Parar cluster (mantem estado para subir depois):

```bash
minikube stop
```

Subir novamente:

```bash
minikube start
```

Apagar cluster e todos os recursos (reset total):

```bash
minikube delete
```

Se quiser remover apenas os recursos da aplicacao e manter o cluster:

```bash
minikube kubectl -- delete namespace users-import
```
