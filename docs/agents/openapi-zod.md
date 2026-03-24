# OpenAPI + Zod

> Любое изменение API без соблюдения этих правил считается ошибкой.

Гибрид: **Zod — source of truth** для формы JSON; **NestJS Swagger** собирает `paths`, а **определения схем** подмешиваются из `@asteasolutions/zod-to-openapi` и в декораторах ссылаются через **`$ref`**.

## Основной принцип

- Все **request/response** схемы в Swagger описываются **только через Zod** (поля, примеры, описания — в `.openapi({ ... })` там, где нужно).
- В `@ApiBody` / `@ApiResponse` **нельзя** задавать inline-`schema` с `type`/`properties`/`example` — только **`$ref: '#/components/schemas/<ИмяDto>'`**.
- Имена компонентов в OpenAPI заканчиваются на **`Dto`** (например `SignInDto`, `UserProfileDto`), консистентно с `scripts/verify-zod-openapi.ts`.

## Как добавить новый endpoint (контракт + Swagger)

1. Создать файл схемы, например `src/modules/<feature>/schemas/my-action.schema.ts`, описать Zod **без изменения фактического JSON** (валидация = контракт API).
2. На корне схемы (или там, где принято в модуле) указать регистрацию имени: `.openapi('MyActionDto')` для объектов; для ответов-строк — см. `src/common/schemas/http-ok-string-responses.schema.ts`.
3. Вызвать **`registerSchema('MyActionDto', myActionSchema)`** в `src/common/register-zod-schemas.ts` (имя совпадает с `$ref`).
4. В контроллере: **`ZodValidationPipe`** на body (если нужно) и Swagger только через **`$ref`**.

Пример тела запроса (строка в `$ref` должна совпадать с именем при **`registerSchema`** / **`.openapi('…')`**, например `SignUpDto`, `UpdateUserDto`):

```ts
@ApiBody({
  description: 'Кратко, по-русски или по-английски',
  schema: {
    $ref: '#/components/schemas/SignUpDto',
  },
})
```

Аналогично для ответа:

```ts
@ApiResponse({
  status: 200,
  description: 'Успех',
  schema: {
    $ref: '#/components/schemas/SignUpOkResponseDto',
  },
})
```

## Точки сборки

- **`src/common/zod-openapi.ts`** — один раз `extendZodWithOpenApi(z)`, общий `OpenAPIRegistry`, **`registerSchema`**, **`generateOpenApiComponents`**.
- **`src/common/register-zod-schemas.ts`** — побочная регистрация всех схем в registry (импортируется из `main.ts` до `AppModule`).
- **`src/main.ts`** — после `SwaggerModule.createDocument` в **`components.schemas`** мержатся схемы из **`generateOpenApiComponents()`** (без удаления уже сгенерированных Nest-частей).

## Запрещено

- Писать структуру JSON **вручную** в `@ApiBody` / `@ApiResponse` (любые `type`, `properties`, вложенные объекты без `$ref`).
- Заводить **классы DTO** под Swagger вместо Zod (контракт = схема Zod + `T*`-тип из `z.infer`).
- **Дублировать** одну и ту же форму двумя разными именами в `components.schemas` без причины; переиспользуй одну зарегистрированную схему и `$ref`.
- Добавлять схему в registry, **не ссылаясь** на неё из контроллеров (и наоборот — `$ref` на несуществующий компонент): сломает консистентность.

## Проверка (`verify:openapi`)

- После изменений контрактов обязательно: **`npm run verify:openapi`**.
- Скрипт сверяет множество **`registerSchema`** / сгенерированных имён с **фиксированным списком схем, используемых в `$ref`** в контроллерах.
- Если скрипт падает: либо **не зарегистрирована** схема / неверное имя, либо в registry есть **лишняя** схема, либо в контроллере **опечатка** в `$ref`.

## Примеры из проекта

### Controller (фрагмент)

```ts
// src/modules/auth/controllers/auth.controller.ts (идея)
@Post('signIn')
@ApiBody({
  schema: {$ref: '#/components/schemas/SignInDto'},
})
@ApiResponse({
  status: 200,
  schema: {$ref: '#/components/schemas/SignInOkResponseDto'},
})
async signIn(
  @Body(new ZodValidationPipe(signInSchema)) data: TSignInDto,
  @Res({passthrough: true}) res: Response
): Promise<string> {
  const {accessToken, refreshToken, userId} =
    await this.authService.signIn(data);
  res.cookie('refreshToken', refreshToken, httpOnlyCookieConfig);
  res.cookie('accessToken', accessToken, httpOnlyCookieConfig);
  return 'User logged in';
}
```

### Zod-схема

```ts
// src/modules/auth/schemas/sign-in.schema.ts (фрагмент)
export const signInSchema = z
  .object({
    password: z.string().openapi({
      description: 'User account password',
      example: 'Qwerty123',
    }),
    username: z.string().openapi({
      description: 'Unique username for sign in',
      example: 'john_doe',
    }),
  })
  .openapi('SignInDto');
```
