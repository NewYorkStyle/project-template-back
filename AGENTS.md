# AGENTS.md — правила работы с backend (NestJS + TypeScript)

Контекст для AI-агентов: как менять код без поломки архитектуры и лишних итераций.

## Язык ответов

- Все ответы и предложения по коду формулируй на русском языке.
- Технические термины (API, HTTP, SQL и т.д.) оставляй на английском.

---

## 1. Архитектура проекта

### Общая структура

| Слой                 | Расположение                                 | Назначение                                             |
| -------------------- | -------------------------------------------- | ------------------------------------------------------ |
| Точка входа          | `src/main.ts`                                | Bootstrap, Swagger, CORS, `cookie-parser`              |
| Корневой модуль      | `src/modules/app.module.ts`                  | Сборка feature-модулей                                 |
| Feature-модули       | `src/modules/<name>/`                        | Изолированная область (auth, users, common, health, …) |
| Общая инфраструктура | `src/common/`                                | Guards, типы запроса, **глобальный** `PrismaModule`    |
| Prisma               | `prisma/schema.prisma`, `prisma/migrations/` | Схема БД и миграции                                    |
| Конфиг Prisma CLI    | `prisma.config.ts`                           | Путь к миграциям и `DATABASE_URL`                      |

Типичный feature-модуль:

```
src/modules/users/
  controllers/users.controller.ts
  services/users.service.ts
  dto/
  users.module.ts
```

### Принципы разделения по модулям

- Один домен = один Nest `Module` с собственным `*.module.ts`.
- Контроллеры только маршрутизация и HTTP-детали (cookies, статус не через толстую логику).
- Сервисы — инжектируемые `@Injectable()`, вся работа с данными и сценарии.
- Перекрёстные зависимости: импортировать чужой модуль и использовать **экспортируемый** сервис (`UsersModule` экспортирует `UsersService` для `AuthModule`).
- Глобальные вещи: `PrismaModule` (`src/common/prisma/prisma.module.ts`), `MailModule` — помечены `@Global()`, подключаются один раз в `AppModule` (сейчас `MailModule` не импортирован в `AppModule` — его подтягивает `UsersModule` через цепочку; при добавлении почты в другие модули убедись, что `MailModule` доступен).

### Где бизнес-логика

- **Должна быть:** в сервисах (`*.service.ts`), иногда координация между несколькими сервисами из контроллера вызывается одной цепочкой без дублирования правил.
- **Не должна быть:** в контроллерах (см. §6). Не в `main.ts`. Не в guards/strategies кроме извлечения/проверки токена.

---

## 2. Правила работы с NestJS

### Модули

- Создай `src/modules/<feature>/<feature>.module.ts`: `imports`, `controllers`, `providers`, при необходимости `exports`.
- Зарегистрируй модуль в `src/modules/app.module.ts` в массиве `imports`.

### Контроллеры

- Класс `@Controller('<prefix>')`, методы с HTTP-декораторами (`@Get`, `@Post`, …).
- Документация Swagger: `@ApiTags`, `@ApiOperation`, `@ApiBody`, `@ApiResponse` — как в `src/modules/auth/controllers/auth.controller.ts`.

### Сервисы

- Класс `@Injectable()`, зависимости через `constructor(private readonly x: X)`.
- Логику и обращение к БД держи здесь.

### Dependency Injection

- Регистрируй провайдеры в `providers` модуля.
- Чтобы другой модуль использовал сервис — добавь его в `exports` исходного модуля и импортируй модуль в потребителе.
- `PrismaService` бери из глобального `PrismaModule`; не создавай второй клиент вручную.

**Нестандарт:** `CommonModule` (`src/modules/common/common.module.ts`) дублирует `PrismaService` в своих `providers`. Глобальный инстанс уже есть; для нового кода инжектируй стандартно через один `PrismaModule`, не добавляй лишних копий `PrismaService` в новые модули.

### Guards, interceptors, pipes

