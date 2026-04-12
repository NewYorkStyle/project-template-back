/**
 * Проверяет, что компоненты из Zod совпадают с набором схем,
 * на которые ссылаются контроллеры через $ref (без лишних и без пропусков).
 */
import '../src/common/zod-openapi';
import '../src/common/register-zod-schemas';
import {generateOpenApiComponents} from '../src/common/zod-openapi';

const REQUIRED_SCHEMA_NAMES = [
  'AppParamsDto',
  'AuthSignOkResponseDto',
  'ChangePasswordDto',
  'ChangePasswordOkResponseDto',
  'DeleteUserDto',
  'DeleteUserOkResponseDto',
  'EmailChangeOkResponseDto',
  'EmailChangeRequestBodyDto',
  'EmailChangeRequestOkResponseDto',
  'HealthCheckOkResponseDto',
  'LogoutOkResponseDto',
  'OtpBodyDto',
  'OtpSentOkResponseDto',
  'OtpVerifiedOkResponseDto',
  'PermissionNamesDto',
  'RefreshOkResponseDto',
  'SignInDto',
  'SignUpDto',
  'TestCreateUserDto',
  'TestCreateUserOkResponseDto',
  'TestDeleteUserDto',
  'TestDeleteUserOkResponseDto',
  'TestGrantPermissionsDto',
  'TestGrantPermissionsOkResponseDto',
  'UpdateUserDto',
  'UserProfileDto',
  'UserUpdateResultDto',
] as const;

const components = generateOpenApiComponents().components?.schemas ?? {};
const keys = Object.keys(components).sort();

const requiredSet = new Set<string>(REQUIRED_SCHEMA_NAMES);
const keySet = new Set(keys);

const missing = [...requiredSet].filter((k) => !keySet.has(k));
const extra = keys.filter((k) => !requiredSet.has(k));

if (missing.length > 0 || extra.length > 0) {
  console.error('Zod OpenAPI registry mismatch with controller $ref set.');
  if (missing.length > 0) {
    console.error('Missing schemas:', missing.join(', '));
  }
  if (extra.length > 0) {
    console.error(
      'Extra schemas (не используются в декораторах):',
      extra.join(', ')
    );
  }
  process.exit(1);
}

console.log(`verify-zod-openapi: OK (${keys.length} components.schemas)`);
