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
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: TRequest) => {
          const accessToken = request.cookies.accessToken;

          if (!accessToken) {
            return null;
          }

          return accessToken;
        },
      ]),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: TJwtPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
