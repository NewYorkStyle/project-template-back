import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {E_PERMISSIONS} from '../../../../shared/constants';
import {PrismaService} from '../../../common/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: {id: userId},
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.userPermissions.map((up) => up.permission.name);
  }

  async addPermissionToUser(
    userId: string,
    permissionName: E_PERMISSIONS
  ): Promise<void> {
    // 1. Проверяем пользователя
    const user = await this.prisma.user.findUnique({
      where: {id: userId},
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Получаем permission
    const permission = await this.prisma.permission.findUnique({
      where: {name: permissionName},
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // 3. Проверяем, есть ли уже связь
    const existing = await this.prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permission.id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('User already has permission');
    }

    // 4. Создаём связь
    await this.prisma.userPermission.create({
      data: {
        userId,
        permissionId: permission.id,
      },
    });
  }

  async removePermissionFromUser(
    userId: string,
    permissionName: E_PERMISSIONS
  ): Promise<void> {
    const permission = await this.prisma.permission.findUnique({
      where: {name: permissionName},
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const existing = await this.prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permission.id,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Permission not found for this user');
    }

    await this.prisma.userPermission.delete({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permission.id,
        },
      },
    });
  }
}
