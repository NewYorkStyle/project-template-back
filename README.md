# project-template-back

Backend-заготовка на **NestJS** + **Prisma** (PostgreSQL): auth (JWT в cookies), пользователи, OTP, почта, health, Swagger.

## Быстрый старт

1. Скопируй `.example.env` в `.env` и заполни переменные.
2. `npm install`
3. `npm run prisma:migrate:dev` — применить схему БД.
4. `npm run dev` — сервер с watch (порт из `PORT`, по умолчанию 3000).

Сборка: `npm run build` · прод: `npm run prod`

## Документация API

[Swagger UI](http://localhost:3000/swagger) · JSON: `/swagger/json`
