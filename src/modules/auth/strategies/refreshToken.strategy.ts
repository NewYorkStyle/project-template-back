import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Request} from 'express';
import {ExtractJwt, Strategy} from 'passport-jwt';
import 'dotenv/config';

type JwtPayload = {
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
        (request: Request) => {
          const refreshToken = request.cookies['refreshToken'];

          if (!refreshToken) {
            return null;
          }

          return refreshToken;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
