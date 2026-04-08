import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExcludeController,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {ZodValidationPipe} from 'nestjs-zod';

import {TestOnlyGuard} from '../../../common/guards/test-only.guard';
import {
  testCreateUserSchema,
  testDeleteUserSchema,
  testGrantPermissionsSchema,
  type TTestCreateUserDto,
  type TTestDeleteUserDto,
  type TTestGrantPermissionsDto,
} from '../schemas/test-api.schema';
import {TestService} from '../services/test.service';

@ApiExcludeController()
@Controller('test')
@UseGuards(TestOnlyGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

  @ApiOperation({summary: '[E2E only] Создать пользователя'})
  @ApiBody({
    description: 'Данные пользователя (пароль будет захеширован)',
    schema: {$ref: '#/components/schemas/TestCreateUserDto'},
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь создан',
    schema: {$ref: '#/components/schemas/TestCreateUserOkResponseDto'},
  })
  @HttpCode(201)
  @Post('create-user')
  async createUser(
    @Body(new ZodValidationPipe(testCreateUserSchema)) dto: TTestCreateUserDto
  ): Promise<string> {
    await this.testService.createUser(dto);
    return 'User created';
  }

  @ApiOperation({summary: '[E2E only] Выдать permissions пользователю'})
  @ApiBody({
    description: 'Email и список имён permissions из БД',
    schema: {$ref: '#/components/schemas/TestGrantPermissionsDto'},
  })
  @ApiResponse({
    status: 200,
    description: 'Права выданы',
    schema: {$ref: '#/components/schemas/TestGrantPermissionsOkResponseDto'},
  })
  @Post('grant-permissions')
  async grantPermissions(
    @Body(new ZodValidationPipe(testGrantPermissionsSchema))
    dto: TTestGrantPermissionsDto
  ): Promise<string> {
    await this.testService.grantPermissions(dto);
    return 'Permissions granted';
  }

  @ApiOperation({summary: '[E2E only] Удалить пользователя по email'})
  @ApiBody({
    description: 'Email пользователя',
    schema: {$ref: '#/components/schemas/TestDeleteUserDto'},
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь удалён',
    schema: {$ref: '#/components/schemas/TestDeleteUserOkResponseDto'},
  })
  @Delete('delete-user')
  async deleteUser(
    @Body(new ZodValidationPipe(testDeleteUserSchema)) dto: TTestDeleteUserDto
  ): Promise<string> {
    await this.testService.deleteUser(dto);
    return 'User deleted';
  }
}
