# Glossary

## Docker

- **Image**: pacote da aplicacao com runtime e dependencias.
- **Container**: instancia em execucao de uma image.
- **Tag**: versao da image (ex.: `latest`, `v1.0.3`).

## Kubernetes

- **Pod**: menor unidade de execucao.
- **Deployment**: controlador de replicas e rollout.
- **Service**: endpoint estavel para pods.
- **NodePort**: acesso externo ao service.
- **ClusterIP**: acesso interno ao cluster.
- **Liveness/Readiness**: probes de saude e prontidao.
- **PVC**: volume persistente.
- **Namespace**: isolamento logico de recursos.

## Observabilidade

- **Prometheus**: coleta metricas.
- **Target**: endpoint monitorado (`UP`/`DOWN`).
- **Grafana**: dashboards de visualizacao.

## Mensageria/cache

- **RabbitMQ Queue**: fila de mensagens.
- **Worker**: consumidor assincrono.
- **Redis**: cache e idempotencia.

## CI/CD

- **CI**: validacao automatica de build.
- **CD**: publicacao e entrega da aplicacao.
- **Workflow**: pipeline versionado no GitHub Actions.
