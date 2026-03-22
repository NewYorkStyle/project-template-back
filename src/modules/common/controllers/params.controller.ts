import {Controller, Get} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';

import {BASE_URL} from '../constants';
import {ParamsService} from '../services/params.service';

@ApiTags('params')
@Controller(`${BASE_URL}/params`)
export class ParamsController {
  constructor(private readonly paramsService: ParamsService) {}

  @Get('getParams')
  @ApiOperation({
    description:
      'Возвращает параметры приложения в виде объекта, где ключом выступает название параметра.',
    summary: 'Получить параметры приложения',
  })
  @ApiResponse({
    description:
      'Возвращает параметры приложения в виде объекта, где ключом выступает название параметра.',
    schema: {
      example: {param_name: 'param_value'},
      type: 'object',
    },
    status: 200,
  })
  async getParams(): Promise<Record<string, string>> {
    const params = await this.paramsService.getParams();

    return Object.fromEntries(params.map((item) => [item.name, item.value]));
  }
}
