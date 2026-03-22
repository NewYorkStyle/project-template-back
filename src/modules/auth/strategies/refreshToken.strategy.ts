import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';

import {TRequest} from '../../../common';

import 'dotenv/config';

type TJwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: TRequest) => {
          const refreshToken = request.cookies.refreshToken;

          if (!refreshToken) {
            return null;
          }

          return refreshToken;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  validate(payload: TJwtPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
