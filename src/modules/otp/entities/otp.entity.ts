import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  otpId: string;

  @Column('uuid')
  userId: string;

  @Column()
  otp: string;

  @Column()
  purpose: string;

  @Column()
  metadata: string;

  @Column({type: 'timestamp with time zone'})
  createdAt: Date;

  @Column({type: 'timestamp with time zone'})
  expiresAt: Date;
}
