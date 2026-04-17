const CACHE_PREFIX = 'cache';

/** TTL кеша списка param (в приложении нет мутаций; после сидов возможен устаревший снимок до истечения). */
export const APP_PARAMS_CACHE_TTL_SEC = 600;

/** TTL кеша списка permissions пользователя. */
export const USER_PERMISSIONS_CACHE_TTL_SEC = 120;

export const APP_PARAMS_CACHE_KEY = `${CACHE_PREFIX}:app:params`;

export const userPermissionsCacheKey = (userId: string): string =>
  `${CACHE_PREFIX}:user:permissions:${userId}`;
