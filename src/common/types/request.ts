import {type Request} from 'express';

/** Payload JWT access/refresh после `validate` в стратегиях Passport. */
export type TJwtAuthUser = {
  sub: string;
  username: string;
};

export type TRequest = Omit<Request, 'cookies' | 'user'> & {
  cookies: Record<string, string>;
  user?: TJwtAuthUser;
};
