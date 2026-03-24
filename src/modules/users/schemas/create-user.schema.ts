import {z} from 'zod';

export const createUserSchema = z.object({
  email: z.string().openapi({
    description: 'User email address',
    example: 'test@mail.com',
  }),
  password: z.string().openapi({
    description: 'User password',
    example: 'Qwerty123',
  }),
  username: z.string().openapi({
    description: 'Unique username',
    example: 'john_doe',
  }),
});

export type TCreateUserDto = z.infer<typeof createUserSchema>;
