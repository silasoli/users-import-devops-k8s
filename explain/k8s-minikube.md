# Kubernetes com Minikube

## Pre-requisitos

- Docker Desktop rodando
- `minikube` instalado
- `kubectl` instalado

## 1) Subir cluster local

```bash
minikube start --driver=docker --cpus=4 --memory=6144
minikube kubectl -- get nodes
```

## 2) Build e push da imagem

```bash
docker build -t silasoli/users-import-api:latest .
docker push silasoli/users-import-api:latest
```

## 3) Aplicar manifests no cluster

```bash
minikube kubectl -- apply -f k8s/
```

## 4) Atualizar imagem da API/worker

```bash
minikube kubectl -- set image deployment/users-import-api api=docker.io/silasoli/users-import-api:latest -n users-import
minikube kubectl -- set image deployment/users-import-worker worker=docker.io/silasoli/users-import-api:latest -n users-import
```

## 5) Validar status

```bash
minikube kubectl -- get deploy,pods,svc,pvc -n users-import
```

## 6) Acessar API e Grafana

```bash
minikube service users-import-api -n users-import --url
minikube service grafana -n users-import --url
```

## 7) Debug rapido

```bash
minikube kubectl -- get events -n users-import --sort-by=.metadata.creationTimestamp
minikube kubectl -- logs -n users-import deploy/users-import-api --tail=200
minikube kubectl -- logs -n users-import deploy/users-import-worker --tail=200
```

## 8) Parar ambiente

```bash
minikube stop
minikube delete
```
