# Rangiffler

| Модуль | Что это | Порт |
|---|---|---|
| `rfr-auth` | Spring Authorization Server | 9001 |
| `rfr-api` | GraphQL API, фото отдаются из моков | 8081 |
| `rfr-gql-client` | React + Apollo | 3001 |

Нужны Java 25, Node.js и Docker.

```bash
docker compose up -d                   # MySQL 8.4.7 на 3306, root/secret
./gradlew :rfr-auth:bootRun            # http://localhost:9001
./gradlew :rfr-api:bootRun             # http://localhost:8081/graphiql
(cd rfr-gql-client && npm i && npm run dev)   # http://localhost:3001
```
