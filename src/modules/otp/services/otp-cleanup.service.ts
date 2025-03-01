import {Otp} from '../entities/otp.entity';
import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class OtpCleanupService implements OnModuleInit {
  private readonly logger = new Logger(OtpCleanupService.name);

  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async cleanupExpiredOtps() {
    this.logger.log('Running cleanupExpiredOtps...');

    const result = await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', {now: new Date()})
      .execute();

    this.logger.log(`Deleted ${result.affected} expired OTPs.`);
  }

  onModuleInit() {
    this.cleanupExpiredOtps();
  }
}
