import {User_Permissions} from '../../permissions/entities/user-premissions.entity';
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';

@Entity({name: 'users'})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'varchar', unique: true})
  username: string;

  @Column({type: 'varchar'})
  password: string;

  @Column({nullable: true, type: 'varchar', unique: true})
  refreshToken?: string;

  @Column({nullable: true, type: 'timestamp with time zone'})
  createdAt?: Date;

  @Column({nullable: true, type: 'timestamp with time zone'})
  updatedAt?: Date;

  @Column({type: 'varchar', unique: true})
  email: string;

  @Column({type: 'varchar'})
  surname?: string;

  @Column({type: 'varchar'})
  name?: string;

  @Column({type: 'varchar'})
  patronymic?: string;

  @OneToMany(() => User_Permissions, (userPermission) => userPermission.user)
  userPermissions: User_Permissions[];
}
