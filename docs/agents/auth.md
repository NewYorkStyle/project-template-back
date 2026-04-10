# Аутентификация и авторизация

## Механизм

- **JWT** через `@nestjs/jwt` и `passport-jwt`.
- Токены передаются в **cookies**, не в `Authorization: Bearer`.
- Access и refresh секреты: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (см. `AuthService.getTokens`).

## Guards

- `AccessTokenGuard` → `strategy('jwt')` → `AccessTokenStrategy` (cookie `accessToken`).
- `RefreshTokenGuard` → `jwt-refresh` → `RefreshTokenStrategy` (cookie `refreshToken`).

## Роли и доступы

- Не RBAC-ролями, а **записями в БД**: `permissions` + `user_permissions`.
- Имена в коде: enum `E_PERMISSIONS` в `shared/constants/permissions.ts` (реэкспорт из `shared/constants`), например `EMAIL_VERIFIED`.
- Получение списка прав: `PermissionsService.getUserPermissions` — `GET /users/permissions`.

## Пример сервиса (фрагмент)

```ts
// src/modules/auth/services/auth.service.ts (фрагмент)
async signIn(data: TSignInDto) {
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
