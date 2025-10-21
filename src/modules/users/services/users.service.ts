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

  // В UsersService
  async clearRefreshToken(userId: string): Promise<void> {
    try {
      const result = await this.userRepository.update(
        {id: userId},
        {refreshToken: null, updatedAt: new Date()}
      );

      // Если ни одна запись не обновлена - пользователь не существует
      if (result.affected === 0) {
        console.log(`User ${userId} not found for token clearance`);
      }
    } catch (error) {
      console.log('Error clearing refresh token:', error);
      // Не бросаем исключение - это нормально для logout
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

    if (verified.valid) {
      this.permissionsService.addPermissionToUser(
        userId,
        E_PERMISSIONS.EMAIL_VERIFIED
      );

      return true;
    }

    return false;
  }

  async emailChangeRequest(userId: string, newEmail: string): Promise<void> {
    const user = await this.findById(userId);

    const existingUser = await this.findByEmail(newEmail);
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Email is already in use by another user');
    }

    if (user.email === newEmail) {
      throw new BadRequestException(
        'New email must be different from current email'
      );
    }

    const otp = await this.otpService.generateOtp(
      userId,
      E_OTP_PURPOSE.EMAIL_CHANGE,
      {newEmail}
    );

    await this.mailService.sendOtp(
      {...user, email: newEmail},
      otp,
      'Confirm your Email Change'
    );
  }

  async emailChange(userId: string, otp: string): Promise<boolean> {
    const verified = await this.otpService.verifyOtp(
      userId,
      otp,
      E_OTP_PURPOSE.EMAIL_CHANGE
    );

    if (verified && verified.metadata && verified.metadata.newEmail) {
      const newEmail = verified.metadata.newEmail;

      const existingUser = await this.findByEmail(newEmail);
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException(
          'Email is already in use by another user'
        );
      }

      const user = await this.findById(userId);
      user.email = newEmail;
      user.updatedAt = new Date();
      await this.userRepository.save(user);

      return true;
    }

    return false;
  }
}
