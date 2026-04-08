import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {PrismaService} from '../../../common/prisma/prisma.service';
import {E_OTP_PURPOSE} from '../constants';

import 'dotenv/config';

type TOtpVerificationResult<TMetadata = unknown> = {
  valid: boolean;
  metadata?: TMetadata;
};

const isTest = process.env.NODE_ENV === 'test';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  async generateOtp<TMetadata = unknown>(
    userId: string,
    purpose: E_OTP_PURPOSE,
    metadata?: TMetadata
  ): Promise<string> {
    const otp = isTest
      ? '123456'
      : Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.otp.create({
      data: {
        userId,
        purpose,
        otp,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return otp;
  }

  async verifyOtp<TMetadata = unknown>(
    userId: string,
    otp: string,
    purpose: E_OTP_PURPOSE
  ): Promise<TOtpVerificationResult<TMetadata>> {
    const verification = await this.prisma.otp.findFirst({
      where: {userId, otp, purpose},
      orderBy: {createdAt: 'desc'},
    });

    if (!verification) {
      throw new NotFoundException('OTP not found');
    }

    if (verification.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    let parsedMetadata: unknown = undefined;

    if (verification.metadata) {
      try {
        parsedMetadata = JSON.parse(verification.metadata);
      } catch {
        throw new Error('Failed to parse OTP metadata');
      }
    }

    await this.prisma.otp.delete({
      where: {otpId: verification.otpId},
    });

    return {
      valid: true,
      metadata: parsedMetadata as TMetadata,
    };
  }

  async cleanupExpiredOtps(): Promise<void> {
    await this.prisma.otp.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
