# Правила работы с NestJS

## Модули

- Создай `src/modules/<feature>/<feature>.module.ts`: `imports`, `controllers`, `providers`, при необходимости `exports`.
- Зарегистрируй модуль в `src/modules/app.module.ts` в массиве `imports`.

## Контроллеры

- Класс `@Controller('<prefix>')`, методы с HTTP-декораторами (`@Get`, `@Post`, …).
- Документация Swagger: `@ApiTags`, `@ApiOperation`, `@ApiBody`, `@ApiResponse` — **только через `$ref` на `components.schemas`**, см. [openapi-zod.md](openapi-zod.md).

## Сервисы

- Класс `@Injectable()`, зависимости через `constructor(private readonly x: X)`.
- Логику и обращение к БД держи здесь.

## Dependency Injection

- Регистрируй провайдеры в `providers` модуля.
- Чтобы другой модуль использовал сервис — добавь его в `exports` исходного модуля и импортируй модуль в потребителе.
- `PrismaService` бери из глобального `PrismaModule`; не создавай второй клиент вручную.

## Guards, interceptors, pipes

- **Guards:** JWT по cookie — `AccessTokenGuard` / `RefreshTokenGuard` (`src/common/guards/`). Вешай `@UseGuards(...)` на контроллер или метод.
- **Strategies:** `src/modules/auth/strategies/` — `passport-jwt`, токены читаются из **cookies** (`accessToken`, `refreshToken`), не из заголовка `Authorization`.
- **Pipes:** глобального `ValidationPipe` в `main.ts` нет; для тел запросов, где нужна проверка, используется **Zod** + `nestjs-zod` (`ZodValidationPipe` + схемы из `schemas/`), см. [openapi-zod.md](openapi-zod.md).
- **Interceptors / filters:** кастомных глобальных в проекте нет.

## Именование

- Файлы: `kebab-case` для некоторых guard-файлов (`accessToken.guard.ts`), остальное — `feature.type.ts` (`users.service.ts`).
- Классы: `PascalCase` (`UsersService`).
- Маршруты в проекте смешанные: есть action-style (`signUp`, `getParams`) и REST-style (`users/me`, `users/me/tours`).
