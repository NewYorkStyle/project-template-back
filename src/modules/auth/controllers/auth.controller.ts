import {Body, Controller, Get, Post, Req, Res, UseGuards} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {CookieOptions, Response} from 'express';
import {ZodValidationPipe} from 'nestjs-zod';

import {AccessTokenGuard, RefreshTokenGuard, TRequest} from '../../../common';
import {
  signInSchema,
  signUpSchema,
  type TSignInDto,
  type TSignUpDto,
} from '../schemas';
import {AuthService} from '../services';

const httpOnlyCookieConfig: CookieOptions = {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: 'strict',
  secure: false,
};

const commonCookieConfig: CookieOptions = {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: 'strict',
  secure: false,
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  @ApiOperation({
    description:
      'Создаёт нового пользователя и отправляет в httpOnly cookie токены аутентификации, id юзера.',
    summary: 'Регистрация пользователя',
  })
  @ApiResponse({
    description:
      'При успешной регистрации возвращает сообщение "User registred"',
    schema: {
      $ref: '#/components/schemas/SignUpOkResponseDto',
    },
    status: 200,
  })
  @ApiBody({
    description: 'Данные пользователя',
    schema: {
      $ref: '#/components/schemas/SignUpDto',
    },
  })
  async signUp(
    @Body(new ZodValidationPipe(signUpSchema)) createUserDto: TSignUpDto,
    @Res({passthrough: true}) res: Response
  ): Promise<string> {
    const {accessToken, refreshToken, userId} =
      await this.authService.signUp(createUserDto);

    res.cookie('refreshToken', refreshToken, httpOnlyCookieConfig);
    res.cookie('accessToken', accessToken, httpOnlyCookieConfig);
    res.cookie('userId', userId, httpOnlyCookieConfig);
    res.cookie('isUserLoggedIn', true, commonCookieConfig);

    return 'User registred';
  }

  @ApiOperation({
    description:
      'Проверяет данные пользователя и отправляет в httpOnly cookie токены аутентификации, id юзера.',
    summary: 'Вход пользователя в систему.',
  })
  @ApiResponse({
    description:
      'При успешной аутентификации возвращает сообщение "User logged in"',
    schema: {
      $ref: '#/components/schemas/SignInOkResponseDto',
    },
    status: 200,
  })
  @ApiBody({
    description: 'Данные пользователя',
    schema: {
      $ref: '#/components/schemas/SignInDto',
    },
  })
  @Post('signIn')
  async signIn(
    @Body(new ZodValidationPipe(signInSchema)) data: TSignInDto,
    @Res({passthrough: true}) res: Response
  ): Promise<string> {
    const {accessToken, refreshToken, userId} =
      await this.authService.signIn(data);

    res.cookie('refreshToken', refreshToken, httpOnlyCookieConfig);
    res.cookie('accessToken', accessToken, httpOnlyCookieConfig);
    res.cookie('userId', userId, httpOnlyCookieConfig);
    res.cookie('isUserLoggedIn', true, commonCookieConfig);

    return 'User logged in';
  }

  @ApiOperation({
    description: 'Сбрасывает текущую сессию юзера, чистит токены.',
    summary: 'Выход пользователя из системы.',
  })
  @ApiResponse({
    description:
      'При успешной аутентификации возвращает сообщение "User logged out"',
    schema: {
      $ref: '#/components/schemas/LogoutOkResponseDto',
    },
    status: 200,
  })
  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(
    @Req() req: TRequest,
    @Res({passthrough: true}) res: Response
  ): Promise<string> {
    await this.authService.logout(req.cookies.userId);

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.clearCookie('userId');
    res.clearCookie('isUserLoggedIn');

    return 'User logged out';
  }

  @ApiOperation({
    description:
      'Обновляет и отправляет в httpOnly cookie токены аутентификации.',
    summary: 'Обновление токена пользователя.',
  })
  @ApiResponse({
    description:
      'При успешной аутентификации возвращает сообщение "Token refreshed"',
    schema: {
      $ref: '#/components/schemas/RefreshOkResponseDto',
    },
    status: 200,
  })
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(
    @Req() req: TRequest,
    @Res({passthrough: true}) res: Response
  ): Promise<string> {
    const userId = req.cookies.userId;
    const refreshToken = req.cookies.refreshToken;
    const {accessToken, refreshToken: newRefreshToken} =
      await this.authService.refreshTokens(userId, refreshToken);

    res.cookie('refreshToken', newRefreshToken, httpOnlyCookieConfig);
    res.cookie('accessToken', accessToken, httpOnlyCookieConfig);
    res.cookie('isUserLoggedIn', true, commonCookieConfig);

    return 'Token refreshed';
  }
}
