import {z} from 'zod';

export const signInSchema = z
  .object({
    password: z.string().openapi({
      description: 'User account password',
      example: 'Qwerty123',
    }),
    username: z.string().openapi({
      description: 'Unique username for sign in',
      example: 'john_doe',
    }),
  })
  .openapi('SignInDto');

export type TSignInDto = z.infer<typeof signInSchema>;
