import {Permissions} from './permissions.entity';
import {User} from '../../users/entities/users.entity';
import {Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';

@Entity()
export class User_Permissions {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  permissionId: string;

  @ManyToOne(() => User, (user) => user.userPermissions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({name: 'userId'})
  user: User;

  @ManyToOne(() => Permissions, (permission) => permission.userPermissions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({name: 'permissionId'})
  permission: Permissions;
}
