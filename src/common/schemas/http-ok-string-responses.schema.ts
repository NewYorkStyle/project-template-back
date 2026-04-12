import {z} from 'zod';

/** Только для OpenAPI: успешные ответы-строки без дублирования inline-схем */

export const logoutOkResponseSchema = z
  .string()
  .openapi('LogoutOkResponseDto', {
    description: 'Successful logout message',
    example: 'User logged out',
  });

export const refreshOkResponseSchema = z
  .string()
  .openapi('RefreshOkResponseDto', {
    description: 'Successful token refresh message',
    example: 'Token refreshed',
  });

export const deleteUserOkResponseSchema = z
  .string()
  .openapi('DeleteUserOkResponseDto', {
    description: 'Successful user deletion message',
    example: 'User deleted',
  });

export const otpSentOkResponseSchema = z
  .string()
  .openapi('OtpSentOkResponseDto', {
    description: 'OTP generation and sending confirmation',
    example: 'OTP sent',
  });

export const otpVerifiedOkResponseSchema = z
  .string()
  .openapi('OtpVerifiedOkResponseDto', {
    description: 'OTP verification confirmation',
    example: 'OTP verified',
  });

export const emailChangeRequestOkResponseSchema = z
  .string()
  .openapi('EmailChangeRequestOkResponseDto', {
    description: 'Email change request confirmation',
    example: 'OTP for email change sent',
  });

export const emailChangeOkResponseSchema = z
  .string()
  .openapi('EmailChangeOkResponseDto', {
    description: 'Successful email change message',
    example: 'Email successfully changed',
  });

export const changePasswordOkResponseSchema = z
  .string()
  .openapi('ChangePasswordOkResponseDto', {
    description: 'Successful password change message',
    example: 'Password changed',
  });
