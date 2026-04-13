# Commands Cheatsheet

Referencia rapida com comando + objetivo.

## Cluster e deploy

`minikube start --driver=docker --cpus=4 --memory=6144`  
Sobe o cluster Kubernetes local (Minikube) com recursos suficientes para API, worker, Mongo, Redis, RabbitMQ, Prometheus e Grafana.

`minikube kubectl -- apply -f k8s/`  
Cria/atualiza todos os manifests Kubernetes do projeto.

`minikube kubectl -- get deploy,pods,svc,pvc -n users-import`  
Mostra o estado geral dos recursos no namespace da aplicacao.

## Imagem Docker e rollout

`docker build -t silasoli/users-import-api:latest .`  
Gera a imagem Docker da aplicacao.

`docker push silasoli/users-import-api:latest`  
Publica a imagem no Docker Hub.

`minikube kubectl -- set image deployment/users-import-api api=docker.io/silasoli/users-import-api:latest -n users-import`  
Atualiza a imagem da API no cluster.

`minikube kubectl -- set image deployment/users-import-worker worker=docker.io/silasoli/users-import-api:latest -n users-import`  
Atualiza a imagem do worker no cluster.

`minikube kubectl -- rollout status deployment/users-import-api -n users-import`  
Confirma se o rollout da API terminou com sucesso.

`minikube kubectl -- rollout status deployment/users-import-worker -n users-import`  
Confirma se o rollout do worker terminou com sucesso.

## Acesso aos servicos

`minikube service users-import-api -n users-import --url`  
Retorna URL de acesso externo da API (via NodePort/tunnel no Minikube).

`minikube service grafana -n users-import --url`  
Retorna URL de acesso externo do Grafana.

`minikube kubectl -- port-forward svc/prometheus 9090:9090 -n users-import`  
Expoe o Prometheus localmente em `http://localhost:9090`.

## RabbitMQ

`minikube kubectl -- exec -n users-import deploy/rabbitmq -- rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers`  
Mostra o estado das filas (mensagens prontas, nao-confirmadas e consumidores).

## Debug operacional

`minikube kubectl -- get events -n users-import --sort-by=.metadata.creationTimestamp`  
Lista eventos do namespace em ordem cronologica (util para erros de scheduling, imagem, probe etc.).

`minikube kubectl -- logs -n users-import deploy/users-import-api --tail=200`  
Mostra os ultimos logs da API.

`minikube kubectl -- logs -n users-import deploy/users-import-worker --tail=200`  
Mostra os ultimos logs do worker.

## Stress test

`docker run --rm -i -v "${PWD}:/work" -w /work/stress grafana/k6 run k6-users-read.js -e BASE_URL=http://host.docker.internal:30080 -e VUS=50 -e DURATION=120s`  
Executa carga de leitura na API.

`docker run --rm -i -v "${PWD}:/work" -w /work/stress grafana/k6 run k6-import-users.js -e BASE_URL=http://host.docker.internal:30080 -e DURATION=120s -e JOBS_PER_SECOND=3 -e ROWS_PER_JOB=10`  
Executa carga de importacao, exercitando API + fila RabbitMQ + worker.

## Parar ambiente

`minikube stop`  
Para o cluster mantendo estado.

`minikube delete`  
Apaga o cluster local e todos os recursos dele.
