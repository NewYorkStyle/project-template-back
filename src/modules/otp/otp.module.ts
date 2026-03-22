import {Module} from '@nestjs/common';

import {OtpCleanupService} from './services/otp-cleanup.service';
import {OtpService} from './services/otp.service';

@Module({
  exports: [OtpService],
  providers: [OtpService, OtpCleanupService],
})
export class OtpModule {}
