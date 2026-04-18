# project-template-back

Backend-заготовка на **NestJS** + **Prisma** (PostgreSQL) + **Redis** (OTP, rate limit): auth (JWT в cookies), пользователи, почта, health, Swagger.

Лимиты запросов: `@nestjs/throttler` + Redis; пороги заданы в коде — [`src/common/throttler/throttler-options.ts`](src/common/throttler/throttler-options.ts).

Кеш ответов в Redis (TTL в коде): `getParams` и `getUserPermissions` — [`src/common/cache/cache-keys.ts`](src/common/cache/cache-keys.ts), [`RedisJsonCacheService`](src/common/cache/redis-json-cache.service.ts).

## Быстрый старт

1. Скопируй `.example.env` в `.env` и заполни переменные (в т.ч. `POSTGRES_*`, `REDIS_URL`, `DATABASE_URL`).
2. Подними Postgres и Redis через Docker (см. ниже) **или** установи их локально.
3. `pnpm install`
4. `pnpm run prisma:migrate:dev` — применить схему БД.
5. `pnpm run dev` — сервер с watch (порт из `PORT`, по умолчанию 3000).

### Docker Compose (только Postgres + Redis)

Бэкенд при этом запускается на машине (`pnpm dev`), не в контейнере.

Нужен `.env` (скопируй из `.example.env`). Важно: **`DATABASE_URL` и `REDIS_URL` должны указывать на `localhost`** с теми же портами, что в `POSTGRES_PORT` и `REDIS_PORT` (по умолчанию 5432 и 6379).

`docker compose -f docker-compose.dev.yaml up -d`

Остановка: `docker compose -f docker-compose.dev.yaml down` (данные Postgres в volume `postgres_dev_data` сохраняются).

Сборка: `pnpm run build` · прод: `pnpm run prod`

## Документация API

[Swagger UI](http://localhost:3000/swagger) · JSON: `/swagger/json`
