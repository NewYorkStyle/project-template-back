import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Throttle, ThrottlerGuard} from '@nestjs/throttler';
import {Permission} from '@prisma/client';
import * as argon2 from 'argon2';
import {Response} from 'express';
import {ZodValidationPipe} from 'nestjs-zod';

import {AccessTokenGuard, getJwtUserId, TRequest} from '../../../common';
import {otpRouteThrottle} from '../../../common/throttler/throttler-options';
import {PermissionsService} from '../../permissions/services/permissions.service';
import {
  changePasswordSchema,
  deleteUserSchema,
  type TChangePasswordDto,
  type TDeleteUserDto,
  type TUpdateUserDto,
  updateUserSchema,
} from '../schemas';
import {UsersService} from '../services/users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(AccessTokenGuard, ThrottlerGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService
  ) {}

  @ApiOperation({
    summary: 'Получение данных пользователя',
  })
  @ApiResponse({
    description: 'Возвращает профиль юзера.',
    schema: {
      $ref: '#/components/schemas/UserProfileDto',
    },
    status: 200,
  })
  @Get('me')
  async findById(@Req() req: TRequest) {
    return this.usersService.findById(getJwtUserId(req)).then((profile) => ({
      email: profile.email,
      name: profile.name,
      patronymic: profile.patronymic,
      surname: profile.surname,
    }));
  }

  @ApiOperation({
    summary: 'Обновление данных пользователя',
  })
  @ApiResponse({
    description: 'Возвращает обновлённый профиль юзера.',
    schema: {
      $ref: '#/components/schemas/UserUpdateResultDto',
    },
    status: 200,
  })
  @ApiBody({
    description: 'Поля для изменения',
    schema: {
      $ref: '#/components/schemas/UpdateUserDto',
    },
  })
  @Post('update')
  update(
    @Req() req: TRequest,
    @Body(new ZodValidationPipe(updateUserSchema)) updateUserDto: TUpdateUserDto
  ) {
    return this.usersService
      .update(getJwtUserId(req), updateUserDto)
      .then((profile) => ({
        name: profile.name,
        patronymic: profile.patronymic,
        surname: profile.surname,
      }));
  }

  @ApiOperation({
    summary: 'Смена пароля',
  })
  @ApiResponse({
    description: 'Пароль обновлён',
    schema: {
      $ref: '#/components/schemas/ChangePasswordOkResponseDto',
    },
    status: 200,
  })
  @ApiBody({
    description: 'Текущий и новый пароль',
    schema: {
      $ref: '#/components/schemas/ChangePasswordDto',
    },
  })
  @Post('changePassword')
  async changePassword(
    @Req() req: TRequest,
    @Body(new ZodValidationPipe(changePasswordSchema))
    changePasswordDto: TChangePasswordDto
  ) {
    await this.usersService.changePassword(
      getJwtUserId(req),
      changePasswordDto
    );

    return 'Password changed';
  }

  @ApiOperation({
    summary: 'Удаление пользователя',
  })
  @ApiResponse({
    description: 'Удаляет юзера.',
    schema: {
      $ref: '#/components/schemas/DeleteUserOkResponseDto',
    },
    status: 200,
  })
  @ApiBody({
    description: 'Поля для подтверждения',
    schema: {
      $ref: '#/components/schemas/DeleteUserDto',
    },
  })
  @Post('delete')
  async remove(
    @Req() req: TRequest,
    @Res({passthrough: true}) res: Response,
    @Body(new ZodValidationPipe(deleteUserSchema)) deleteUserDto: TDeleteUserDto
  ) {
    const user = await this.usersService.findById(getJwtUserId(req));

    if (!user) throw new BadRequestException('User does not exist');

    const passwordMatches = await argon2.verify(
      user.password,
      deleteUserDto.password
    );

    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');

    await this.usersService.remove(getJwtUserId(req));

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.clearCookie('isUserLoggedIn');

    return 'User deleted';
  }

  @ApiOperation({
    summary: 'Запрос на генерацию OTP',
  })
  @ApiResponse({
    description: 'Генерирует OTP и отправляет на почту',
    schema: {
      $ref: '#/components/schemas/OtpSentOkResponseDto',
    },
    status: 200,
  })
  @Get('requestEmailVerification')
  @Throttle(otpRouteThrottle)
  async requestEmailVerification(@Req() req: TRequest) {
    await this.usersService.requestEmailVerification(getJwtUserId(req));

    return 'OTP sent';
  }

  @ApiOperation({
    summary: 'Проверка OTP',
  })
  @ApiResponse({
    description: 'Проверяет полученный OTP',
    schema: {
      $ref: '#/components/schemas/OtpVerifiedOkResponseDto',
    },
    status: 200,
  })
  @ApiBody({
    description: 'OTP из письма для подтверждения email',
    schema: {
      $ref: '#/components/schemas/OtpBodyDto',
    },
  })
  @Post('verifyEmail')
  @Throttle(otpRouteThrottle)
  async verifyEmail(@Req() req: TRequest, @Body('otp') otp: string) {
    const verified = await this.usersService.verifyEmail(
      getJwtUserId(req),
      otp
    );

    if (!verified) throw new BadRequestException('OTP is incorrect');

    return 'OTP verified';
  }

  @ApiOperation({
    summary: 'Запрос на смену email',
  })
  @ApiResponse({
    description: 'Генерирует OTP для смены email и отправляет на новую почту',
    schema: {
      $ref: '#/components/schemas/EmailChangeRequestOkResponseDto',
    },
    status: 200,
  })
  @ApiBody({
    description: 'Новый email адрес',
    schema: {
      $ref: '#/components/schemas/EmailChangeRequestBodyDto',
    },
  })
  @Post('emailChangeRequest')
  @Throttle(otpRouteThrottle)
  async emailChangeRequest(
    @Req() req: TRequest,
    @Body('newEmail') newEmail: string
  ) {
    if (!newEmail) {
      throw new BadRequestException('New email is required');
    }

    await this.usersService.emailChangeRequest(getJwtUserId(req), newEmail);

    return 'OTP for email change sent';
  }

  @ApiOperation({
    summary: 'Подтверждение смены email',
  })
  @ApiResponse({
    description: 'Проверяет OTP и изменяет email пользователя',
    schema: {
      $ref: '#/components/schemas/EmailChangeOkResponseDto',
    },
    status: 200,
  })
  @ApiBody({
    description: 'OTP для подтверждения смены email',
    schema: {
      $ref: '#/components/schemas/OtpBodyDto',
    },
  })
  @Post('emailChange')
  @Throttle(otpRouteThrottle)
  async emailChange(@Req() req: TRequest, @Body('otp') otp: string) {
    const changed = await this.usersService.emailChange(getJwtUserId(req), otp);

    if (!changed) throw new BadRequestException('OTP is incorrect or expired');

    return 'Email successfully changed';
  }

  @ApiOperation({
    summary: 'Получение permissions текущего пользователя',
  })
  @ApiResponse({
    description: 'Возвращает список permissions текущего пользователя.',
    schema: {
      $ref: '#/components/schemas/PermissionNamesDto',
    },
    status: 200,
  })
  @Get('permissions')
  async getMyPermissions(@Req() req: TRequest): Promise<Permission['name'][]> {
    return this.permissionsService.getUserPermissions(getJwtUserId(req));
  }
}
