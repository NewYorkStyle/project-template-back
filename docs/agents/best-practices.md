# Best practices и сопутствующие темы

## Бизнес-логика

- **Место:** сервисы. Сложные сценарии — методы в том же сервисе или выделение отдельного класса в том же модуле, если файл разрастается.
- **Контроллер:** вызов сервиса, при необходимости установка/clear cookies, маппинг ответа. В проекте есть отклонение: `UsersController.remove` проверяет пароль через `argon2` — это бизнес-правило; для нового кода предпочтительно переносить в `UsersService` или `AuthService` для единообразия.

### Разделение тяжёлых сервисов

- Выносить подзадачи в другие сервисы (`OtpService`, `MailService`, `PermissionsService`) и импортировать модули.
- Перечисления, общие для сидов, Prisma и нескольких модулей (например имена permissions), держи в `shared/constants/`. Локальные для модуля — в `src/modules/<feature>/constants/`.

---

## Ошибки и логирование

### Логирование

- В `OtpCleanupService` используется `Logger` из `@nestjs/common` — это эталон для фоновых задач.
- В `UsersService.clearRefreshToken` встречается `console.log` — для нового кода используй `Logger` вместо `console`.

### Ошибки

- Для сбоев бизнес-логики — `HttpException` наследники.
- В `OtpService` при ошибке парсинга `metadata` бросается голый `Error` — лучше `BadRequestException` для единообразия API.

---

## Тестирование

- Jest настроен в `package.json` (`testRegex: .*\.spec\.ts$`, `rootDir: src`).
- Файлов `*.spec.ts` в репозитории **нет** — тесты нужно добавлять с нуля.
- e2e-папки нет; `@nestjs/testing` и `supertest` в devDependencies — при появлении e2e обычно `test/` или `test/jest-e2e.json`.

---

## Best Practices (чеклист)

### Делай так

- Импортируй `PrismaService` из глобального модуля; один инстанс на приложение.
- Возвращай из API минимальные DTO/объекты без секретов.
- Подключай новый feature через `AppModule`.
- Следуй существующим путям: `src/modules/<feature>/`.
- Для Swagger в `@ApiBody` / `@ApiResponse` указывай только **`$ref`** на схемы из Zod ([openapi-zod.md](openapi-zod.md)); не дублируй JSON-схему вручную.
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

## Как добавлять новый функционал

### Новый endpoint

1. Определи модуль (существующий или новый).
2. Добавь Zod-схемы тела/ответа в `schemas/`, `.openapi('…Dto')`, **`registerSchema`** и **`$ref`** в контроллере ([openapi-zod.md](openapi-zod.md)).
3. Добавь метод в `controller` с `@Get`/`@Post` и при необходимости `@UseGuards(AccessTokenGuard)`.
4. Реализуй логику в `service`, инжектируя зависимости; при необходимости `ZodValidationPipe` на `@Body`.
5. Добавь `@ApiTags` / `@ApiOperation` / `@ApiBody` / `@ApiResponse` (только **`$ref`**).
6. Прогони **`npm run verify:openapi`**, `npm run lint` и `npm run build`.

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

## Нестандартные решения (кратко)

| Что                                              | Где                                                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| JWT в cookies, не в заголовке                    | `AccessTokenStrategy`, `RefreshTokenStrategy`                                                                           |
| Prisma + `adapter-pg`                            | `src/common/prisma/prisma.service.ts`                                                                                   |
| Конфиг `prisma.config.ts`                        | Отдельно от `schema.prisma`                                                                                             |
| `CommonModule` регистрирует свой `PrismaService` | Дублирование с глобальным модулем                                                                                       |
| `@Cron` в `OtpCleanupService`                    | Требуется `ScheduleModule.forRoot()` в корневом модуле — **проверь наличие**, иначе cron не работает                    |
| Без глобального `ValidationPipe`                 | Тела запросов: Zod + `ZodValidationPipe` там, где нужно; сервисы — доп. правила                                         |
| OpenAPI: Zod + Swagger hybrid                    | `zod-openapi.ts`, `register-zod-schemas.ts`, merge в `main.ts`, в контроллерах только `$ref`; проверка `verify:openapi` |

---

Обновляй файлы в `docs/agents/` и корневой `AGENTS.md` при смене глобальных правил (валидация, префикс API, способ авторизации, OpenAPI/Zod).
