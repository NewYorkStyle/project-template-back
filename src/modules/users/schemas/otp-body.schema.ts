import {z} from 'zod';

export const otpBodySchema = z
  .object({
    otp: z.string().openapi({
      description: 'One-time password code from email',
      example: '123456',
    }),
  })
  .openapi('OtpBodyDto');

export type TOtpBodyDto = z.infer<typeof otpBodySchema>;
