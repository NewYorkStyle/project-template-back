import {authSignOkResponseSchema} from '../modules/auth/schemas/auth-sign-ok-response.schema';
import {signInSchema} from '../modules/auth/schemas/sign-in.schema';
import {signUpSchema} from '../modules/auth/schemas/sign-up.schema';
import {appParamsSchema} from '../modules/common/schemas/app-params.schema';
import {healthCheckOkResponseSchema} from '../modules/health/schemas/health-check-ok-response.schema';
import {
  testCreateUserOkResponseSchema,
  testCreateUserSchema,
  testDeleteUserOkResponseSchema,
  testGrantPermissionsOkResponseSchema,
  testDeleteUserSchema,
  testGrantPermissionsSchema,
} from '../modules/test/schemas/test-api.schema';
import {
  markTourSeenOkResponseSchema,
  markTourSeenSchema,
  tourResponseSchema,
  userToursListSchema,
} from '../modules/user-tours/schemas';
import {changePasswordSchema} from '../modules/users/schemas/change-password.schema';
import {deleteUserSchema} from '../modules/users/schemas/delete-user.schema';
import {emailChangeRequestBodySchema} from '../modules/users/schemas/email-change-request-body.schema';
import {otpBodySchema} from '../modules/users/schemas/otp-body.schema';
import {permissionNamesSchema} from '../modules/users/schemas/permission-names.schema';
import {updateUserSchema} from '../modules/users/schemas/update-user.schema';
import {userProfileSchema} from '../modules/users/schemas/user-profile.schema';
import {userUpdateResultSchema} from '../modules/users/schemas/user-update-result.schema';

import {
  deleteUserOkResponseSchema,
  changePasswordOkResponseSchema,
  emailChangeOkResponseSchema,
  emailChangeRequestOkResponseSchema,
  logoutOkResponseSchema,
  otpSentOkResponseSchema,
  otpVerifiedOkResponseSchema,
  refreshOkResponseSchema,
} from './schemas/http-ok-string-responses.schema';
import {registerSchema} from './zod-openapi';

registerSchema('AppParamsDto', appParamsSchema);
registerSchema('HealthCheckOkResponseDto', healthCheckOkResponseSchema);
registerSchema('ChangePasswordDto', changePasswordSchema);
registerSchema('ChangePasswordOkResponseDto', changePasswordOkResponseSchema);
registerSchema('DeleteUserDto', deleteUserSchema);
registerSchema('DeleteUserOkResponseDto', deleteUserOkResponseSchema);
registerSchema('EmailChangeOkResponseDto', emailChangeOkResponseSchema);
registerSchema(
  'EmailChangeRequestOkResponseDto',
  emailChangeRequestOkResponseSchema
);
registerSchema('EmailChangeRequestBodyDto', emailChangeRequestBodySchema);
registerSchema('LogoutOkResponseDto', logoutOkResponseSchema);
registerSchema('OtpBodyDto', otpBodySchema);
registerSchema('OtpSentOkResponseDto', otpSentOkResponseSchema);
registerSchema('OtpVerifiedOkResponseDto', otpVerifiedOkResponseSchema);
registerSchema('PermissionNamesDto', permissionNamesSchema);
registerSchema('RefreshOkResponseDto', refreshOkResponseSchema);
registerSchema('AuthSignOkResponseDto', authSignOkResponseSchema);
registerSchema('SignInDto', signInSchema);
registerSchema('SignUpDto', signUpSchema);
registerSchema('UpdateUserDto', updateUserSchema);
registerSchema('UserProfileDto', userProfileSchema);
registerSchema('UserUpdateResultDto', userUpdateResultSchema);
registerSchema('TestCreateUserDto', testCreateUserSchema);
registerSchema('TestCreateUserOkResponseDto', testCreateUserOkResponseSchema);
registerSchema('TestDeleteUserDto', testDeleteUserSchema);
registerSchema('TestDeleteUserOkResponseDto', testDeleteUserOkResponseSchema);
registerSchema('TestGrantPermissionsDto', testGrantPermissionsSchema);
registerSchema(
  'TestGrantPermissionsOkResponseDto',
  testGrantPermissionsOkResponseSchema
);
registerSchema('MarkTourSeenDto', markTourSeenSchema);
registerSchema('MarkTourSeenOkResponseDto', markTourSeenOkResponseSchema);
registerSchema('TourResponseDto', tourResponseSchema);
registerSchema('UserToursListDto', userToursListSchema);
