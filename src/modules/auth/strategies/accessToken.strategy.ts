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
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const accessToken = request.cookies['accessToken'];

          if (!accessToken) {
            return null;
          }

          return accessToken;
        },
      ]),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
