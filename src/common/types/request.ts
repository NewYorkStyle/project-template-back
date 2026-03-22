import {type Request} from 'express';

export type TRequest = Omit<Request, 'cookies'> & {
  cookies: Record<string, string>;
};
