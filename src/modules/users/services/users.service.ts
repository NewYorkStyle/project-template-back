import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {Prisma, User} from '@prisma/client';
import * as argon2 from 'argon2';

import {PrismaService} from '../../../common/prisma/prisma.service';
import {MailService} from '../../mail/services/mail.service';
import {E_OTP_PURPOSE} from '../../otp/constants';
import {OtpService} from '../../otp/services/otp.service';
import {E_PERMISSIONS} from '../../permissions/constants';
import {PermissionsService} from '../../permissions/services/permissions.service';
import {
  type TChangePasswordDto,
  type TCreateUserDto,
  type TUpdateUserDto,
} from '../schemas';

type TEmailChangeMetadata = {
  newEmail: string;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
    private readonly permissionsService: PermissionsService
  ) {}

  async create(createUserDto: TCreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {id},
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(login: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {username: login},
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {email},
    });
  }

  async update(id: string, updateUserDto: TUpdateUserDto): Promise<User> {
    await this.findById(id);

    const data: Prisma.UserUpdateInput = {
      updatedAt: new Date(),
    };

    if (updateUserDto.name !== undefined) {
      data.name = updateUserDto.name;
    }
    if (updateUserDto.surname !== undefined) {
      data.surname = updateUserDto.surname;
    }
    if (updateUserDto.patronymic !== undefined) {
      data.patronymic = updateUserDto.patronymic;
    }

    return this.prisma.user.update({
      where: {id},
      data,
    });
  }

  /**
   * Только для auth-слоя: сохраняет уже захэшированный refresh token.
   */
  async setHashedRefreshToken(
    userId: string,
    hashedRefreshToken: string
  ): Promise<void> {
    await this.findById(userId);
    await this.prisma.user.update({
      where: {id: userId},
      data: {
        refreshToken: hashedRefreshToken,
        updatedAt: new Date(),
      },
    });
  }

  async changePassword(userId: string, dto: TChangePasswordDto): Promise<void> {
    const user = await this.findById(userId);

    const passwordMatches = await argon2.verify(
      user.password,
      dto.currentPassword
    );

    if (!passwordMatches) {
      throw new BadRequestException('Password is incorrect');
    }

    const passwordHash = await argon2.hash(dto.newPassword);

    await this.prisma.user.update({
      where: {id: userId},
      data: {
        password: passwordHash,
        updatedAt: new Date(),
      },
    });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    try {
      const result = await this.prisma.user.updateMany({
        where: {id: userId},
        data: {
          refreshToken: null,
          updatedAt: new Date(),
        },
      });

      if (result.count === 0) {
        console.log(`User ${userId} not found for token clearance`);
      }
    } catch (error) {
      console.log('Error clearing refresh token:', error);
    }
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: {id},
    });
  }

  async requestEmailVerification(id: string): Promise<void> {
    const otp = await this.otpService.generateOtp(
      id,
      E_OTP_PURPOSE.EMAIL_VERIFICATION
    );

    const user = await this.prisma.user.findUnique({
      where: {id},
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permissions = await this.permissionsService.getUserPermissions(id);

    if (permissions.includes(E_PERMISSIONS.EMAIL_VERIFIED)) {
      throw new BadRequestException('User already has permission');
    }

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
      await this.permissionsService.addPermissionToUser(
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
      {
        ...user,
        email: newEmail,
      },
      otp,
      'Confirm your Email Change'
    );
  }

  async emailChange(userId: string, otp: string): Promise<boolean> {
    const verified = await this.otpService.verifyOtp<TEmailChangeMetadata>(
      userId,
      otp,
      E_OTP_PURPOSE.EMAIL_CHANGE
    );

    if (verified.valid && verified.metadata?.newEmail) {
      const newEmail = verified.metadata.newEmail;

      const existingUser = await this.findByEmail(newEmail);
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException(
          'Email is already in use by another user'
        );
      }

      await this.prisma.user.update({
        where: {id: userId},
        data: {
          email: newEmail,
          updatedAt: new Date(),
        },
      });

      return true;
    }

    return false;
  }
}
