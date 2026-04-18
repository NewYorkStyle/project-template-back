import {ThrottlerStorageRedisService} from '@nest-lab/throttler-storage-redis';
import {seconds} from '@nestjs/throttler';

/** Дефолтный лимит для контроллеров с ThrottlerGuard (без @Throttle на методе). */
const GLOBAL_LIMIT = 300;
const GLOBAL_WINDOW_SEC = 60;

/** signUp / signIn / refresh */
const AUTH_LIMIT = 10;
const AUTH_WINDOW_SEC = 60;
const AUTH_BLOCK_SEC = 900;

/** OTP и смена email */
const OTP_LIMIT = 10;
const OTP_WINDOW_SEC = 60;

export const createThrottlerModuleOptions = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL is required for rate limiting');
  }

  return {
    skipIf: () => process.env.NODE_ENV === 'test',
    storage: new ThrottlerStorageRedisService(redisUrl),
    throttlers: [
      {
        limit: GLOBAL_LIMIT,
        name: 'default',
        ttl: seconds(GLOBAL_WINDOW_SEC),
      },
    ],
  };
};

/** Жёстче глобального: логин, регистрация, refresh. */
export const authRouteThrottle = {
  default: {
    blockDuration: seconds(AUTH_BLOCK_SEC),
    limit: AUTH_LIMIT,
    ttl: seconds(AUTH_WINDOW_SEC),
  },
};

/** OTP и смена email: счёт по sub из JWT, иначе по IP. */
export const otpRouteThrottle = {
  default: {
    limit: OTP_LIMIT,
    ttl: seconds(OTP_WINDOW_SEC),
    getTracker: (req: Record<string, unknown>) => {
      const user = req.user as {sub?: string} | undefined;
      if (typeof user?.sub === 'string') {
        return user.sub;
      }
      return String(req.ip ?? 'unknown');
    },
  },
};
