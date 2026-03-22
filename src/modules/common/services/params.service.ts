import {Injectable} from '@nestjs/common';

import {PrismaService} from '../../../common/prisma/prisma.service';

@Injectable()
export class ParamsService {
  constructor(private readonly prisma: PrismaService) {}

  getParams() {
    return this.prisma.param.findMany({
      select: {
        name: true,
        value: true,
      },
    });
  }
}
