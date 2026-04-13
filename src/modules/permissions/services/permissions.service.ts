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

  /**
   * Массовая выдача permissions пользователю.
   * Валидирует все permissions перед созданием связей, пропускает дубликаты.
   */
  async addPermissionsToUser(
    userId: string,
    permissionNames: E_PERMISSIONS[]
  ): Promise<void> {
    if (permissionNames.length === 0) {
      return;
    }

    // Проверяем пользователя
    const user = await this.prisma.user.findUnique({where: {id: userId}});
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Валидируем все permissions
    const uniqueNames = [...new Set(permissionNames)];
    const found = await this.prisma.permission.findMany({
      where: {name: {in: uniqueNames}},
      select: {id: true, name: true},
    });

    const foundNames = new Set(found.map((p) => p.name));
    const invalid = uniqueNames.filter((n) => !foundNames.has(n));

    if (invalid.length > 0) {
      throw new BadRequestException({
        message: 'Invalid permissions',
        invalid,
      });
    }

    // Создаём связи с пропуском дубликатов
    await this.prisma.userPermission.createMany({
      data: found.map((p) => ({
        userId,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });
  }
}
