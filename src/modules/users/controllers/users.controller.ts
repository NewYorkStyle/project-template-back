import {CreateUserDto} from '../dto/create-user.dto';
import {UpdateUserDto} from '../dto/update-user.dto';
import {UsersService} from '../services/users.service';
import {Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {AccessTokenGuard} from 'src/common/guards/accessToken.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Создание пользователя',
  })
  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'Получение данных пользователя',
  })
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({
    summary: 'Обновление данных пользователя',
  })
  @Post('update/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({
    summary: 'Удаление пользователя',
  })
  @Post('delete/:id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
