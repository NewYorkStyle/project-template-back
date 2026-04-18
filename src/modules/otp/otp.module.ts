import {Module} from '@nestjs/common';

import {OtpService} from './services/otp.service';

@Module({
  exports: [OtpService],
  providers: [OtpService],
})
export class OtpModule {}
