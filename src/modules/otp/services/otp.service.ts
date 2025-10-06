import {E_OTP_PURPOSE} from '../contants';
import {Otp} from '../entities/otp.entity';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

type TOtpVerificationResult = {
  valid: boolean;
  metadata?: any;
};

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>
  ) {}

  async generateOtp(
    userId: string,
    purpose: E_OTP_PURPOSE,
    metadata?: any
  ): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Генерация 6-значного OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Текущее время + 5 минут

    await this.otpRepository.save({
      expiresAt,
      metadata: metadata ? JSON.stringify(metadata) : null,
      otp,
      purpose,
      userId,
    });

    return otp;
  }

  async verifyOtp(
    userId: string,
    otp: string,
    purpose: E_OTP_PURPOSE
  ): Promise<TOtpVerificationResult> {
    const verification = await this.otpRepository.findOne({
      order: {createdAt: 'DESC'},
      where: {otp, purpose, userId},
    });

    if (!verification) {
      throw new NotFoundException('OTP not found');
    }

    if (verification.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    // Парсим метаданные если они есть
    let metadata = null;
    if (verification.metadata) {
      try {
        metadata = JSON.parse(verification.metadata);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new Error('Failed to parse OTP metadata');
      }
    }

    // Удаляем OTP после успешной проверки
    await this.otpRepository.delete(verification.otpId);

    return {
      metadata,
      valid: true,
    };
  }

  async cleanupExpiredOtps(): Promise<void> {
    await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', {now: new Date()})
      .execute();
  }
}
