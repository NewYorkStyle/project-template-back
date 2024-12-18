import {Params} from '../entities/params.entity';
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class ParamsService {
  constructor(
    @InjectRepository(Params)
    private readonly paramsRepository: Repository<Params>
  ) {}

  getParams(): Promise<Params[]> {
    return this.paramsRepository.find({
      select: {name: true, value: true},
    });
  }
}
