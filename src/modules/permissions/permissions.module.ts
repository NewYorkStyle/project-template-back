import {Module} from '@nestjs/common';

import {PermissionsService} from './services/permissions.service';

@Module({
  exports: [PermissionsService],
  providers: [PermissionsService],
})
export class PermissionsModule {}
