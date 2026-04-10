# project-template-back

Backend-заготовка на **NestJS** + **Prisma** (PostgreSQL): auth (JWT в cookies), пользователи, OTP, почта, health, Swagger.

## Быстрый старт

1. Скопируй `.example.env` в `.env` и заполни переменные.
2. `pnpm install`
3. `pnpm run prisma:migrate:dev` — применить схему БД.
4. `pnpm run dev` — сервер с watch (порт из `PORT`, по умолчанию 3000).

Сборка: `pnpm run build` · прод: `pnpm run prod`

## Документация API

[Swagger UI](http://localhost:3000/swagger) · JSON: `/swagger/json`
