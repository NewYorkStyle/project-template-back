import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as argon2 from 'argon2';

import {type TCreateUserDto} from '../../users/schemas';
import {UsersService} from '../../users/services/users.service';
import {signUpSchema, type TSignInDto} from '../schemas';
import 'dotenv/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signUp(
    createUserDto: TCreateUserDto
  ): Promise<{accessToken: string; refreshToken: string; userId: string}> {
    const userExists = await this.usersService.findByUsername(
      createUserDto.username
    );

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const emailExists = await this.usersService.findByEmail(
      createUserDto.email
    );

    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    const parsed = signUpSchema.safeParse(createUserDto);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map((issue) => issue.message).join(' \n ')
      );
    }

    const hash = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });
    const tokens = await this.getTokens(newUser.id, newUser.username);

    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return {...tokens, userId: newUser.id};
  }

  async signIn(
    data: TSignInDto
  ): Promise<{accessToken: string; refreshToken: string; userId: string}> {
    const user = await this.usersService.findByUsername(data.username);

    if (!user) throw new BadRequestException('User does not exist');

    const passwordMatches = await argon2.verify(user.password, data.password);

    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');

    const tokens = await this.getTokens(user.id, user.username);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {...tokens, userId: user.id};
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
  }

  async refreshTokens(
    userId: string,
    refreshToken: string
  ): Promise<{accessToken: string; refreshToken: string}> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async hashData(data: string): Promise<string> {
    return argon2.hash(data);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.setHashedRefreshToken(userId, hashedRefreshToken);
  }

  async getTokens(
    userId: string,
    username: string
  ): Promise<{accessToken: string; refreshToken: string}> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          expiresIn: '5m',
          secret: process.env.JWT_ACCESS_SECRET,
        }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          expiresIn: '30d',
          secret: process.env.JWT_REFRESH_SECRET,
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