- **Guards:** JWT по cookie — `AccessTokenGuard` / `RefreshTokenGuard` (`src/common/guards/`). Вешай `@UseGuards(...)` на контроллер или метод.
- **Strategies:** `src/modules/auth/strategies/` — `passport-jwt`, токены читаются из **cookies** (`accessToken`, `refreshToken`), не из заголовка `Authorization`.
- **Pipes:** глобального `ValidationPipe` в `main.ts` нет — входные данные по сути не валидируются декораторами (см. §3).
- **Interceptors / filters:** кастомных глобальных в проекте нет.

### Именование

- Файлы: `kebab-case` для некоторых guard-файлов (`accessToken.guard.ts`), остальное — `feature.type.ts` (`users.service.ts`).
- Классы: `PascalCase` (`UsersService`).
- Маршруты в проекте: **действие в camelCase** (`signUp`, `getProfile`, `getParams`), не REST-only `/users/:id`.

---

## 3. Работа с API

### REST и структура маршрутов

- Глобального префикса API (`/api/v1`) **нет**.
- Swagger: `GET /swagger`, JSON: `/swagger/json`.
- Примеры префиксов:
  - `POST /auth/signUp`, `POST /auth/signIn`, `GET /auth/logout`, `GET /auth/refresh`
  - `GET /users/getProfile`, `POST /users/update`, … (все под `AccessTokenGuard` на классе)
  - `GET /common/params/getParams`
  - `GET /health`

### Формат запросов/ответов

- JSON body для POST; ответы — строки вроде `'User registred'`, объекты профиля (без пароля), массив имён permissions.
- Аутентификация: после логина токены в **httpOnly cookies** (`accessToken`, `refreshToken`, `userId`, `isUserLoggedIn`).

### Ошибки

- Бросай исключения Nest: `BadRequestException`, `ForbiddenException`, `NotFoundException`, `UnauthorizedException` из `@nestjs/common`.
- Глобальных exception filters **нет** — формат ответа стандартный Nest.

### Валидация

- **class-validator / class-transformer в DTO не используются** (нет `class-validator` в зависимостях).
- DTO — обычные классы TypeScript; проверки вручную в сервисах (например `AuthService.validatePassword`).

Перед добавлением новой валидации: либо сохранить ручной стиль как в `AuthService`, либо согласованно внедрить `ValidationPipe` + `class-validator` в `main.ts` и обновить DTO — не смешивай без договорённости.

---

## 4. DTO и типизация

### Как создавать DTO

- Файлы в `src/modules/<feature>/dto/`, реэкспорт из `dto/index.ts` при необходимости.
- Пример: `CreateUserDto` — поля `username`, `password`, `email` (`src/modules/users/dto/create-user.dto.ts`).
- `UpdateUserDto` extends `PartialType(CreateUserDto)` из `@nestjs/mapped-types` (`src/modules/users/dto/update-user.dto.ts`).

### DTO vs «сущность»

- **ORM-модели:** только типы из `@prisma/client` (`User`, `Permission`, …). Не путай с DTO.
- **В ответ API:** не отдавай полный `User` с `password` / `refreshToken`. Проект уже мапит вручную (например `getProfile` возвращает только ФИО и email).

### Маппинг

- Отдельного слоя mapper **нет**; маппинг в контроллере через `.then()` / объектный литерал или в сервисе.

### Запрещено

- Возвращать prisma-объект пользователя с секретными полями из контроллера.
- Добавлять `@Injectable()` на DTO (DTO не сервисы).

---

## 5. Работа с базой данных (Prisma)

### Модели

- Единственный источник правды: `prisma/schema.prisma`.
- Модели: `User`, `Otp`, `Param`, `Permission`, `UserPermission` (см. `@@map` для имён таблиц).

### Запросы

- Инжектируй `PrismaService` (`src/common/prisma/prisma.service.ts`) и вызывай `this.prisma.user.findUnique`, `create`, `update`, и т.д.
- **Нестандарт:** клиент создаётся с адаптером `@prisma/adapter-pg` и `connectionString: process.env.DATABASE_URL`.

