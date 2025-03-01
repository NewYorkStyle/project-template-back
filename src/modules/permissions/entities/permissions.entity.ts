import {E_PERMISSIONS} from '../contants';
import {User_Permissions} from './user-premissions.entity';
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Permissions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({unique: true})
  name: E_PERMISSIONS;

  @Column({nullable: true})
  description: string;

  @OneToMany(
    () => User_Permissions,
    (userPermission) => userPermission.permission
  )
  userPermissions: User_Permissions[];
}
