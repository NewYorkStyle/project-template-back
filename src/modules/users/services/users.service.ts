import {MailService} from '../../mail/services/mail.service';
import {E_OTP_PURPOSE} from '../../otp/contants';
import {OtpService} from '../../otp/services/otp.service';
import {E_PERMISSIONS} from '../../permissions/contants';
import {PermissionsService} from '../../permissions/services/permissions.service';
import {CreateUserDto, UpdateUserDto} from '../dto';
import {User} from '../entities/users.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
    private readonly permissionsService: PermissionsService
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

  async requestEmailVerification(id: string): Promise<void> {
    const otp = await this.otpService.generateOtp(
      id,
      E_OTP_PURPOSE.EMAIL_VERIFICATION
    );

    const user = await this.userRepository.findOne({where: {id}});

    const permissions = await this.permissionsService.getUserPermissions(id);

    if (permissions.includes(E_PERMISSIONS.EMAIL_VERIFIED))
      throw new BadRequestException('User already has permission');

    await this.mailService.sendOtp(
      user,
      otp,
      'Welcome to Project Template! Confirm your Email'
    );
  }

  async verifyEmail(userId: string, otp: string): Promise<boolean> {
    const verified = await this.otpService.verifyOtp(
      userId,
      otp,
      E_OTP_PURPOSE.EMAIL_VERIFICATION
    );

    if (verified) {
      this.permissionsService.addPermissionToUser(
        userId,
        E_PERMISSIONS.EMAIL_VERIFIED
      );

      return verified;
    }
  }
}
