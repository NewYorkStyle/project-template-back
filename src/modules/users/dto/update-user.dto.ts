import {CreateUserDto} from './create-user.dto';
import {PartialType} from '@nestjs/mapped-types';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  refreshToken?: string;
  surname?: string;
  name?: string;
  patronymic?: string;
}
