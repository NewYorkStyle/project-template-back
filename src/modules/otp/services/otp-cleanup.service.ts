import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';

import {PrismaService} from '../../../common/prisma/prisma.service';

@Injectable()
export class OtpCleanupService implements OnModuleInit {
  private readonly logger = new Logger(OtpCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async cleanupExpiredOtps() {
    this.logger.log('Running cleanupExpiredOtps...');

    const result = await this.prisma.otp.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Deleted ${result.count} expired OTPs.`);
  }

  onModuleInit() {
    void this.cleanupExpiredOtps();
  }
}
