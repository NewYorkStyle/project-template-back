import {Otp} from './entities/otp.entity';
import {OtpCleanupService} from './services/otp-cleanup.service';
import {OtpService} from './services/otp.service';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  exports: [OtpService],
  imports: [TypeOrmModule.forFeature([Otp])],
  providers: [OtpService, OtpCleanupService],
})
export class OtpModule {}
