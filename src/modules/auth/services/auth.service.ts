import {CreateUserDto} from '../../users/dto';
import {UsersService} from '../../users/services/users.service';
import {AuthDto} from '../dto/auth.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as argon2 from 'argon2';
import 'dotenv/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signUp(
    createUserDto: CreateUserDto
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

    await this.validateUsername(createUserDto.username);
    await this.validatePassword(createUserDto.password);
    await this.validateEmail(createUserDto.email);

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
    data: AuthDto
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

  async validatePassword(password: string): Promise<void> {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase');
    }

    if (errors.length !== 0) {
      throw new BadRequestException(errors.join(' \n '));
    }
  }

  async validateUsername(username: string): Promise<void> {
    const errors: string[] = [];

    if (!username) {
      errors.push('Username is required');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push(
        'Username must contain only letters, numbers, symbols "_" and "-"'
      );
    }

    if (username.length < 3 || username.length > 20) {
      errors.push('Username must contain from 3 to 20 characters');
    }

    if (errors.length !== 0) {
      throw new BadRequestException(errors.join(' \n '));
    }
  }

  async validateEmail(email: string): Promise<void> {
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.push('Wrong email');
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
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