Пример запроса из проекта:

```ts
// src/modules/users/services/users.service.ts (фрагмент)
return this.prisma.user.findUnique({
  where: {username: login},
});
```

### Транзакции

- Явного использования `$transaction` в коде **нет**. При необходимости добавляй `await this.prisma.$transaction([...])` для атомарных операций.

### Миграции

- Команды из `package.json`: `npm run prisma:migrate:dev`, `npm run prisma:migrate:deploy`, `npm run db:reset`.
- Файлы: `prisma/migrations/<name>/migration.sql`.
- После изменения схемы: обнови `schema.prisma`, сгенерируй миграцию, закоммить SQL.

### Антипаттерны

- Сырой SQL с обходом Prisma без причины.
- Дублирование `PrismaService` в `providers` каждого модуля.
- Хранение паролей в открытом виде (используется `argon2` в `AuthService` / проверки в контроллере удаления).

---

## 6. Бизнес-логика

- **Место:** сервисы. Сложные сценарии — методы в том же сервисе или выделение отдельного класса в том же модуле, если файл разрастается.
- **Контроллер:** вызов сервиса, при необходимости установка/clear cookies, маппинг ответа. В проекте есть отклонение: `UsersController.remove` проверяет пароль через `argon2` — это бизнес-правило; для нового кода предпочтительно переносить в `UsersService` или `AuthService` для единообразия.

### Разделение тяжёлых сервисов

- Выносить подзадачи в другие сервисы (`OtpService`, `MailService`, `PermissionsService`) и импортировать модули.
- Константы перечислений в `constants/`.

---

## 7. Аутентификация и авторизация

### Механизм

- **JWT** через `@nestjs/jwt` и `passport-jwt`.
- Токены передаются в **cookies**, не в `Authorization: Bearer`.
- Access и refresh секреты: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (см. `AuthService.getTokens`).

### Guards

- `AccessTokenGuard` → `strategy('jwt')` → `AccessTokenStrategy` (cookie `accessToken`).
- `RefreshTokenGuard` → `jwt-refresh` → `RefreshTokenStrategy` (cookie `refreshToken`).

### Роли и доступы

- Не RBAC-ролями, а **записями в БД**: `permissions` + `user_permissions`.
- Имена в коде: enum `E_PERMISSIONS` в `src/modules/permissions/contants/index.ts` (например `EMAIL_VERIFIED`).
- Получение списка прав: `PermissionsService.getUserPermissions` — `GET /users/permissions`.

---

## 8. Ошибки и логирование

### Логирование

- В `OtpCleanupService` используется `Logger` из `@nestjs/common` — это эталон для фоновых задач.
- В `UsersService.clearRefreshToken` встречается `console.log` — для нового кода используй `Logger` вместо `console`.

### Ошибки

- Для сбоев бизнес-логики — `HttpException` наследники.
- В `OtpService` при ошибке парсинга `metadata` бросается голый `Error` — лучше `BadRequestException` для единообразия API.

---

## 9. Тестирование

- Jest настроен в `package.json` (`testRegex: .*\.spec\.ts$`, `rootDir: src`).
- Файлов `*.spec.ts` в репозитории **нет** — тесты нужно добавлять с нуля.
- e2e-папки нет; `@nestjs/testing` и `supertest` в devDependencies — при появлении e2e обычно `test/` или `test/jest-e2e.json`.

---

## 10. Best Practices

### Делай так

- Импортируй `PrismaService` из глобального модуля; один инстанс на приложение.
- Возвращай из API минимальные DTO/объекты без секретов.
- Подключай новый feature через `AppModule`.
- Следуй существующим путям: `src/modules/<feature>/`.
- Для Swagger дублируй контракты через `@Api*` декораторы.
- Используй `TRequest` из `src/common/types/request.ts` там, где нужны типизированные `cookies`.

### Не делай так

