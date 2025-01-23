import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

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
}
