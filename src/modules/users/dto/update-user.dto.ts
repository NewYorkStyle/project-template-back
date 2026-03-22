import {PartialType} from '@nestjs/mapped-types';

import {CreateUserDto} from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  refreshToken?: string;
  surname?: string;
  name?: string;
  patronymic?: string;
}
