import {UnauthorizedException} from '@nestjs/common';

import type {TRequest} from './types/request';

/** `sub` из JWT после успешного Passport `validate` (AccessToken / RefreshToken). */
export function getJwtUserId(req: TRequest): string {
  const id = req.user?.sub;
  if (!id) {
    throw new UnauthorizedException();
  }
  return id;
}
