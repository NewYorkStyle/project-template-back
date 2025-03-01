import {AccessTokenGuard} from '../../../common/guards/accessToken.guard';
import {Permissions} from '../../permissions/entities/permissions.entity';
import {PermissionsService} from '../../permissions/services/permissions.service';
import {DeleteUserDto, UpdateUserDto} from '../dto';
import {UsersService} from '../services/users.service';
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
import * as argon2 from 'argon2';
import {Request, Response} from 'express';

@ApiTags('users')
@Controller('users')
@UseGuards(AccessTokenGuard)
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
      example: {
        email: 'string',
        name: 'string',
        patronymic: 'string',
        surname: 'string',
      },
      type: 'object',
    },
    status: 200,
  })
  @Get('getProfile')
  async findById(@Req() req: Request) {
    return this.usersService
      .findById(req.cookies['userId'])
      .then((profile) => ({
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
      example: {
        email: 'string',
        name: 'string',
        patronymic: 'string',
        surname: 'string',
      },
      type: 'object',
    },
    status: 200,
  })
  @ApiBody({
    description: 'Поля для изменения',
    schema: {
      example: {
        email: 'string',
        name: 'string',
        patronymic: 'string',
        surname: 'string',
      },
      type: 'object',
    },
  })
  @Post('update')
  update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService
      .update(req.cookies['userId'], updateUserDto)
      .then((profile) => ({
        email: profile.email,
        name: profile.name,
        patronymic: profile.patronymic,
        surname: profile.surname,
      }));
  }

  @ApiOperation({
    summary: 'Удаление пользователя',
  })
  @ApiResponse({
    description: 'Удаляет юзера.',
    schema: {
      example: 'User deleted',
      type: 'string',
    },
    status: 200,
  })
  @ApiBody({
    description: 'Поля для подтверждения',
    schema: {
      example: {
        password: 'string',
      },
      type: 'object',
    },
  })
  @Post('delete')
  async remove(
    @Req() req: Request,
    @Res({passthrough: true}) res: Response,
    @Body() deleteUserDto: DeleteUserDto
  ) {
    const user = await this.usersService.findById(req.cookies['userId']);

    if (!user) throw new BadRequestException('User does not exist');

    const passwordMatches = await argon2.verify(
      user.password,
      deleteUserDto.password
    );

    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');

    this.usersService.remove(req.cookies['userId']);

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.clearCookie('userId');
    res.clearCookie('isUserLoggedIn');

    return 'User deleted';
  }

  @ApiOperation({
    summary: 'Запрос на генерацию OTP',
  })
  @ApiResponse({
    description: 'Генерирует OTP и отправляет на почту',
    schema: {
      example: 'OTP sent',
      type: 'string',
    },
    status: 200,
  })
  @Get('requestEmailVerification')
  async requestEmailVerification(@Req() req: Request) {
    await this.usersService.requestEmailVerification(req.cookies['userId']);

    return 'OTP sent';
  }

  @ApiOperation({
    summary: 'Проверка OTP',
  })
  @ApiResponse({
    description: 'Проверяет полученный OTP',
    schema: {
      example: 'OTP verified',
      type: 'string',
    },
    status: 200,
  })
  @ApiBody({
    schema: {
      example: {
        otp: 'string',
      },
      type: 'object',
    },
  })
  @Post('verifyEmail')
  async verifyEmail(@Req() req: Request, @Body('otp') otp: string) {
    const verified = await this.usersService.verifyEmail(
      req.cookies['userId'],
      otp
    );

    if (!verified) throw new BadRequestException('OTP is incorrect');

    return 'OTP verified';
  }

  @ApiOperation({
    summary: 'Получение permissions текущего пользователя',
  })
  @ApiResponse({
    description: 'Возвращает список permissions текущего пользователя.',
    status: 200,
    type: [Permissions],
  })
  @Get('permissions')
  async getMyPermissions(@Req() req: Request): Promise<Permissions['name'][]> {
    return this.permissionsService.getUserPermissions(req.cookies['userId']);
  }
}
