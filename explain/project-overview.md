# Project Overview

## Visao geral

Este projeto implementa uma API NestJS com processamento assincrono de importacao de usuarios.
A solucao usa MongoDB para persistencia, Redis para cache/idempotencia e RabbitMQ para mensageria.

## Componentes

- `users-import-api` (Deployment, 4 replicas)
  - Exposta via `NodePort` (`30080`)
  - Health checks: `/health/live` e `/health/ready`
  - Metricas: `/metrics`
- `users-import-worker` (Deployment, 1 replica)
  - Consome fila do RabbitMQ e processa importacoes
- `mongo` (ClusterIP)
  - Banco principal
- `redis` (ClusterIP)
  - Cache e idempotencia
- `rabbitmq` (ClusterIP)
  - Broker de mensagens
- `prometheus` (ClusterIP + PVC)
  - Coleta metricas da API
- `grafana` (NodePort `30300`)
  - Dashboards operacionais

## CI/CD

Pipeline em GitHub Actions:

- `.github/workflows/ci-cd.yml`
  - Job de CI (`npm ci` + `npm run build`)
  - Job de publish Docker no Docker Hub

O deploy em Minikube e manual.
