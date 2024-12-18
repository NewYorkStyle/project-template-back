import {ApiProperty} from '@nestjs/swagger';
import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity({name: 'params'})
export class Params {
  @PrimaryGeneratedColumn({type: 'int'})
  id: number;

  @ApiProperty({description: 'Значение параметра'})
  @Column({type: 'varchar'})
  value: string;

  @ApiProperty({description: 'Ключ параметра'})
  @Column({type: 'varchar'})
  name: string;

  @Column({type: 'varchar'})
  description: string;
}
