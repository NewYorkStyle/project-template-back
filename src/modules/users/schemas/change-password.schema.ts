import {z} from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().openapi({
      description: 'Текущий пароль',
      example: 'Qwerty123',
    }),
    newPassword: z.string().openapi({
      description: 'Новый пароль (те же правила, что при регистрации)',
      example: 'NewQwerty456',
    }),
  })
  .superRefine((data, ctx) => {
    const {currentPassword, newPassword} = data;

    if (!currentPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Current password is required',
        path: ['currentPassword'],
      });
    }

    if (!newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password is required',
        path: ['newPassword'],
      });
      return;
    }

    if (newPassword.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must be at least 8 characters long',
        path: ['newPassword'],
      });
    }

    if (!/[0-9]/.test(newPassword)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one number',
        path: ['newPassword'],
      });
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one lowercase',
        path: ['newPassword'],
      });
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one uppercase',
        path: ['newPassword'],
      });
    }
  })
  .openapi('ChangePasswordDto');

export type TChangePasswordDto = z.infer<typeof changePasswordSchema>;
