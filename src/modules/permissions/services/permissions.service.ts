import {User} from '../../users/entities/users.entity';
import {E_PERMISSIONS} from '../contants';
import {Permissions} from '../entities/permissions.entity';
import {User_Permissions} from '../entities/user-premissions.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
    @InjectRepository(User_Permissions)
    private readonly userPermissionsRepository: Repository<User_Permissions>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async getUserPermissions(userId: string): Promise<Permissions['name'][]> {
    const user = await this.userRepository.findOne({
      relations: ['userPermissions', 'userPermissions.permission'],
      where: {id: userId},
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
    const user = await this.userRepository.findOne({where: {id: userId}});

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permission = await this.permissionsRepository.findOne({
      where: {name: permissionName},
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const permissions = await this.getUserPermissions(userId);

    if (permissions.includes(permissionName))
      throw new BadRequestException('User already has permission');

    const newPermission = this.userPermissionsRepository.create({
      permissionId: permission.id,
      userId,
    });

    await this.userPermissionsRepository.save(newPermission);
  }

  async removePermissionFromUser(
    userId: string,
    permissionName: E_PERMISSIONS
  ): Promise<void> {
    const permission = await this.permissionsRepository.findOne({
      where: {name: permissionName},
    });

    const userPermission = await this.userPermissionsRepository.findOne({
      where: {permissionId: permission.id, userId},
    });

    if (!userPermission) {
      throw new NotFoundException('Permission not found for this user');
    }

    await this.userPermissionsRepository.delete({
      permissionId: permission.id,
      userId,
    });
  }
}
