import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {ZodValidationPipe} from 'nestjs-zod';

import {AccessTokenGuard, getJwtUserId, TRequest} from '../../../common';
import {
  markTourSeenSchema,
  type TMarkTourSeenDto,
  type TMarkTourSeenOkResponseDto,
  type TUserToursListDto,
} from '../schemas';
import {UserToursService} from '../services/user-tours.service';

@ApiTags('User Tours')
@Controller('users/me/tours')
@UseGuards(AccessTokenGuard)
export class UserToursController {
  constructor(private readonly userToursService: UserToursService) {}

  @ApiOperation({
    summary: 'Получение просмотренных туров текущего пользователя',
  })
  @ApiResponse({
    description: 'Возвращает список просмотренных активных туров.',
    schema: {
      $ref: '#/components/schemas/UserToursListDto',
    },
    status: 200,
  })
  @Get()
  async getSeenTours(@Req() req: TRequest): Promise<TUserToursListDto> {
    const userId = getJwtUserId(req);
    return this.userToursService.getUserTours(userId);
  }

  @ApiOperation({
    summary: 'Отметить тур как просмотренный',
  })
  @ApiResponse({
    description: 'Тур успешно отмечен как просмотренный.',
    schema: {
      $ref: '#/components/schemas/MarkTourSeenOkResponseDto',
    },
    status: 200,
  })
  @ApiBody({
    description: 'Ключ тура для отметки как просмотренного',
    schema: {
      $ref: '#/components/schemas/MarkTourSeenDto',
    },
  })
  @Post('seen')
  async markTourAsSeen(
    @Req() req: TRequest,
    @Body(new ZodValidationPipe(markTourSeenSchema))
    markTourSeenDto: TMarkTourSeenDto
  ): Promise<TMarkTourSeenOkResponseDto> {
    const userId = getJwtUserId(req);
    await this.userToursService.markAsSeen(userId, markTourSeenDto.key);
    return {success: true};
  }
}
