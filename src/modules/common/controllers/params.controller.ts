import {BASE_URL} from '../contants';
import {Params} from '../entities/params.entity';
import {ParamsService} from '../services/params.service';
import {Controller, Get} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';

@ApiTags('params')
@Controller(`${BASE_URL}/params`)
export class ParamsController {
  constructor(private readonly paramsServise: ParamsService) {}

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
  getParams(): Promise<{[name: string]: string}> {
    return this.paramsServise.getParams().then((params) => {
      const result = params.reduce((acc, item: Params) => {
        acc[item.name] = item.value;
        return acc;
      }, {});

      return result;
    });
  }
}
