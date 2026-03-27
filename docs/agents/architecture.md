# Архитектура проекта

Контекст для AI-агентов: как менять код без поломки архитектуры и лишних итераций.

## Общая структура

| Слой                 | Расположение                                 | Назначение                                                                   |
| -------------------- | -------------------------------------------- | ---------------------------------------------------------------------------- |
| Точка входа          | `src/main.ts`                                | Bootstrap, Swagger (+ merge Zod `components.schemas`), CORS, `cookie-parser` |
| Корневой модуль      | `src/modules/app.module.ts`                  | Сборка feature-модулей                                                       |
| Feature-модули       | `src/modules/<name>/`                        | Изолированная область (auth, users, common, health, …)                       |
| Общая инфраструктура | `src/common/`                                | Guards, типы запроса, **глобальный** `PrismaModule`                          |
| Prisma               | `prisma/schema.prisma`, `prisma/migrations/` | Схема БД и миграции                                                          |
| Конфиг Prisma CLI    | `prisma.config.ts`                           | Путь к миграциям и `DATABASE_URL`                                            |

Типичный feature-модуль:

```
src/modules/users/
  controllers/users.controller.ts
  services/users.service.ts
  schemas/*.schema.ts
  users.module.ts
```

## Принципы разделения по модулям

- Один домен = один Nest `Module` с собственным `*.module.ts`.
- Контроллеры только маршрутизация и HTTP-детали (cookies, статус не через толстую логику).
- Сервисы — инжектируемые `@Injectable()`, вся работа с данными и сценарии.
- Перекрёстные зависимости: импортировать чужой модуль и использовать **экспортируемый** сервис (`UsersModule` экспортирует `UsersService` для `AuthModule`).
- Глобальные вещи: `PrismaModule` (`src/common/prisma/prisma.module.ts`), `MailModule` — помечены `@Global()`, подключаются один раз в `AppModule` (сейчас `MailModule` не импортирован в `AppModule` — его подтягивает `UsersModule` через цепочку; при добавлении почты в другие модули убедись, что `MailModule` доступен).

## Где бизнес-логика

- **Должна быть:** в сервисах (`*.service.ts`), иногда координация между несколькими сервисами из контроллера вызывается одной цепочкой без дублирования правил.
- **Не должна быть:** в контроллерах (см. [best-practices.md](best-practices.md) — раздел про бизнес-логику). Не в `main.ts`. Не в guards/strategies кроме извлечения/проверки токена.
