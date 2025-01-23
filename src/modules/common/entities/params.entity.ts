import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity({name: 'params'})
export class Params {
  @PrimaryGeneratedColumn({type: 'int'})
  id: number;

  @Column({type: 'varchar'})
  value: string;

  @Column({type: 'varchar'})
  name: string;

  @Column({type: 'varchar'})
  description: string;
}
