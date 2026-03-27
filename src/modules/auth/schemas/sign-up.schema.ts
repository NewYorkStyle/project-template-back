import {z} from 'zod';

const signUpEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const signUpSchema = z
  .object({
    email: z.string().openapi({
      description: 'User email address',
      example: 'test@mail.com',
    }),
    password: z.string().openapi({
      description: 'Password for new account',
      example: 'Qwerty123',
    }),
    username: z.string().openapi({
      description: 'Unique username for new account',
      example: 'john_doe',
    }),
  })
  .superRefine((data, ctx) => {
    const {email, password, username} = data;

    if (!email) {
      ctx.addIssue({
        code: 'custom',
        message: 'Email is required',
        path: ['email'],
      });
    }

    if (!signUpEmailPattern.test(email)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Wrong email',
        path: ['email'],
      });
    }

    if (!username) {
      ctx.addIssue({
        code: 'custom',
        message: 'Username is required',
        path: ['username'],
      });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Username must contain only letters, numbers, symbols "_" and "-"',
        path: ['username'],
      });
    }

    if (username.length < 3 || username.length > 20) {
      ctx.addIssue({
        code: 'custom',
        message: 'Username must contain from 3 to 20 characters',
        path: ['username'],
      });
    }

    if (!password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password is required',
        path: ['password'],
      });
    }

    if (password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must be at least 8 characters long',
        path: ['password'],
      });
    }

    if (!/[0-9]/.test(password)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one number',
        path: ['password'],
      });
    }

    if (!/(?=.*[a-z])/.test(password)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one lowercase',
        path: ['password'],
      });
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one uppercase',
        path: ['password'],
      });
    }
  })
  .openapi('SignUpDto');

export type TSignUpDto = z.infer<typeof signUpSchema>;
