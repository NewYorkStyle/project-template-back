import {ApiProperty} from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}