- Не добавляй `ValidationPipe` только в один метод без политики для всего приложения — будет непоследовательно.
- Не храни секреты в коде — только `process.env`.
- Не прокидывай `PrismaClient` везде в обход `PrismaService`.
- Не используй `console.log` в прод-коде для важных событий.

### Частые ошибки AI в NestJS

- Забыть добавить модуль в `imports` или `exports`.
- Зарегистрировать guard без соответствующей `PassportStrategy` в `providers` модуля.
- Ожидать JWT в заголовке — здесь токены в cookies.
- Создать циклический импорт модулей (используй `forwardRef` только если нельзя перестроить зависимости).
- Править `schema.prisma` без миграции.

---

## 11. Как добавлять новый функционал

### Новый endpoint

1. Определи модуль (существующий или новый).
2. Добавь метод в `controller` с `@Get`/`@Post` и при необходимости `@UseGuards(AccessTokenGuard)`.
3. Реализуй логику в `service`, инжектируя зависимости.
4. При необходимости добавь DTO в `dto/`.
5. Добавь `@ApiOperation` / `@ApiResponse`.
6. Прогони `npm run lint` и `npm run build`.

### Новый модуль

1. `nest g module modules/feature` или создай папку вручную по образцу `src/modules/health/`.
2. `controllers/`, `services/`, `*.module.ts`.
3. Импорт в `src/modules/app.module.ts`.
4. Если нужен доступ к БД — только `PrismaService` (модуль уже глобальный).

### Новая сущность (таблица)

1. Измени `prisma/schema.prisma`.
2. `npm run prisma:migrate:dev` (имя миграции осмысленное).
3. `npm run prisma:generate` (в dev часто уже в `npm run dev`).
4. Используй типы из `@prisma/client` в сервисах.

---

## 12. Примеры кода из проекта

### Controller (фрагмент)

```ts
// src/modules/auth/controllers/auth.controller.ts
@Post('signIn')
async signIn(
  @Body() data: AuthDto,
  @Res({passthrough: true}) res: Response
): Promise<string> {
  const {accessToken, refreshToken, userId} =
    await this.authService.signIn(data);
  res.cookie('refreshToken', refreshToken, httpOnlyCookieConfig);
  res.cookie('accessToken', accessToken, httpOnlyCookieConfig);
  // ...
  return 'User logged in';
}
```

### Service

```ts
// src/modules/auth/services/auth.service.ts (фрагмент)
async signIn(data: AuthDto) {
  const user = await this.usersService.findByUsername(data.username);
  if (!user) throw new BadRequestException('User does not exist');
  const passwordMatches = await argon2.verify(user.password, data.password);
  if (!passwordMatches)
    throw new BadRequestException('Password is incorrect');
  const tokens = await this.getTokens(user.id, user.username);
  await this.updateRefreshToken(user.id, tokens.refreshToken);
  return {...tokens, userId: user.id};
}
```

### DTO

```ts
// src/modules/users/dto/create-user.dto.ts
export class CreateUserDto {
  username: string;
  password: string;
  email: string;
}
```

### Запрос к БД (Prisma)

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

---

## Нестандартные решения (кратко)

| Что                                              | Где                                                                                                  |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| JWT в cookies, не в заголовке                    | `AccessTokenStrategy`, `RefreshTokenStrategy`                                                        |
| Prisma + `adapter-pg`                            | `src/common/prisma/prisma.service.ts`                                                                |
| Конфиг `prisma.config.ts`                        | Отдельно от `schema.prisma`                                                                          |
| `CommonModule` регистрирует свой `PrismaService` | Дублирование с глобальным модулем                                                                    |
| `@Cron` в `OtpCleanupService`                    | Требуется `ScheduleModule.forRoot()` в корневом модуле — **проверь наличие**, иначе cron не работает |
| Без глобального `ValidationPipe`                 | Валидация вручную в сервисах                                                                         |

---

Обновляй этот файл при смене глобальных правил (валидация, префикс API, способ авторизации).
