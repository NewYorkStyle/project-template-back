import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import {PrismaService} from '../../../common/prisma/prisma.service';
import type {
  TTestCreateUserDto,
  TTestGrantPermissionsDto,
  TTestDeleteUserDto,
} from '../schemas/test-api.schema';

@Injectable()
export class TestService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: TTestCreateUserDto): Promise<void> {
    const existingByEmail = await this.prisma.user.findUnique({
      where: {email: dto.email},
    });
    const existingByLogin = await this.prisma.user.findUnique({
      where: {username: dto.login},
    });

    if (existingByEmail || existingByLogin) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    await this.prisma.user.create({
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
  }

  async grantPermissions(dto: TTestGrantPermissionsDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {email: dto.email},
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.permissions.length === 0) {
      return;
    }

    const uniqueNames = [...new Set(dto.permissions)];

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

    await this.prisma.userPermission.createMany({
      data: found.map((p) => ({
        userId: user.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });
  }

  async deleteUser(dto: TTestDeleteUserDto): Promise<void> {
    const result = await this.prisma.user.deleteMany({
      where: {email: dto.email},
    });

    if (result.count === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
