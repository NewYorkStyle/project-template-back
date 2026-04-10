# Работа с базой данных (Prisma)

## Модели

- Единственный источник правды: `prisma/schema.prisma`.
- Модели: `User`, `Otp`, `Param`, `Permission`, `UserPermission` (см. `@@map` для имён таблиц).

## Запросы

- Инжектируй `PrismaService` (`src/common/prisma/prisma.service.ts`) и вызывай `this.prisma.user.findUnique`, `create`, `update`, и т.д.
- **Нестандарт:** клиент создаётся с адаптером `@prisma/adapter-pg` и `connectionString: process.env.DATABASE_URL`.

Пример запроса из проекта:

```ts
// src/modules/users/services/users.service.ts (фрагмент)
return this.prisma.user.findUnique({
  where: {username: login},
});
```

## Транзакции

- Явного использования `$transaction` в коде **нет**. При необходимости добавляй `await this.prisma.$transaction([...])` для атомарных операций.

## Миграции

- Команды из `package.json`: `npm run prisma:migrate:dev`, `npm run prisma:migrate:deploy`, `npm run db:reset`.
- Файлы: `prisma/migrations/<name>/migration.sql`.
- После изменения схемы: обнови `schema.prisma`, сгенерируй миграцию, закоммить SQL.

## Сиды

- **Конфигурация:** команда запуска задана в `prisma.config.ts` в `migrations.seed` (`tsx ./prisma/seed/index.ts`). Отдельного `prisma.seed` в `package.json` нет — источник правды один.
- **Точка входа:** `prisma/seed/index.ts` — загружает `dotenv`, проверяет `DATABASE_URL`, создаёт `PrismaClient` с тем же адаптером `@prisma/adapter-pg`, что и приложение, вызывает функции сидов и в конце `disconnect`.
- **Запуск вручную:** `pnpm prisma db seed` (или `npx prisma db seed`).
- **Вместе с обнулением БД:** `pnpm db:reset` (`prisma migrate reset`) после миграций выполняет сид автоматически.
- **Структура кода:** логику выноси в отдельные файлы рядом с `index.ts`, например `prisma/seed/permissions.seed.ts`, и экспортируй async-функции вида `(prisma: PrismaClient) => Promise<void>`. В `index.ts` только оркестрация и порядок вызовов.
- **Идемпотентность:** для справочных данных используй `upsert` (как в `seedPermissions`), чтобы повторный запуск не ломал данные и обновлял описания при необходимости.
- **Согласованность с кодом:** строковые ключи сущностей (например имена permissions) держи в синхроне с константами приложения — в проекте для прав используется `E_PERMISSIONS` из `src/modules/permissions/constants`.

## Антипаттерны

- Сырой SQL с обходом Prisma без причины.
- Дублирование `PrismaService` в `providers` каждого модуля.
- Хранение паролей в открытом виде (используется `argon2` в `AuthService` / проверки в контроллере удаления).

## Пример запроса с relations

```ts
// src/modules/permissions/services/permissions.service.ts (фрагмент)
const user = await this.prisma.user.findUnique({
  where: {id: userId},
  include: {
    userPermissions: {include: {permission: true}},
  },
});
return user.userPermissions.map((up) => up.permission.name);
```
