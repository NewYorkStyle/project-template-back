import {CreateUserDto, UpdateUserDto} from '../dto';
import {User} from '../entities/users.entity';
import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = this.userRepository.create(createUserDto);
    createdUser.createdAt = new Date();
    createdUser.updatedAt = new Date();
    return this.userRepository.save(createdUser);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({where: {id}});

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(login: string): Promise<User | undefined> {
    return this.userRepository.findOne({where: {username: login}});
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({where: {email}});
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (user) {
      Object.assign(user, updateUserDto);
      user.updatedAt = new Date();
      return this.userRepository.save(user);
    }
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
