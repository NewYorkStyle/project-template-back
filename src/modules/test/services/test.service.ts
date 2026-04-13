import {BadRequestException, Injectable} from '@nestjs/common';
import * as argon2 from 'argon2';

import {PrismaService} from '../../../common/prisma/prisma.service';
import {PermissionsService} from '../../permissions/services/permissions.service';
import {UsersService} from '../../users/services/users.service';
import type {
  TTestCreateUserDto,
  TTestGrantPermissionsDto,
  TTestDeleteUserDto,
} from '../schemas/test-api.schema';

/**
 * Test-сервис для e2e-сценариев.
 * Делегирует бизнес-логику существующим сервисам, не дублируя её.
 */
@Injectable()
export class TestService {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Создать пользователя.
   * Использует UsersService для проверки уникальности и AuthService для хеширования пароля.
   */
  async createUser(dto: TTestCreateUserDto): Promise<{userId: string}> {
    // Проверяем уникальность через UsersService
    const existingByEmail = await this.usersService.findByEmail(dto.email);
    const existingByUsername = await this.usersService.findByUsername(
      dto.login
    );

    if (existingByEmail || existingByUsername) {
      throw new BadRequestException('User already exists');
    }

    // Хешируем пароль
    const passwordHash = await argon2.hash(dto.password);

    // Создаём запись напрямую, т.к. TCreateUserDto не поддерживает name/surname/patronymic
    const created = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.login,
        password: passwordHash,
        name: dto.name,
        surname: dto.surname,
        patronymic: dto.patronymic,
        refreshToken: dto.refreshToken ?? undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {userId: created.id};
  }

  /**
   * Выдать permissions пользователю через PermissionsService.grantPermissions.
   */
  async grantPermissions(dto: TTestGrantPermissionsDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.permissionsService.addPermissionsToUser(
      user.id,
      dto.permissions
    );
  }

  /**
   * Удалить пользователя через UsersService.remove.
   */
  async deleteUser(dto: TTestDeleteUserDto): Promise<void> {
    await this.usersService.remove(dto.userId);
  }
}
