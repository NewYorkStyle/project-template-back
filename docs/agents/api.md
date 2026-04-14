# Работа с API

## REST и структура маршрутов

- Глобального префикса API (`/api/v1`) **нет**.
- Swagger: `GET /swagger`, JSON: `/swagger/json`.
- Примеры префиксов:
  - `POST /auth/signUp`, `POST /auth/signIn`, `GET /auth/logout`, `GET /auth/refresh`
  - `GET /users/me`, `POST /users/update`, … (все под `AccessTokenGuard` на классе)
  - `GET /users/me/tours`, `POST /users/me/tours/seen`
  - `GET /common/params/getParams`
  - `GET /health`

## Формат запросов/ответов

- JSON body для POST; ответы — строки вроде `'User registred'`, объекты профиля (без пароля), массив имён permissions.
- Аутентификация: после логина токены в **httpOnly cookies** (`accessToken`, `refreshToken`, `isUserLoggedIn`); идентификатор пользователя — только в теле ответа при `signUp` / `signIn` (`{ userId }`), для защищённых маршрутов — из JWT (`sub` в payload), не из cookies.

## Ошибки

- Бросай исключения Nest: `BadRequestException`, `ForbiddenException`, `NotFoundException`, `UnauthorizedException` из `@nestjs/common`.
- Глобальных exception filters **нет** — формат ответа стандартный Nest.

## Валидация

- **class-validator / class-transformer** в проекте **не используются**.
- Контракт тела запроса и документация OpenAPI строятся на **Zod** (`*.schema.ts`) + при необходимости `ZodValidationPipe`; дополнительные проверки — в сервисах (например сложные правила в `signUpSchema.superRefine`).

Перед добавлением новой валидации: расширяй Zod-схемы и регистрируй их для OpenAPI ([openapi-zod.md](openapi-zod.md)); не смешивай без договорённости отдельный глобальный `ValidationPipe` + `class-validator`.

## DTO и типизация

### Контракты API (Zod)

- Файлы: **`src/modules/<feature>/schemas/*.schema.ts`**, реэкспорт из `schemas/index.ts` при необходимости.
- Типы для TS: **`export type TSignInDto = z.infer<typeof signInSchema>`** и т.п.
- Пример полей запроса: `signInSchema`, `signUpSchema`, `createUserSchema` — в `src/modules/auth/schemas`, `src/modules/users/schemas`.

### DTO vs «сущность»

- **ORM-модели:** только типы из `@prisma/client` (`User`, `Permission`, …). Не путай с DTO.
- **В ответ API:** не отдавай полный `User` с `password` / `refreshToken`. Проект уже мапит вручную (например `GET /users/me` возвращает только ФИО и email).

### Маппинг

- Отдельного слоя mapper **нет**; маппинг в контроллере через `.then()` / объектный литерал или в сервисе.

### Запрещено

- Возвращать prisma-объект пользователя с секретными полями из контроллера.
- Помечать Zod-схемы или объекты контракта как Nest-провайдеры с `@Injectable()` (это не сервисы).
