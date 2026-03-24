# AGENTS.md

Правила для AI-агентов при работе с backend (NestJS + TypeScript). Детали — в `docs/agents/`.

## Язык ответов

- Ответы и предложения по коду — на русском языке.
- Технические термины (API, HTTP, SQL и т.д.) оставляй на английском.

## Как работать

Перед изменением кода:

1. Определи тип задачи (архитектура, Nest, API, контракт OpenAPI, БД, auth, общие практики).
2. Открой соответствующий файл в `docs/agents/`.

## Карта документации

| Тема                              | Файл                                                           |
| --------------------------------- | -------------------------------------------------------------- |
| Архитектура                       | [docs/agents/architecture.md](docs/agents/architecture.md)     |
| NestJS                            | [docs/agents/nest-rules.md](docs/agents/nest-rules.md)         |
| API (маршруты, ошибки, DTO)       | [docs/agents/api.md](docs/agents/api.md)                       |
| OpenAPI + Zod                     | [docs/agents/openapi-zod.md](docs/agents/openapi-zod.md)       |
| Prisma                            | [docs/agents/prisma.md](docs/agents/prisma.md)                 |
| Auth                              | [docs/agents/auth.md](docs/agents/auth.md)                     |
| Best practices, тесты, новые фичи | [docs/agents/best-practices.md](docs/agents/best-practices.md) |

## Важно

- Любые изменения контракта API — строго по правилам в **openapi-zod.md** (`$ref`, `registerSchema`, без inline-схем в декораторах).
- После правок OpenAPI обязательно:

```bash
npm run verify:openapi
```

Маршрутизатор обновляй вместе с `docs/agents/`, если меняются глобальные правила (валидация, префикс API, авторизация, OpenAPI/Zod).

## Автоправила для AI

Если ты меняешь:

- controller → обязательно открыть docs/agents/api.md и openapi-zod.md
- schema → открыть docs/agents/openapi-zod.md
- prisma / БД → открыть docs/agents/prisma.md
- auth → открыть docs/agents/auth.md
